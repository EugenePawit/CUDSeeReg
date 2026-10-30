import { expect, test } from 'bun:test';
import { timetableClassrooms } from '../src/lib/timetableClassrooms';
import { flattenSubjects } from '../src/lib/dataFetcher';
import { getBundledSubjects } from '../src/lib/bundledSubjects';

test('export rooms follow the schedule mode and list a multi-period group once', () => {
    const base = flattenSubjects(getBundledSubjects('2569/2', '6'))[0];
    const first = { ...base, classroom: 'ม.6/1', classroomMilitary: 'ห้องปฏิบัติการ 2\nพุธ 9 ม.6/2' };
    const second = { ...first, group: '2', classroom: 'ม.6/3', classroomMilitary: 'ม.6/4' };
    const selected = { Monday: { 1: first, 2: first }, Friday: { 3: second } };
    expect(timetableClassrooms(selected, false).map(s => [s.group, s.classroom])).toEqual([
        ['1', 'ม.6/1'], ['2', 'ม.6/3'],
    ]);
    expect(timetableClassrooms(selected, true).map(s => s.classroom)).toEqual([
        'ห้องปฏิบัติการ 2\nพุธ 9 ม.6/2', 'ม.6/4',
    ]);
    expect(timetableClassrooms(selected, false)[0].classroom).toBe('ม.6/1');
});

test('unknown rooms are omitted and legacy records can use their shared room', () => {
    const base = flattenSubjects(getBundledSubjects('2569/2', '6'))[0];
    expect(timetableClassrooms({}, false)).toEqual([]);
    expect(timetableClassrooms({ Monday: { 1: { ...base, classroom: '  ' } } }, false)).toEqual([]);
    const legacy = { ...base, classroom: '101', classroomMilitary: undefined };
    expect(timetableClassrooms({ Monday: { 1: legacy } }, true)[0].classroom).toBe('101');
    expect(timetableClassrooms({ Monday: { 1: { ...legacy, classroomMilitary: '' } } }, true)).toEqual([]);
});


test('room lists refresh from the current catalog after an offline selection', () => {
    const base = flattenSubjects(getBundledSubjects('2569/2', '6'))[0];
    const selected = { Monday: { 1: { ...base, classroom: '' } } };
    expect(timetableClassrooms(selected, false)).toEqual([]);
    const current = { ...base, classroom: 'ม.6/5', classroomMilitary: 'ม.6/2' };
    expect(timetableClassrooms(selected, false, [current])[0].classroom).toBe('ม.6/5');
    expect(timetableClassrooms(selected, true, [current])[0].classroom).toBe('ม.6/2');
    expect(selected.Monday[1].classroom).toBe('');
});
