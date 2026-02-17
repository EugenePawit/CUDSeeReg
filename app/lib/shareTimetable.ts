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

    // Binary format: [version:1][baseId:string][count:1][subjects...]
    // Each subject: [code:string][group:string][time:string]
    const parts: number[] = [];

    // Version byte
    parts.push(1);

    // Base timetable ID
    parts.push(...encodeString(baseTimetableId));

    // Subject count (max 255)
    const count = Math.min(subjects.length, 255);
    parts.push(count);

    // Encode each subject compactly
    for (let i = 0; i < count; i++) {
        const subj = subjects[i];
        parts.push(...encodeString(subj.c));  // code
        parts.push(...encodeString(subj.g));  // group
        parts.push(...encodeString(subj.t));  // classtime
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
        if (version !== 1) {
            return null;
        }

        // Read base timetable ID
        const baseResult = decodeString(bytes, offset);
        const baseTimetableId = baseResult.value;
        offset = baseResult.nextOffset;

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

                const timeResult = decodeString(bytes, offset);
                offset = timeResult.nextOffset;

                subjects.push({
                    c: codeResult.value,
                    g: groupResult.value,
                    t: timeResult.value,
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
