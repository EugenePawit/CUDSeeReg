import type { BaseTimetable } from '@/types/subject';
import catalog from '@/data/timetables-m3-m5-demo.json';
import { TIMETABLES_2569_2, militaryTimetable } from './timetables2569_2';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
type Rows = Record<string, string | undefined>[];
function overlay(base: BaseTimetable, rows: Rows): BaseTimetable {
    const schedule: BaseTimetable['schedule'] = Object.fromEntries(Object.entries(base.schedule).map(([day, periods]) =>
        [day, Object.fromEntries(Object.entries(periods).map(([period, entry]) => [period, { ...entry }]))]));
    rows.forEach((row, day) => Object.entries(row).forEach(([period, name]) => {
        if (name) schedule[days[day]][Number(period)] = { code: '', name, type: 'core' };
    }));
    return { ...base, schedule };
}
export const M3_M5_DEMO_TIMETABLES: Record<string, BaseTimetable> = {};
export const M3_M5_DEMO_MILITARY: Record<string, BaseTimetable> = {};
for (const entry of catalog) {
    const [grade, room, ep] = entry.key;
    const id = `M${grade}-Room${room}${ep && Number(grade) > 3 ? '-EP' : ''}-2569-2`;
    const base = { ...TIMETABLES_2569_2[`M${grade}-${entry.program}-2569-2`], id,
        label: `ม.${grade}/${room}${ep && Number(grade) > 3 ? ' EP' : ''}` };
    M3_M5_DEMO_TIMETABLES[id] = overlay(base, entry.normal);
    if (entry.military) M3_M5_DEMO_MILITARY[id] = overlay(militaryTimetable(base), entry.military);
}
