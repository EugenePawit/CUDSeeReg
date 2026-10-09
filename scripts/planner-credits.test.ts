import { expect, test } from 'bun:test';
import { minimumElectiveCredits, selectedElectiveCredits } from '../src/lib/plannerCredits';
import { TIMETABLES_2569_2, militaryTimetable } from '../src/lib/timetables2569_2';
import { BASE_TIMETABLES } from '../src/lib/baseTimetables';
import { flattenSubjects } from '../src/lib/dataFetcher';
import { getBundledSubjects } from '../src/lib/bundledSubjects';

test('all term 2 minimums match the supplied references in both schedule modes', () => {
    const expected = [1.5, 3.5, 1.5, 3.5, 1.5, 3.5, 8.5, 7, 8, 6.5, 9, 9];
    Object.values(TIMETABLES_2569_2).forEach((tt, index) => {
        expect(minimumElectiveCredits(tt)).toBe(expected[index]);
        expect(minimumElectiveCredits(militaryTimetable(tt))).toBe(expected[index]);
    });
    expect(minimumElectiveCredits(null)).toBeNull();
    expect(minimumElectiveCredits(BASE_TIMETABLES['M1-Normal'])).toBeNull();
    expect(minimumElectiveCredits({ ...TIMETABLES_2569_2['M1-EP-2569-2'], id: 'custom' })).toBeNull();
});

test('multiple periods and days do not multiply a course’s credits', () => {
    const subject = flattenSubjects(getBundledSubjects('2569/2', '1'))[0];
    expect(subject).toBeDefined();
    const summary = selectedElectiveCredits({ Monday: { 1: subject, 2: { ...subject } }, Friday: { 3: subject } });
    expect(summary.total).toBe(Number(subject.credit));
    expect(summary.complete).toBe(true);
    expect(selectedElectiveCredits({})).toEqual({ total: 0, complete: true });
    expect(selectedElectiveCredits({ Monday: { 1: { ...subject, credit: '-' } } })).toEqual({ total: 0, complete: false });
});
