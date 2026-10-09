import type { BaseTimetable, UserTimetable } from '@/types/subject';

// Minimum elective credits from the supplied term 2/2569 schedules.
// Normal lower-secondary requirements assume the student is not enrolled in BC.
const MINIMUM_CREDITS: Record<string, number> = {
    'M1-EP-2569-2': 1.5, 'M1-Normal-2569-2': 3.5,
    'M2-EP-2569-2': 1.5, 'M2-Normal-2569-2': 3.5,
    'M3-EP-2569-2': 1.5, 'M3-Normal-2569-2': 3.5,
    'M4-Science-2569-2': 8.5, 'M4-Arts-2569-2': 7,
    'M5-Science-2569-2': 8, 'M5-Arts-2569-2': 6.5,
    'M6-Science-2569-2': 9, 'M6-Arts-2569-2': 9,
};

export function minimumElectiveCredits(timetable: BaseTimetable | null): number | null {
    if (timetable?.termId !== '2569/2') return null;
    return MINIMUM_CREDITS[timetable.id] ?? null;
}

export function selectedElectiveCredits(timetable: UserTimetable): { total: number; complete: boolean } {
    const seen = new Set<string>();
    let total = 0;
    let complete = true;
    for (const subject of Object.values(timetable).flatMap(day => Object.values(day))) {
        const key = `${subject.code}||${subject.group || ''}||${subject.classtime || ''}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const value = subject.credit.trim();
        const credit = Number(value);
        if (!/^\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(credit)) {
            complete = false;
            continue;
        }
        total += credit;
    }
    return { total: Number(total.toFixed(10)), complete };
}
