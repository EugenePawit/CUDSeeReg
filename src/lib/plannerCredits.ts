import type { UserTimetable } from '@/types/subject';

export function parseCredit(value: string): number | null {
    const normalized = value.trim();
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
    const credit = Number(normalized);
    return Number.isFinite(credit) ? credit : null;
}

export function summarizePlannerCredits(timetable: UserTimetable) {
    const seen = new Set<string>();
    const courses = Object.values(timetable).flatMap(day => Object.values(day))
        .filter(subject => {
            const key = `${subject.code}||${subject.group || ''}||${subject.classtime || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .map(subject => ({ subject, credit: parseCredit(subject.credit) }));

    return {
        courses,
        total: Number(courses.reduce((sum, course) => sum + (course.credit ?? 0), 0).toFixed(10)),
        unknownCount: courses.filter(course => course.credit === null).length,
    };
}
