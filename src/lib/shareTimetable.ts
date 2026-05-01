import { FlattenedSubject, UserTimetable } from '../types/subject';

export interface SharedSubjectRef {
    c: string;
    g: string;
    t: string;
}

export interface SharedTimetablePayload {
    v: 1;
    b: string;
    s: SharedSubjectRef[];
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

export function encodeTimetableShare(baseTimetableId: string, selectedElectives: UserTimetable): string | null {
    if (!baseTimetableId) {
        return null;
    }

    const subjects = extractSharedSubjects(selectedElectives);

    // Ultra-compact binary format v2:
    // [version:1][baseIdByte:1][count:1][subjects...]
    // Each subject: [code:string][group:string] (removed classtime - redundant)
    const parts: number[] = [];

    // Version byte (v2 for new format)
    parts.push(2);

    // Base timetable ID as single byte
    const baseIdByte = BASE_ID_TO_BYTE[baseTimetableId];
    if (baseIdByte === undefined) {
        // Fallback: encode as string with v1 marker
        parts[0] = 1;
        parts.push(...encodeString(baseTimetableId));
    } else {
        parts.push(baseIdByte);
    }

    // Subject count (max 255)
    const count = Math.min(subjects.length, 255);
    parts.push(count);

    // Encode each subject (code + group only, skip classtime)
    for (let i = 0; i < count; i++) {
        const subj = subjects[i];
        parts.push(...encodeString(subj.c));  // code

        // Optimize group encoding - single digit = 1 byte
        const group = subj.g || '';
        if (group.length === 1 && group >= '0' && group <= '9') {
            parts.push(1, group.charCodeAt(0));
        } else {
            parts.push(...encodeString(group));
        }
    }

    return toBase64Url(new Uint8Array(parts));
}

export function decodeTimetableShare(token: string | null): SharedTimetablePayload | null {
    if (!token) {
        return null;
    }

    try {
        const bytes = fromBase64Url(token);

        if (bytes.length < 3) {
            return null;
        }

        let offset = 0;

        // Read version
        const version = bytes[offset++];
        if (version !== 1 && version !== 2) {
            return null;
        }

        // Read base timetable ID
        let baseTimetableId: string;

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
        const count = bytes[offset++];
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

        return {
            v: 1,
            b: baseTimetableId,
            s: subjects,
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
