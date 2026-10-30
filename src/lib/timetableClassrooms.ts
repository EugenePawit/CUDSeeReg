import type { FlattenedSubject, UserTimetable } from '@/types/subject';

export function timetableClassrooms(timetable: UserTimetable, military: boolean, catalog: FlattenedSubject[] = []) {
    const subjects = new Map(Object.values(timetable).flatMap(day => Object.values(day))
        .map(subject => [JSON.stringify([subject.code, subject.group, subject.classtime]), subject]));
    // Selections may predate API hydration. Resolve rooms from the current catalog.
    const current = new Map(catalog.map(subject => [JSON.stringify([subject.code, subject.group, subject.classtime]), subject]));
    return [...subjects.entries()].flatMap(([id, selected]) => {
        const subject = current.get(id) ?? selected;
        const classroom = (military ? subject.classroomMilitary ?? subject.classroom : subject.classroom).trim();
        return classroom ? [{ id, code: subject.code, name: subject.name, group: subject.group, classroom }] : [];
    });
}
