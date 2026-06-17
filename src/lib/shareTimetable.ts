import { FlattenedSubject, UserTimetable } from '../types/subject';

export interface SharedSubjectRef {
    c: string;
    g: string;
    t: string;
    i?: number;
}

export interface SharedTimetablePayload {
    v: 1;
    b: string;
    s: SharedSubjectRef[];
    n?: string; // optional student name
}

// Map base timetable IDs to single bytes for ultra-compact encoding
const BASE_ID_TO_BYTE: Record<string, number> = {
    'M1-EP': 0, 'M1-Normal': 1,
    'M2-EP': 2, 'M2-Normal': 3,
    'M3-EP': 4, 'M3-Normal': 5,
    'M4-Science': 6, 'M4-Arts': 7,
    'M5-Science': 8, 'M5-Arts': 9,
    'M6-Science': 10, 'M6-Arts': 11,
};

const BYTE_TO_BASE_ID: Record<number, string> = Object.fromEntries(
    Object.entries(BASE_ID_TO_BYTE).map(([k, v]) => [v, k])
);

// Compact base64url encoding for binary data
function toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Uint8Array {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Encode string as UTF-8 bytes with length prefix
function encodeString(str: string): number[] {
    const bytes = Array.from(new TextEncoder().encode(str));
    const len = bytes.length;
    if (len > 255) return [255, ...bytes.slice(0, 255)]; // Cap at 255 chars
    return [len, ...bytes];
}

// Decode string from bytes array
function decodeString(bytes: Uint8Array, offset: number): { value: string; nextOffset: number } {
    const len = bytes[offset];
    const strBytes = bytes.slice(offset + 1, offset + 1 + len);
    const value = new TextDecoder().decode(strBytes);
    return { value, nextOffset: offset + 1 + len };
}

function decodeGroup(bytes: Uint8Array, offset: number): { value: string; nextOffset: number } {
    const marker = bytes[offset];
    if (marker >= 0x80) {
        return { value: String(marker & 0x7f), nextOffset: offset + 1 };
    }

    return decodeString(bytes, offset);
}

function encodeSubjectIndex(index: number): number[] {
    if (index < 128) {
        return [index];
    }

    return [0x80 | (index & 0x7f), index >> 7];
}

function decodeSubjectIndex(bytes: Uint8Array, offset: number): { value: number; nextOffset: number } {
    const first = bytes[offset];
    if (first < 0x80) {
        return { value: first, nextOffset: offset + 1 };
    }

    if (offset + 1 >= bytes.length) {
        throw new Error('Missing subject index byte');
    }

    return { value: (first & 0x7f) | (bytes[offset + 1] << 7), nextOffset: offset + 2 };
}

function subjectIdentity(subject: FlattenedSubject): SharedSubjectRef {
    return {
        c: subject.code,
        g: subject.group || '',
        t: subject.classtime || '',
    };
}

function subjectRefKey(ref: SharedSubjectRef): string {
    return `${ref.c}||${ref.g}||${ref.t}`;
}

export function extractSharedSubjects(selectedElectives: UserTimetable): SharedSubjectRef[] {
    const seen = new Set<string>();
    const refs: SharedSubjectRef[] = [];

    for (const day of Object.keys(selectedElectives)) {
        for (const periodKey of Object.keys(selectedElectives[day])) {
            const period = Number(periodKey);
            const subject = selectedElectives[day]?.[period];
            if (!subject) {
                continue;
            }
            const ref = subjectIdentity(subject);
            const key = subjectRefKey(ref);
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            refs.push(ref);
        }
    }

    return refs;
}

function findCatalogIndex(subject: FlattenedSubject, catalog: FlattenedSubject[]): number {
    const exactKey = subjectRefKey(subjectIdentity(subject));
    const codeAndGroupKey = `${subject.code}||${subject.group}`;

    let fallbackIndex = -1;
    for (let i = 0; i < catalog.length; i++) {
        const catalogSubject = catalog[i];
        const catalogRef = subjectIdentity(catalogSubject);
        if (subjectRefKey(catalogRef) === exactKey) {
            return i;
        }
        if (fallbackIndex === -1 && `${catalogSubject.code}||${catalogSubject.group}` === codeAndGroupKey) {
            fallbackIndex = i;
        }
    }

    return fallbackIndex;
}

function extractSharedSubjectIndexes(selectedElectives: UserTimetable, catalog: FlattenedSubject[]): number[] | null {
    const seen = new Set<number>();
    const indexes: number[] = [];

    for (const day of Object.keys(selectedElectives)) {
        for (const periodKey of Object.keys(selectedElectives[day])) {
            const period = Number(periodKey);
            const subject = selectedElectives[day]?.[period];
            if (!subject) {
                continue;
            }

            const index = findCatalogIndex(subject, catalog);
            if (index < 0 || index > 0x3fff) {
                return null;
            }
            if (seen.has(index)) {
                continue;
            }
            seen.add(index);
            indexes.push(index);
        }
    }

    return indexes;
}

export function encodeTimetableShare(
    baseTimetableId: string,
    selectedElectives: UserTimetable,
    studentName?: string,
    catalog: FlattenedSubject[] = []
): string | null {
    if (!baseTimetableId) {
        return null;
    }

    const baseIdByte = BASE_ID_TO_BYTE[baseTimetableId];
    if (baseIdByte === undefined || catalog.length === 0) {
        return null;
    }

    const subjectIndexes = extractSharedSubjectIndexes(selectedElectives, catalog);
    if (!subjectIndexes) {
        return null;
    }

    // Current generated format:
    // [16 + baseId:1][count:1][catalog indexes...][studentName?]
    // Current grade catalogs fit in one byte per subject; two-byte indexes are supported.
    const count = Math.min(subjectIndexes.length, 255);
    const parts: number[] = [16 + baseIdByte, count];

    for (let i = 0; i < count; i++) {
        parts.push(...encodeSubjectIndex(subjectIndexes[i]));
    }

    if (studentName && studentName.trim()) {
        parts.push(...encodeString(studentName.trim()));
    }

    return toBase64Url(new Uint8Array(parts));
}

function decodeStudentName(bytes: Uint8Array, offset: number): string {
    if (offset >= bytes.length) return '';
    try {
        const result = decodeString(bytes, offset);
        return result.value || '';
    } catch {
        return '';
    }
}

export function decodeTimetableShare(token: string | null): SharedTimetablePayload | null {
    if (!token) {
        return null;
    }

    try {
        const bytes = fromBase64Url(token);

        if (bytes.length < 1) {
            return null;
        }

        let offset = 0;
        let count: number;
        let baseTimetableId: string;

        const firstByte = bytes[offset++];

        if (firstByte >= 16 && firstByte < 28) {
            const baseIdByte = firstByte - 16;
            baseTimetableId = BYTE_TO_BASE_ID[baseIdByte];
            if (!baseTimetableId) {
                return null;
            }

            if (offset >= bytes.length) {
                return null;
            }

            count = bytes[offset++];

            const subjects: SharedSubjectRef[] = [];
            for (let i = 0; i < count && offset < bytes.length; i++) {
                try {
                    const indexResult = decodeSubjectIndex(bytes, offset);
                    offset = indexResult.nextOffset;
                    subjects.push({
                        c: '',
                        g: '',
                        t: '',
                        i: indexResult.value,
                    });
                } catch {
                    break;
                }
            }

            const studentName = offset < bytes.length ? decodeStudentName(bytes, offset) : '';

            return {
                v: 1,
                b: baseTimetableId,
                s: subjects,
                n: studentName || undefined,
            };
        }

        if (firstByte >= 64 || (firstByte >= 48 && firstByte < 60)) {
            let baseIdByte: number;

            if (firstByte >= 64) {
                const packedHeader = firstByte - 64;
                baseIdByte = Math.floor(packedHeader / 16);
                count = packedHeader % 16;
            } else {
                baseIdByte = firstByte - 48;
                if (offset >= bytes.length) {
                    return null;
                }
                count = bytes[offset++];
            }

            baseTimetableId = BYTE_TO_BASE_ID[baseIdByte];
            if (!baseTimetableId) {
                return null;
            }

            const subjects: SharedSubjectRef[] = [];
            for (let i = 0; i < count && offset < bytes.length; i++) {
                try {
                    const codeResult = decodeString(bytes, offset);
                    offset = codeResult.nextOffset;

                    const groupResult = decodeGroup(bytes, offset);
                    offset = groupResult.nextOffset;

                    subjects.push({
                        c: codeResult.value,
                        g: groupResult.value,
                        t: '',
                    });
                } catch {
                    break;
                }
            }

            const studentName = offset < bytes.length ? decodeStudentName(bytes, offset) : '';

            return {
                v: 1,
                b: baseTimetableId,
                s: subjects,
                n: studentName || undefined,
            };
        }

        if (bytes.length < 3) {
            return null;
        }

        // Read version
        const version = firstByte;
        if (version !== 1 && version !== 2) {
            return null;
        }

        // Read base timetable ID
        if (version === 2) {
            // V2: Single byte base ID
            const baseIdByte = bytes[offset++];
            baseTimetableId = BYTE_TO_BASE_ID[baseIdByte];
            if (!baseTimetableId) {
                return null; // Unknown base ID
            }
        } else {
            // V1: String base ID
            const baseResult = decodeString(bytes, offset);
            baseTimetableId = baseResult.value;
            offset = baseResult.nextOffset;
        }

        if (offset >= bytes.length) {
            return null;
        }

        // Read subject count
        count = bytes[offset++];
        const subjects: SharedSubjectRef[] = [];

        // Read each subject
        for (let i = 0; i < count && offset < bytes.length; i++) {
            try {
                const codeResult = decodeString(bytes, offset);
                offset = codeResult.nextOffset;

                const groupResult = decodeString(bytes, offset);
                offset = groupResult.nextOffset;

                // V2: No classtime field (we add empty string for compatibility)
                // V1: Has classtime field
                let classtime = '';
                if (version === 1 && offset < bytes.length) {
                    const timeResult = decodeString(bytes, offset);
                    offset = timeResult.nextOffset;
                    classtime = timeResult.value;
                }

                subjects.push({
                    c: codeResult.value,
                    g: groupResult.value,
                    t: classtime,
                });
            } catch {
                break;
            }
        }

        // Read student name (v2 only, appended after subjects)
        let studentName = '';
        if (version === 2 && offset < bytes.length) {
            studentName = decodeStudentName(bytes, offset);
        }

        return {
            v: 1,
            b: baseTimetableId,
            s: subjects,
            n: studentName || undefined,
        };
    } catch {
        return null;
    }
}

export function resolveSharedSubjects(
    sharedRefs: SharedSubjectRef[],
    subjects: FlattenedSubject[]
): { resolved: FlattenedSubject[]; missing: SharedSubjectRef[] } {
    const byExact = new Map<string, FlattenedSubject>();
    const byCodeAndGroup = new Map<string, FlattenedSubject>();
    const byCode = new Map<string, FlattenedSubject>();

    for (const subject of subjects) {
        const ref = subjectIdentity(subject);
        byExact.set(subjectRefKey(ref), subject);
        byCodeAndGroup.set(`${subject.code}||${subject.group}`, subject);
        byCode.set(subject.code, subject);
    }

    const resolved: FlattenedSubject[] = [];
    const missing: SharedSubjectRef[] = [];

    for (const ref of sharedRefs) {
        if (typeof ref.i === 'number') {
            const indexed = subjects[ref.i];
            if (indexed) {
                resolved.push(indexed);
            } else {
                missing.push(ref);
            }
            continue;
        }

        const exact = byExact.get(subjectRefKey(ref));
        const fallbackGroup = byCodeAndGroup.get(`${ref.c}||${ref.g}`);
        const fallbackCode = byCode.get(ref.c);
        const match = exact || fallbackGroup || fallbackCode;

        if (match) {
            resolved.push(match);
        } else {
            missing.push(ref);
        }
    }

    return { resolved, missing };
}
