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

function toBase64Url(input: string): string {
    const bytes = new TextEncoder().encode(input);
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): string {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
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
    const payload: SharedTimetablePayload = {
        v: 1,
        b: baseTimetableId,
        s: extractSharedSubjects(selectedElectives),
    };
    return toBase64Url(JSON.stringify(payload));
}

export function decodeTimetableShare(token: string | null): SharedTimetablePayload | null {
    if (!token) {
        return null;
    }

    try {
        const raw = fromBase64Url(token);
        const parsed = JSON.parse(raw) as Partial<SharedTimetablePayload>;
        if (parsed.v !== 1 || typeof parsed.b !== 'string' || !Array.isArray(parsed.s)) {
            return null;
        }

        const cleanedSubjects = parsed.s
            .filter((item): item is SharedSubjectRef => (
                item !== null &&
                typeof item === 'object' &&
                typeof item.c === 'string' &&
                typeof item.g === 'string' &&
                typeof item.t === 'string'
            ))
            .slice(0, 120);

        return {
            v: 1,
            b: parsed.b,
            s: cleanedSubjects,
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
