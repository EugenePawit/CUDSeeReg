import { expect, test } from 'bun:test';
import { TIMETABLES_2569_2, militaryTimetable, subjectForSchedule, fitsTimetable, supportsMilitarySchedule } from '../src/lib/timetables2569_2';
import { flattenSubjects } from '../src/lib/dataFetcher';
import { getBundledSubjects } from '../src/lib/bundledSubjects';
import { decodeTimetableShare, encodeTimetableShare, resolveSharedSubjects } from '../src/lib/shareTimetable';
import seed from '../server/src/seed-timetables.json';

test('all 12 schedules match the elective counts in the supplied images', () => {
    const counts = [4, 8, 4, 8, 4, 8, 19, 16, 18, 15, 22, 22];
    expect(Object.values(TIMETABLES_2569_2)).toHaveLength(12);
    Object.values(TIMETABLES_2569_2).forEach((tt, i) => {
        expect(Object.values(tt.schedule).flatMap(day => Object.values(day)).filter(e => e.type === 'elective'))
            .toHaveLength(counts[i]);
        expect(seed[tt.id as keyof typeof seed]).toEqual(tt);
        if (tt.grade >= 4) {
            const military = militaryTimetable(tt);
            expect(Object.values(military.schedule).flatMap(day => Object.values(day)).filter(e => e.type === 'elective'))
                .toHaveLength(counts[i]);
            expect(Object.values(military.schedule.Tuesday).every(e => e.name === 'ร.ด.')).toBe(true);
        } else {
            expect(supportsMilitarySchedule(tt)).toBe(false);
            expect(militaryTimetable(tt)).toBe(tt);
        }
    });
});

test('the normal and military elective cells match all six upper-grade images', () => {
    const expected: Record<string, number[][]> = {
        'M4-Science': [[1, 2, 6, 8, 9], [], [0, 1, 3, 4], [3, 4, 7, 8, 9], [1, 2, 6, 7, 8]],
        'M4-Arts': [[2, 6, 8, 9], [], [0, 1], [3, 4, 7, 8, 9], [1, 2, 6, 7, 8]],
        'M5-Science': [[0, 1, 3, 4, 7, 8], [], [3, 4, 8, 9], [1, 2, 7, 8, 9], [3, 4, 6]],
        'M5-Arts': [[0, 1, 3, 4], [], [3, 4, 8, 9], [1, 2, 7, 8, 9], [3, 4]],
        'M6-Science': [[0, 1, 3, 4, 7, 8], [], [1, 2, 3, 4, 9], [0, 1, 6, 7, 8, 9], [1, 2, 4, 7, 8]],
        'M6-Arts': [[0, 1, 3, 4, 7, 8], [], [1, 2, 3, 4, 9], [0, 1, 6, 7, 8, 9], [1, 2, 4, 7, 8]],
    };
    for (const [id, days] of Object.entries(expected)) {
        const tt = militaryTimetable(TIMETABLES_2569_2[`${id}-2569-2`]);
        expect(Object.values(tt.schedule).map(day => Object.entries(day).filter(([, entry]) => entry.type === 'elective')
            .map(([period]) => Number(period)))).toEqual(days);
    }
});

test('every eligible catalog group survives normal → military → normal without overlaps', () => {
    for (const tt of Object.values(TIMETABLES_2569_2).filter(t => t.grade >= 4)) {
        const military = militaryTimetable(tt);
        const subjects = flattenSubjects(getBundledSubjects('2569/2', String(tt.grade)));
        for (const subject of subjects.filter(s => fitsTimetable(s, tt))) {
            const moved = subjectForSchedule(subject, tt.grade, true);
            expect(fitsTimetable(moved, military)).toBe(true);
            expect(moved.parsedTimeSlots.some(s => s.day === 'Tuesday')).toBe(false);
            expect(subjectForSchedule(moved, tt.grade, false)).toEqual(subject);
            const count = moved.parsedTimeSlots.reduce((n, s) => n + s.periods.length, 0);
            expect(count).toBe(subject.parsedTimeSlots.reduce((n, s) => n + s.periods.length, 0));
        }
    }
});

test('multi-day groups move simultaneously and share links preserve term, mode, and identity', () => {
    const subjects = flattenSubjects(getBundledSubjects('2569/2', '5'));
    const original = subjects.find(s => s.code === 'ค32234')!;
    const moved = subjectForSchedule(original, 5, true);
    expect(moved.parsedTimeSlots.flatMap(s => s.periods.map(p => `${s.day}:${p}`))).toEqual([
        'Thursday:9', 'Wednesday:8', 'Friday:3', 'Friday:4',
    ]);
    const selected = Object.fromEntries(moved.parsedTimeSlots.map(slot => [slot.day,
        Object.fromEntries(slot.periods.map(p => [p, moved]))]));
    const token = encodeTimetableShare('M5-Science-2569-2', selected, 'ทดสอบ', subjects, true)!;
    const payload = decodeTimetableShare(token)!;
    expect(payload.term).toBe('2569/2');
    expect(payload.military).toBe(true);
    expect(payload.n).toBe('ทดสอบ');
    expect(payload.s).toHaveLength(1);
    expect(resolveSharedSubjects(payload.s, subjects).resolved).toEqual([original]);
    const old = encodeTimetableShare('M5-Science', {}, '', subjects)!;
    expect(decodeTimetableShare(old)?.b).toBe('M5-Science');
});
