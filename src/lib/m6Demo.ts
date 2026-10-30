import type { BaseTimetable } from '@/types/subject';
import { TIMETABLES_2569_2, militaryTimetable } from './timetables2569_2';

// Timetables transcribed from the seven variants in the supplied M.6 PDF.
const names: Record<string, string> = {
 T: 'ภาษาไทย 12', M: 'คณิตศาสตร์พื้นฐาน 12', E: 'ภาษาอังกฤษ', B: 'ภาษาอังกฤษ BC',
 F: 'เติมเต็มภาษาอังกฤษ', G: 'เติมเต็มภาษาอังกฤษ BC', H: 'ประวัติศาสตร์โลก 2',
 D: 'ชีวิตและสังคมในโลกดิจิทัล', A: 'สาธิตจุฬาฯ สู่วิถีพลเมืองอาเซียน',
 P: 'สุขศึกษาและพลศึกษา', R: 'ศิลปะ', C: 'กิจกรรมแนะแนว 12',
 X: 'CUD-EP คณิตศาสตร์พื้นฐาน 12', Y: 'CUD-EP ภาษาอังกฤษ 12', Z: 'CUD-EP เติมเต็มภาษาอังกฤษ 9',
};
type Rows = string[][];
// Each token is period followed by the subject key. Blank cells remain as in the base timetable.
const variants: [string, string, Rows, Rows][] = [
 ['1','วิทยาศาสตร์', [['6A'],['1H','2T','3D','7E','8C'],['6M','7E','8P'],['3T','4M'],['3F','6R']], [['2A','6C','9D'],[],['0T','6M','7P','8E'],['2H','3T','4E'],['3F','6R','9M']]],
 ['2','วิทยาศาสตร์', [['6E'],['1C','2H','3T','7F','8M'],['6E','7R','8T'],['3D','4P'],['3M','6A']], [['2D','6M','9E'],[],['0C','6E','7R','8T'],['2H','3T','4F'],['3M','6A','9P']]],
 ['3','วิทยาศาสตร์ BC', [['6C'],['1H','2M','3G','7T','8R'],['6T','7D','8M'],['3B','4P'],['3A','6B']], [['2H','6A','9R'],[],['0G','6T','7M','8D'],['2M','3B','4T'],['3C','6B','9P']]],
 ['4-BC','วิทยาศาสตร์ BC', [['6D'],['1T','2M','3B','7C','8A'],['6T','7P','8M'],['3B','4H'],['3R','6G']], [['2T','6D','9C'],[],['0B','6T','7M','8P'],['2M','3B','4H'],['3A','6G','9R']]],
 ['4-EP','วิทยาศาสตร์ EP', [['6D'],['1T','2X','3Y','7C','8A'],['6T','7P','8X'],['3Y','4H'],['3R','6Z']], [['2T','6D','9C'],[],['0Y','6T','7X','8P'],['2X','3Y','4H'],['3A','6Z','9R']]],
 ['5','ศิลปศาสตร์ BC', [['6M'],['1T','2C','3B','7R','8A'],['6M','7D','8P'],['3G','4T'],['3H','6B']], [['2T','6R','9M'],[],['0B','6M','7P','8D'],['2T','3G','4C'],['3H','6B','9A']]],
 ['6','ศิลปศาสตร์', [['6D'],['1A','2T','3M','7R','8E'],['6H','7P','8F'],['3T','4E'],['3C','6M']], [['2E','6R','9C'],[],['0T','6H','7E','8P'],['2F','3M','4T'],['3D','6M','9A']]],
];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
function overlay(base: BaseTimetable, rows: Rows): BaseTimetable {
 const schedule = Object.fromEntries(Object.entries(base.schedule).map(([day, periods]) => [day, Object.fromEntries(Object.entries(periods).map(([period, entry]) => [period, { ...entry }]))]));
 rows.forEach((row, index) => row.forEach(token => { const period = Number(token[0]); schedule[days[index]][period] = { code: '', name: names[token.slice(1)], type: 'core' }; }));
 return { ...base, schedule };
}
export const M6_DEMO_TIMETABLES: Record<string, BaseTimetable> = {};
export const M6_DEMO_MILITARY: Record<string, BaseTimetable> = {};
for (const [room, _program, normal, military] of variants) {
 const template = TIMETABLES_2569_2[room === '5' || room === '6' ? 'M6-Arts-2569-2' : 'M6-Science-2569-2'];
 const id = `M6-Room${room}-2569-2`;
 const label = `ม.6/${room.replace('-BC', '').replace('-EP', ' EP')}`;
 const base = { ...template, id, label };
 M6_DEMO_TIMETABLES[id] = overlay(base, normal);
 M6_DEMO_MILITARY[id] = overlay(militaryTimetable(base), military);
}
