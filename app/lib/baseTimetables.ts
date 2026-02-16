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

export const PERIODS = [0, 1, 2, 3, 5, 6, 7, 8];

export const BASE_TIMETABLES: Record<string, BaseTimetable> = {
    'M2-1': {
        id: 'M2-1', label: 'ม.2/1', grade: 2, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP ภาษาอังกฤษ 4', type: 'core' },
                2: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                3: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP วิทยาศาสตร์ 4', type: 'core' },
                6: { code: '', name: 'CUD-EP วิทยาศาสตร์ 4', type: 'core' },
                7: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                8: { code: '', name: 'ลส.-นน.', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP ภาษาอังกฤษ 4', type: 'core' },
                2: { code: '', name: 'CUD-EP วิทยาศาสตร์ 4', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                7: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                8: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 4', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                2: { code: '', name: 'สุขศึกษา', type: 'core' },
                3: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                6: { code: '', name: 'CUD-EP คณิตศาสตร์เพิ่มเติม 4', type: 'core' },
                7: { code: '', name: 'พลศึกษา', type: 'core' },
                8: { code: '', name: 'CUD-EP เสริมทักษะ ภาษาอังกฤษ 4', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                2: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                3: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'CUD-EP วิทยาศาสตร์ 4', type: 'core' },
                8: { code: '', name: 'CUD-EP ภาษาอังกฤษ 4', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP เสริมทักษะ ภาษาอังกฤษ 4', type: 'core' },
                2: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                3: { code: '', name: 'แนะแนว 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การงานอาชีพ 4', type: 'core' },
                6: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                7: { code: '', name: 'CUD-EP วิทยาศาสตร์เพิ่มเติม 4', type: 'core' },
                8: { code: '', name: 'สังคมศึกษาฯ', type: 'core' }
            }
        })
    },
    'M2-2': {
        id: 'M2-2', label: 'ม.2/2', grade: 2, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP วิทยาศาสตร์ 4', type: 'core' },
                2: { code: '', name: 'CUD-EP วิทยาศาสตร์ 4', type: 'core' },
                3: { code: '', name: 'CUD-EP ภาษาอังกฤษ 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                6: { code: '', name: 'ลส.-นน.', type: 'core' },
                7: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 4', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP วิทยาศาสตร์ 4', type: 'core' },
                2: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'CUD-EP เสริมทักษะ ภาษาอังกฤษ 4', type: 'core' },
                8: { code: '', name: 'พลศึกษา', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'การงานอาชีพ 4', type: 'core' },
                3: { code: '', name: 'CUD-EP เสริมทักษะ ภาษาอังกฤษ 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                6: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                7: { code: '', name: 'CUD-EP คณิตศาสตร์เพิ่มเติม 4', type: 'core' },
                8: { code: '', name: 'แนะแนว 4', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                2: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                3: { code: '', name: 'CUD-EP วิทยาศาสตร์ 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'CUD-EP ภาษาอังกฤษ 4', type: 'core' },
                8: { code: '', name: 'สังคมศึกษาฯ', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                2: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                3: { code: '', name: 'CUD-EP ภาษาอังกฤษ 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                6: { code: '', name: 'สุขศึกษา', type: 'core' },
                7: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                8: { code: '', name: 'CUD-EP วิทยาศาสตร์เพิ่มเติม 4', type: 'core' }
            }
        })
    },
    'M2-3': {
        id: 'M2-3', label: 'ม.2/3', grade: 2, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                2: { code: '', name: 'แนะแนว 4', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                6: { code: '', name: 'ลส.-นน.', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'สังคมศึกษาฯ', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                2: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                3: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                6: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                7: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 4', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิชาเลือก', type: 'elective' },
                2: { code: '', name: 'วิชาเลือก', type: 'elective' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                6: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                7: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                8: { code: '', name: 'ทัศนศิลป์', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'การงานอาชีพ 4', type: 'core' },
                8: { code: '', name: 'สุขศึกษา', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                2: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                6: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                7: { code: '', name: 'วิชาเลือก', type: 'elective' },
                8: { code: '', name: 'วิชาเลือก', type: 'elective' }
            }
        })
    },
    'M2-4': {
        id: 'M2-4', label: 'ม.2/4', grade: 2, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                2: { code: '', name: 'สุขศึกษา', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                6: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ลส.-นน.', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                2: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                8: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิชาเลือก', type: 'elective' },
                2: { code: '', name: 'วิชาเลือก', type: 'elective' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                6: { code: '', name: 'แนะแนว 4', type: 'core' },
                7: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                8: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                8: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                2: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                6: { code: '', name: 'การงานอาชีพ 4', type: 'core' },
                7: { code: '', name: 'วิชาเลือก', type: 'elective' },
                8: { code: '', name: 'วิชาเลือก', type: 'elective' }
            }
        })
    },
    'M2-5': {
        id: 'M2-5', label: 'ม.2/5', grade: 2, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                2: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                3: { code: '', name: 'ลส.-นน.', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สุขศึกษา', type: 'core' },
                6: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                2: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                3: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                6: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                7: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 4', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิชาเลือก', type: 'elective' },
                2: { code: '', name: 'วิชาเลือก', type: 'elective' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                6: { code: '', name: 'แนะแนว 4', type: 'core' },
                7: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                8: { code: '', name: 'พลศึกษา', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                8: { code: '', name: 'การงานอาชีพ 4', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                2: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                6: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                7: { code: '', name: 'วิชาเลือก', type: 'elective' },
                8: { code: '', name: 'วิชาเลือก', type: 'elective' }
            }
        })
    },
    'M2-6': {
        id: 'M2-6', label: 'ม.2/6', grade: 2, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                2: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ลส.-นน.', type: 'core' },
                6: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'สังคมศึกษาฯ', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การงานอาชีพ 4', type: 'core' },
                2: { code: '', name: 'พลศึกษา', type: 'core' },
                3: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                6: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                7: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                8: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                6: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                7: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                8: { code: '', name: 'แนะแนว 4', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'สุขศึกษา', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 4', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                2: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                3: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                6: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                7: { code: '', name: 'วิชาเลือก', type: 'elective' },
                8: { code: '', name: 'วิชาเลือก', type: 'elective' }
            }
        })
    },
    'M2-7': {
        id: 'M2-7', label: 'ม.2/7', grade: 2, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                3: { code: '', name: 'แนะแนว 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ลส.-นน.', type: 'core' },
                6: { code: '', name: 'การงานอาชีพ 4', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                2: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                6: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                7: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                8: { code: '', name: 'สังคมศึกษาฯ', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิชาเลือก', type: 'elective' },
                2: { code: '', name: 'วิชาเลือก', type: 'elective' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                6: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                7: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 4', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ภาษาไทย 4', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'สุขศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                8: { code: '', name: 'พลศึกษา', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                2: { code: '', name: 'คณิตศาสตร์พื้นฐาน 4', type: 'core' },
                3: { code: '', name: 'วิทยาศาสตร์ 4', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                6: { code: '', name: 'การออกแบบและเทคโนโลยี', type: 'core' },
                7: { code: '', name: 'วิชาเลือก', type: 'elective' },
                8: { code: '', name: 'วิชาเลือก', type: 'elective' }
            }
        })
    }
    ,
    'M1-1': {
        id: 'M1-1', label: 'ม.1/1', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'แนะแนว 2', type: 'core' },
                2: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                6: { code: '', name: 'CUD-EP เสริมทักษะ ภาษาอังกฤษ 2', type: 'core' },
                7: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                8: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิชาเลือก', type: 'elective' },
                2: { code: '', name: 'วิชาเลือก', type: 'elective' },
                3: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP วิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'CUD-EP วิทยาศาสตร์ 2', type: 'core' },
                7: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' },
                8: { code: '', name: 'การงานอาชีพ 2', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP วิทยาศาสตร์ 2', type: 'core' },
                2: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                6: { code: '', name: 'CUD-EP เสริมทักษะ ภาษาอังกฤษ 2', type: 'core' },
                7: { code: '', name: 'CUD-EP ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP คณิตศาสตร์เพิ่มเติม 2', type: 'core' },
                6: { code: '', name: 'CUD-EP วิทยาศาสตร์เพิ่มเติม 2', type: 'core' },
                7: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' },
                2: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'ลส.-นน', type: 'core' },
                7: { code: '', name: 'สุขศึกษา', type: 'core' },
                8: { code: '', name: 'ประวัติศาสตร์', type: 'core' }
            }
        })
    }    ,
    'M1-2': {
        id: 'M1-2', label: 'ม.1/2', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: '', name: 'CUD-EP เสริมทักษะ ภาษาอังกฤษ 2', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP วิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'CUD-EP วิทยาศาสตร์ 2', type: 'core' },
                7: { code: '', name: 'แนะแนว 2', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                2: { code: '', name: 'CUD-EP ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                6: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' },
                7: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                8: { code: '', name: 'CUD-EP คณิตศาสตร์เพิ่มเติม 2', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิชาเลือก', type: 'elective' },
                2: { code: '', name: 'วิชาเลือก', type: 'elective' },
                3: { code: '', name: 'CUD-EP ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                6: { code: '', name: 'วิชาเลือก', type: 'elective' },
                7: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                8: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: '', name: 'CUD-EP วิทยาศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิชาเลือก', type: 'elective' },
                6: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                7: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                8: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สุขศึกษา', type: 'core' },
                2: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                3: { code: '', name: 'ลส.-นน.', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                6: { code: '', name: 'CUD-EP วิทยาศาสตร์เพิ่มเติม 2', type: 'core' },
                7: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                8: { code: '', name: 'CUD-EP เสริมทักษะ ภาษาอังกฤษ 2', type: 'core' }
            }
        })
    },
    'M1-3': {
        id: 'M1-3', label: 'ม.1/3', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                6: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'แนะแนว 2', type: 'core' },
                6: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                7: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                8: { code: '', name: 'วิชาเลือก', type: 'elective' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                2: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'พลศึกษา', type: 'core' },
                7: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                2: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                3: { code: '', name: 'ลส.-นน.', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                6: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'สุขศึกษา', type: 'core' }
            }
        })
    }
    ,
    'M1-4': {
        id: 'M1-4', label: 'ม.1/4', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                6: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                7: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                7: { code: '', name: 'วิชาเลือก', type: 'elective' },
                8: { code: '', name: 'พลศึกษา', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                6: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                2: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                3: { code: '', name: 'สุขศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ลส.-นน.', type: 'core' },
                6: { code: '', name: 'แนะแนว 2', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                2: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' }
            }
        })
    },
    'M1-5': {
        id: 'M1-5', label: 'ม.1/5', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                2: { code: '', name: 'สุขศึกษา', type: 'core' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                6: { code: '', name: 'การงานอาชีพ 2', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                6: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                7: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'แนะแนว 2', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                7: { code: '', name: 'ทัศนศิลป์', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                2: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                3: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                6: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'สังคมศึกษาฯ', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                2: { code: '', name: 'ลส.-นน', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            }
        })
    },
    'M1-6': {
        id: 'M1-6', label: 'ม.1/6', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                2: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                6: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                6: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                7: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                8: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                2: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                3: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                6: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'แนะแนว 2', type: 'core' },
                2: { code: '', name: 'สุขศึกษา', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                6: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ประวัติศาสตร์', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'ลส. นน.', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' }
            }
        })
    },
    'M1-7': {
        id: 'M1-7', label: 'ม.1/7', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สุขศึกษา', type: 'core' },
                2: { code: '', name: 'พลศึกษา', type: 'core' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                6: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                7: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                8: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                2: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                6: { code: '', name: 'สังคมศึกษาฯ', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                2: { code: '', name: 'แนะแนว 2', type: 'core' },
                3: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                6: { code: '', name: 'ลส.-นน.', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'สังคมศึกษาฯ', type: 'core' }
            }
        })
    }

};
