export interface Subject {
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
    classroom: string | string[];
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

export interface FlattenedSubject extends Omit<Subject, 'group' | 'instructor' | 'classtime' | 'classroom' | 'updatedElectiveQuantity' | 'note'> {
    group: string;
    instructor: string;
    classtime: string;
    classroom: string;
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
