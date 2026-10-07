import catalog from '../data/subjects-2569-2.json';
import type { Subject } from '@/types/subject';

export const BUNDLED_TERM_ID = '2569/2';

export function getBundledSubjects(termId: string, grade: string): Subject[] {
    if (termId !== BUNDLED_TERM_ID) return [];
    return (catalog as Record<string, Subject[]>)[grade] ?? [];
}

export function isBundledSubject(termId: string, grade: string, subject: Subject): boolean {
    return getBundledSubjects(termId, grade).some(item => JSON.stringify(item) === JSON.stringify(subject));
}
