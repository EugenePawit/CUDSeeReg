import type { BaseTimetable, FlattenedSubject } from '@/types/subject';
import { parseThaiTime } from './thaiTimeParser';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const THAI_DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];

// Grey elective cells transcribed from the supplied 2/2569 schedules.
// BC periods remain electives for students who do not attend British Council.
const ELECTIVES: Record<string, number[][]> = {
    'M1-EP': [[5, 6], [], [], [5, 6], []],
    'M1-Normal': [[5, 6], [], [7, 8], [5, 6], [1, 2]],
    'M2-EP': [[], [], [], [5, 6], [7, 8]],
    'M2-Normal': [[], [7, 8], [2, 3], [5, 6], [7, 8]],
    'M3-EP': [[], [], [], [5, 6], [2, 3]],
    'M3-Normal': [[7, 8], [5, 6], [], [5, 6], [2, 3]],
    'M4-Science': [[1, 2, 6], [4, 7, 8], [1, 2, 3, 4], [3, 4, 7, 8], [1, 2, 6, 7, 8]],
    'M4-Arts': [[2, 6], [4, 7, 8], [1, 2], [3, 4, 7, 8], [1, 2, 6, 7, 8]],
    'M5-Science': [[3, 4, 7, 8], [1, 2, 4], [3, 4, 7, 8], [1, 2, 7, 8], [3, 4, 6]],
    'M5-Arts': [[3, 4], [1, 2, 4], [3, 4, 7, 8], [1, 2, 7, 8], [3, 4]],
    'M6-Science': [[1, 2, 3, 4, 7, 8], [4, 6], [1, 2, 3, 4], [1, 2, 6, 7, 8], [1, 2, 4, 7, 8]],
    'M6-Arts': [[1, 2, 3, 4, 7, 8], [4, 6], [1, 2, 3, 4], [1, 2, 6, 7, 8], [1, 2, 4, 7, 8]],
};

// Source weekday/period → destination during 4 Nov–11 Dec 2569.
const MOVES: Record<number, Record<string, [string, number]>> = {
    4: { 'Tuesday:4': ['Thursday', 9], 'Tuesday:7': ['Monday', 8], 'Tuesday:8': ['Monday', 9],
         'Wednesday:1': ['Wednesday', 0], 'Wednesday:2': ['Wednesday', 1] },
    5: { 'Tuesday:1': ['Monday', 0], 'Tuesday:2': ['Monday', 1], 'Tuesday:4': ['Thursday', 9],
         'Wednesday:7': ['Wednesday', 8], 'Wednesday:8': ['Wednesday', 9] },
    6: { 'Monday:1': ['Monday', 0], 'Monday:2': ['Monday', 1], 'Tuesday:4': ['Thursday', 9],
         'Tuesday:6': ['Wednesday', 9], 'Thursday:1': ['Thursday', 0], 'Thursday:2': ['Thursday', 1] },
};

export const TIMETABLES_2569_2: Record<string, BaseTimetable> = Object.fromEntries(
    Object.entries(ELECTIVES).map(([baseId, electives]) => {
        const grade = Number(baseId[1]);
        const program = baseId.split('-')[1];
        const label = ({ EP: 'EP', Normal: 'ปกติ', Science: 'วิทย์-คณิต', Arts: 'ศิลป์' } as Record<string, string>)[program];
        const id = `${baseId}-2569-2`;
        const schedule: BaseTimetable['schedule'] = {};
        DAYS.forEach((day, i) => {
            schedule[day] = {};
            for (let period = 0; period <= 9; period++) {
                schedule[day][period] = period === (grade <= 3 ? 4 : 5)
                    ? { code: '', name: 'พักเที่ยง', type: 'break' }
                    : electives[i].includes(period)
                        ? { code: '', name: 'วิชาเลือก', type: 'elective' }
                        : { code: '', name: period === 0 ? 'Homeroom' : period === 9 ? 'ไม่มีเรียน' : '', type: 'core' };
            }
        });
        return [id, { id, label: `ม.${grade} ${label}`, grade, termId: '2569/2', schedule }];
    })
);

export function supportsMilitarySchedule(timetable: BaseTimetable | null): boolean {
    return timetable?.termId === '2569/2' && timetable.grade >= 4;
}

export function militaryTimetable(timetable: BaseTimetable): BaseTimetable {
    if (!supportsMilitarySchedule(timetable)) return timetable;
    const schedule = structuredClone(timetable.schedule);
    const moves = MOVES[timetable.grade];
    // Clear all sources first: destinations can also be sources (e.g. Wed 8).
    for (const source of Object.keys(moves)) {
        const [day, period] = source.split(':');
        schedule[day][Number(period)] = { code: '', name: '', type: 'core' };
    }
    for (const day of DAYS.slice(0, 4)) schedule[day][0] = { code: '', name: '', type: 'core' };
    for (let period = 0; period <= 9; period++) {
        schedule.Tuesday[period] = { code: '', name: 'ร.ด.', type: 'core' };
    }
    for (const [source, [day, period]] of Object.entries(moves)) {
        const [sourceDay, sourcePeriod] = source.split(':');
        schedule[day][period] = { ...timetable.schedule[sourceDay][Number(sourcePeriod)] };
    }
    return { ...timetable, schedule };
}

export function subjectForSchedule(subject: FlattenedSubject, grade: number, military: boolean): FlattenedSubject {
    // Class time remains the canonical catalog identity; only the rendered slots move.
    const slots = parseThaiTime(subject.classtime);
    if (!military || !MOVES[grade]) return { ...subject, parsedTimeSlots: slots };
    const times = slots.flatMap(slot => slot.periods.map(period => {
        const [day, movedPeriod] = MOVES[grade][`${slot.day}:${period}`] ?? [slot.day, period];
        return `${THAI_DAYS[DAYS.indexOf(day)]} ${movedPeriod}`;
    }));
    return { ...subject, parsedTimeSlots: parseThaiTime(times.join(', ')) };
}

export function fitsTimetable(subject: FlattenedSubject, timetable: BaseTimetable): boolean {
    return subject.parsedTimeSlots.length > 0 && subject.parsedTimeSlots.every(slot =>
        slot.periods.every(period => timetable.schedule[slot.day]?.[period]?.type === 'elective'));
}
