import { ParsedTimeSlot } from '../types/subject';

const DAY_MAP: Record<string, { name: string; index: number; thai: string }> = {
    'จ': { name: 'Monday', index: 0, thai: 'จันทร์' },
    'อ': { name: 'Tuesday', index: 1, thai: 'อังคาร' },
    'พ': { name: 'Wednesday', index: 2, thai: 'พุธ' },
    'พฤ': { name: 'Thursday', index: 3, thai: 'พฤหัสบดี' },
    'ศ': { name: 'Friday', index: 4, thai: 'ศุกร์' },
};

export const PERIOD_TIMES: Record<number, string> = {
    0: '07:40-08:30',
    1: '08:30-09:20',
    2: '09:20-10:10',
    3: '10:20-11:10',
    4: '11:10-12:00',
    5: '12:00-12:50', // Lunch
    6: '12:50-13:40',
    7: '13:50-14:40',
    8: '14:40-15:30',
    9: '15:30-16:20',
};

export function parseThaiTime(classtime: string): ParsedTimeSlot[] {
    if (!classtime || classtime.trim() === '') return [];

    const slots: ParsedTimeSlot[] = [];
    const parts = classtime.split(',').map(p => p.trim());

    for (const part of parts) {
        const match = part.match(/^([ก-ฮ]+)\.(\d+)(?:-(\d+))?/);
        if (!match) continue;

        const dayAbbrev = match[1];
        const startPeriod = parseInt(match[2], 10);
        const endPeriod = match[3] ? parseInt(match[3], 10) : startPeriod;
        const dayInfo = DAY_MAP[dayAbbrev];

        if (!dayInfo) continue;

        const periods: number[] = [];
        for (let i = startPeriod; i <= endPeriod; i++) {
            periods.push(i);
        }

        const startTime = PERIOD_TIMES[startPeriod]?.split('-')[0] || '??:??';
        const endTime = PERIOD_TIMES[endPeriod]?.split('-')[1] || '??:??';
        const timeRange = `${startTime}-${endTime}`;

        slots.push({
            day: dayInfo.name,
            dayAbbrev,
            dayIndex: dayInfo.index,
            periods,
            startPeriod,
            endPeriod,
            timeRange,
        });
    }

    return slots;
}
