export interface Subject {
    description?: string;
    order: number;
    code: string;
    name: string;
    credit: string;
    classPerWeek: string;
    group: string | string[];
    instructor: string | string[];
    enrollment: string | string[];
    electiveQuantity: string | string[];
    updatedElectiveQuantity: string | string[];
    classtime: string | string[];
    // A string applies to this row (or all groups); an array follows group order.
    // Blank/missing array entries mean the classroom is unknown for that group.
    classroom: string | string[];
    // Classroom during the temporary รด. schedule, using the same group order.
    classroomMilitary?: string | string[];
    note: string | string[];
}

export interface ParsedTimeSlot {
    day: string; // "Monday", "Tuesday", etc.
    dayAbbrev: string; // "จ", "อ", etc.
    dayIndex: number; // 0-4 (Mon-Fri)
    periods: number[];
    startPeriod: number;
    endPeriod: number;
    timeRange: string;
}

export interface FlattenedSubject extends Omit<Subject, 'group' | 'instructor' | 'classtime' | 'classroom' | 'classroomMilitary' | 'updatedElectiveQuantity' | 'note'> {
    group: string;
    instructor: string;
    classtime: string;
    classroom: string;
    classroomMilitary?: string;
    updatedElectiveQuantity: string;
    note: string;
    parsedTimeSlots: ParsedTimeSlot[];
    availableSeats: number;
}

export interface GroupedSubject {
    code: string;
    name: string;
    credit: string;
    groups: FlattenedSubject[];
}

export interface BaseTimetableEntry {
    code: string;
    name: string;
    type: 'core' | 'break' | 'elective';
}

export interface BaseTimetable {
    id: string;
    label: string;
    grade: number;
    termId?: string;
    schedule: {
        [day: string]: {
            [period: number]: BaseTimetableEntry;
        };
    };
}

export interface UserTimetable {
    [day: string]: {
        [period: number]: FlattenedSubject;
    };
}
