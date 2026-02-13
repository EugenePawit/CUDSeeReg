import { BaseTimetable } from '../types/subject';

// Helper to create a day schedule
const createSchedule = (data: Record<string, Record<number, { code: string; name: string; type: 'core' | 'elective' | 'break' }>>) => data;

export const BASE_TIMETABLES: Record<string, BaseTimetable> = {
    // M1/1 (EP?)
    'M1-1': {
        id: 'M1-1', label: 'ม.1/1', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'แนะแนว 2', type: 'core' },
                2: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                6: { code: '', name: 'CUD-EP เสริมทักษะ', type: 'core' },
                7: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                8: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: '-', type: 'core' },
                2: { code: '', name: '-', type: 'core' },
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
                5: { code: '', name: 'CUD-EP คณิตศาสตร์เพิ่มเติม 2', type: 'core' },
                6: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                7: { code: '', name: 'CUD-EP เสริมทักษะ', type: 'core' },
                8: { code: '', name: 'CUD-EP ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: '-', type: 'core' },
                6: { code: '', name: 'CUD-EP เสริมทักษะ', type: 'core' },
                7: { code: '', name: 'CUD-EP วิทยาศาสตร์เพิ่มเติม 2', type: 'core' },
                8: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' },
                2: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ลส.-นน.', type: 'core' },
                6: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                7: { code: '', name: 'สุขศึกษา', type: 'core' },
                8: { code: '', name: 'ประวัติศาสตร์', type: 'core' }
            }
        })
    },
    // M1/2 (EP?)
    'M1-2': {
        id: 'M1-2', label: 'ม.1/2', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: '', name: 'CUD-EP เสริมทักษะ', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP วิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'CUD-EP วิทยาศาสตร์ 2', type: 'core' },
                7: { code: '', name: 'แนะแนว 2', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: '-', type: 'core' },
                2: { code: '', name: '-', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                6: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' },
                7: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                8: { code: '', name: 'CUD-EP คณิตศาสตร์เพิ่มเติม 2', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                2: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                6: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                7: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                8: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'CUD-EP คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: '', name: 'CUD-EP วิทยาศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'CUD-EP ภาษาอังกฤษ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: '-', type: 'core' },
                6: { code: '', name: '-', type: 'core' },
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
                8: { code: '', name: 'CUD-EP เสริมทักษะ', type: 'core' }
            }
        })
    },
    // M1/3
    'M1-3': {
        id: 'M1-3', label: 'ม.1/3', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'คณิตพื้นฐาน 2', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: 'ภาษาไทย 2', name: 'ภาษาไทย 2', type: 'core' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                6: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: 'คณิตพื้นฐาน 2', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'แนะแนว 2', type: 'core' },
                6: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                7: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                8: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                2: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' },
                3: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'พลศึกษา', type: 'core' },
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                2: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: '-', type: 'core' },
                6: { code: '', name: '-', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'คณิตพื้นฐาน 2', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: 'ประวัติศาสตร์', name: 'ประวัติศาสตร์', type: 'core' },
                3: { code: '', name: 'ลส.-นน.', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                6: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'สุขศึกษา', type: 'core' }
            }
        })
    },
    // M1/4
    'M1-4': {
        id: 'M1-4', label: 'ม.1/4', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: 'ภาษาไทย 2', name: 'ภาษาไทย 2', type: 'core' },
                3: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                6: { code: 'คณิตพื้นฐาน 2', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                7: { code: '', name: 'ทัศนศิลป์', type: 'core' },
                8: { code: 'ภาษาไทย 2', name: 'ภาษาไทย 2', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'คณิตพื้นฐาน 2', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                2: { code: 'ภาษาไทย 2', name: 'ภาษาไทย 2', type: 'core' },
                3: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                6: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' },
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'วิทยาศาสตร์ 2', name: 'วิทยาศาสตร์ 2', type: 'core' },
                2: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                3: { code: '', name: 'สุขศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: '-', type: 'core' },
                6: { code: '', name: '-', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'พลศึกษา', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'ประวัติศาสตร์', name: 'ประวัติศาสตร์', type: 'core' },
                2: { code: 'วิทยาศาสตร์ 2', name: 'วิทยาศาสตร์ 2', type: 'core' },
                3: { code: 'วิทยาศาสตร์ 2', name: 'วิทยาศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ลส.-นน.', type: 'core' },
                6: { code: '', name: 'แนะแนว 2', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: 'คณิตพื้นฐาน 2', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' }
            }
        })
    },
    'M1-5': {
        id: 'M1-5', label: 'ม.1/5', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                2: { code: '', name: 'สุขศึกษา', type: 'core' },
                3: { code: '', name: 'ภาษาอังกฤษ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                6: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                6: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                7: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                8: { code: '', name: 'ทัศนศิลป์', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'แนะแนว 2', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
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
                8: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'ประวัติศาสตร์', type: 'core' },
                2: { code: '', name: 'ลส.-นน.', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                6: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ภาษาไทย 2', type: 'core' }
            }
        })
    },
    // M1/6
    'M1-6': {
        id: 'M1-6', label: 'ม.1/6', grade: 1, schedule: createSchedule({
            Monday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                2: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' },
                3: { code: '', name: 'ภาษาอังกฤษ', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                6: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
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
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'แนะแนว 2', type: 'core' },
                2: { code: '', name: 'สุขศึกษา', type: 'core' },
                3: { code: '', name: 'พลศึกษา', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: '-', type: 'core' },
                6: { code: '', name: '-', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' }
            },
            Friday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'ลส.-นน.', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                7: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                8: { code: '', name: 'ประวัติศาสตร์', type: 'core' }
            }
        })
    },
    // M1/7
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
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
            },
            Tuesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                2: { code: 'BC', name: 'ภาษาอังกฤษ (BC)', type: 'core' },
                3: { code: '', name: 'การงานอาชีพ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                6: { code: '', name: 'ภาษาไทย 2', type: 'core' },
                7: { code: '', name: 'การออกแบบและเทคโนโลยี 1', type: 'core' },
                8: { code: '', name: 'สมรรถนะการออกแบบและเทคโนโลยี 1', type: 'core' }
            },
            Wednesday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                2: { code: '', name: 'วิทยาศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'คณิตศาสตร์พื้นฐาน 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: 'ดนตรี/นาฏศิลป์', type: 'core' },
                6: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                7: { code: '', name: '-', type: 'core' },
                8: { code: '', name: '-', type: 'core' }
            },
            Thursday: {
                0: { code: '', name: 'Homeroom', type: 'core' },
                1: { code: '', name: 'สังคมศึกษาฯ', type: 'core' },
                2: { code: '', name: 'ทักษะกระบวนการทางวิทยาศาสตร์ 2', type: 'core' },
                3: { code: '', name: 'ทักษะกระบวนการทางคณิตศาสตร์ 2', type: 'core' },
                4: { code: '', name: 'พักกลางวัน', type: 'break' },
                5: { code: '', name: '-', type: 'core' },
                6: { code: '', name: '-', type: 'core' },
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

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const DAY_NAMES_TH: Record<string, string> = {
    Monday: 'จันทร์',
    Tuesday: 'อังคาร',
    Wednesday: 'พุธ',
    Thursday: 'พฤหัสบดี',
    Friday: 'ศุกร์'
};
export const PERIODS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
