import { BaseTimetable } from '../types/subject';

// Helper to create a day schedule
const createSchedule = (data: Record<string, Record<number, { code: string; name: string; type: 'core' | 'elective' | 'break' }>>) => data;

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export const DAY_NAMES_TH: Record<string, string> = {
    Monday: 'จันทร์',
    Tuesday: 'อังคาร',
    Wednesday: 'พุธ',
    Thursday: 'พฤหัสบดี',
    Friday: 'ศุกร์',
};

export const PERIODS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const BASE_TIMETABLES: Record<string, BaseTimetable> = {
    // M.1 EP
    'M1-EP': {
        id: 'M1-EP', label: 'ม.1 EP', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Elective', type: 'elective' },
                2: { code: '', name: 'Elective', type: 'elective' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            }
        })
    },
    // M.1 Normal
    'M1-Normal': {
        id: 'M1-Normal', label: 'ม.1 ปกติ', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Elective', type: 'elective' },
                8: { code: '', name: 'Elective', type: 'elective' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Elective', type: 'elective' },
                2: { code: '', name: 'Elective', type: 'elective' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Elective', type: 'elective' },
                8: { code: '', name: 'Elective', type: 'elective' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            }
        })
    },
    // M.2 EP
    'M2-EP': {
        id: 'M2-EP', label: 'ม.2 EP', grade: 2, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            }
        })
    },
    // M.2 Normal
    'M2-Normal': {
        id: 'M2-Normal', label: 'ม.2 ปกติ', grade: 2, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Elective', type: 'elective' },
                2: { code: '', name: 'Elective', type: 'elective' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Elective', type: 'elective' },
                8: { code: '', name: 'Elective', type: 'elective' }
            }
        })
    },
    // M.3 EP
    'M3-EP': {
        id: 'M3-EP', label: 'ม.3 EP', grade: 3, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            }
        })
    },
    // M.3 Normal
    'M3-Normal': {
        id: 'M3-Normal', label: 'ม.3 ปกติ', grade: 3, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Elective', type: 'elective' },
                8: { code: '', name: 'Elective', type: 'elective' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Core', type: 'core' },
                2: { code: '', name: 'Core', type: 'core' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Elective', type: 'elective' },
                6: { code: '', name: 'Elective', type: 'elective' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'Elective', type: 'elective' },
                2: { code: '', name: 'Elective', type: 'elective' },
                3: { code: '', name: 'Core', type: 'core' },
                4: { code: '', name: 'พักเที่ยง', type: 'break' },
                5: { code: '', name: 'Core', type: 'core' },
                6: { code: '', name: 'Core', type: 'core' },
                7: { code: '', name: 'Core', type: 'core' },
                8: { code: '', name: 'Core', type: 'core' }
            }
        })
    }
};
