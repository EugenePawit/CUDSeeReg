import { ParsedTimeSlot } from '../types/subject';

const DAY_MAP: Record<string, { name: string; index: number; abbrev: string }> = {
    'จันทร์': { name: 'Monday', index: 0, abbrev: 'จ' },
    'อังคาร': { name: 'Tuesday', index: 1, abbrev: 'อ' },
    'พุธ': { name: 'Wednesday', index: 2, abbrev: 'พ' },
    'พฤหัสบดี': { name: 'Thursday', index: 3, abbrev: 'พฤ' },
    'ศุกร์': { name: 'Friday', index: 4, abbrev: 'ศ' },
};

// Also support abbreviated day names for backwards compatibility
const DAY_ABBREV_MAP: Record<string, { name: string; index: number; abbrev: string }> = {
    'จ': { name: 'Monday', index: 0, abbrev: 'จ' },
    'อ': { name: 'Tuesday', index: 1, abbrev: 'อ' },
    'พ': { name: 'Wednesday', index: 2, abbrev: 'พ' },
    'พฤ': { name: 'Thursday', index: 3, abbrev: 'พฤ' },
    'ศ': { name: 'Friday', index: 4, abbrev: 'ศ' },
};

export const PERIOD_TIMES: Record<number, string> = {
    0: '07:40-08:30',
    1: '08:30-09:20',
    2: '09:20-10:10',
    3: '10:20-11:10',
    4: '11:10-12:00',
    5: '12:50-13:40',
    6: '13:50-14:40',
    7: '14:40-15:30',
    8: '15:30-16:20',
};

export function parseThaiTime(classtime: string): ParsedTimeSlot[] {
    if (!classtime || classtime.trim() === '') return [];

    const slots: ParsedTimeSlot[] = [];
    const parts = classtime.split(',').map(p => p.trim());

    // Group periods by day
    const dayPeriods = new Map<string, number[]>();

    for (const part of parts) {
        // Try new format first: "พฤหัสบดี 5" (full Thai day name + space + period)
        let matched = false;
        for (const [fullDay, dayInfo] of Object.entries(DAY_MAP)) {
            if (part.startsWith(fullDay)) {
                const rest = part.slice(fullDay.length).trim();
                const periodMatch = rest.match(/^(\d+)(?:-(\d+))?/);
                if (periodMatch) {
                    const startPeriod = parseInt(periodMatch[1], 10);
                    const endPeriod = periodMatch[2] ? parseInt(periodMatch[2], 10) : startPeriod;
                    const key = fullDay;
                    if (!dayPeriods.has(key)) {
                        dayPeriods.set(key, []);
                    }
                    for (let i = startPeriod; i <= endPeriod; i++) {
                        dayPeriods.get(key)!.push(i);
                    }
                    matched = true;
                    break;
                }
            }
        }

        if (matched) continue;

        // Try old format: "จ.5-6" (abbreviated day + dot + period range)
        const oldMatch = part.match(/^([ก-ฮ]+)\.(\d+)(?:-(\d+))?/);
        if (oldMatch) {
            const dayAbbrev = oldMatch[1];
            const startPeriod = parseInt(oldMatch[2], 10);
            const endPeriod = oldMatch[3] ? parseInt(oldMatch[3], 10) : startPeriod;
            const dayInfo = DAY_ABBREV_MAP[dayAbbrev];
            if (dayInfo) {
                // Find full day name for this abbreviation
                const fullDay = Object.entries(DAY_MAP).find(([, info]) => info.abbrev === dayAbbrev)?.[0] || dayAbbrev;
                if (!dayPeriods.has(fullDay)) {
                    dayPeriods.set(fullDay, []);
                }
                for (let i = startPeriod; i <= endPeriod; i++) {
                    dayPeriods.get(fullDay)!.push(i);
                }
            }
        }
    }

    // Convert grouped periods into ParsedTimeSlots
    for (const [fullDay, periods] of dayPeriods.entries()) {
        const dayInfo = DAY_MAP[fullDay];
        if (!dayInfo || periods.length === 0) continue;

        const sorted = [...new Set(periods)].sort((a, b) => a - b);
        const startPeriod = sorted[0];
        const endPeriod = sorted[sorted.length - 1];

        const startTime = PERIOD_TIMES[startPeriod]?.split('-')[0] || '??:??';
        const endTime = PERIOD_TIMES[endPeriod]?.split('-')[1] || '??:??';
        const timeRange = `${startTime}-${endTime}`;

        slots.push({
            day: dayInfo.name,
            dayAbbrev: dayInfo.abbrev,
            dayIndex: dayInfo.index,
            periods: sorted,
            startPeriod,
            endPeriod,
            timeRange,
        });
    }

    return slots;
}
