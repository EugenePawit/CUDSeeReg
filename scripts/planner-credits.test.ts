import { expect, test } from 'bun:test';
import { parseCredit, summarizePlannerCredits } from '../src/lib/plannerCredits';
import type { FlattenedSubject, UserTimetable } from '../src/types/subject';

function subject(code: string, credit: string, group = '1'): FlattenedSubject {
    return {
        order: 1, code, name: code, credit, group, classPerWeek: '2',
        instructor: '', enrollment: '', electiveQuantity: '', updatedElectiveQuantity: '',
        classtime: 'จ. 1-2', classroom: '', note: '', availableSeats: 0, parsedTimeSlots: [],
    };
}

test('a course in multiple periods and days contributes its credits once', () => {
    const first = subject('A', '1.5');
    const second = subject('B', '0.5');
    const timetable: UserTimetable = {
        Monday: { 1: first, 2: { ...first }, 3: second },
        Friday: { 4: { ...first } },
    };
    expect(summarizePlannerCredits(timetable).total).toBe(2);
    expect(summarizePlannerCredits(timetable).courses).toHaveLength(2);
    delete timetable.Monday[3];
    expect(summarizePlannerCredits(timetable).total).toBe(1.5);
    expect(summarizePlannerCredits({}).total).toBe(0);
});

test('missing and malformed credits remain unknown while zero is valid', () => {
    for (const value of ['', '-', '-1', 'Infinity', '1oops', '1.0.5']) {
        expect(parseCredit(value)).toBeNull();
    }
    expect(parseCredit(' 1.5 ')).toBe(1.5);
    expect(parseCredit('0')).toBe(0);
    const summary = summarizePlannerCredits({ Monday: {
        1: subject('A', '1.5'), 2: subject('B', '-'), 3: subject('C', '0'),
    } });
    expect(summary.total).toBe(1.5);
    expect(summary.unknownCount).toBe(1);
});

test('decimal credits do not accumulate floating point display errors', () => {
    expect(summarizePlannerCredits({ Monday: {
        1: subject('A', '0.1'), 2: subject('B', '0.2'),
    } }).total).toBe(0.3);
});
