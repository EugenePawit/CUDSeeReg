import type { UserTimetable } from '@/types/subject';

export function timetableClassrooms(timetable: UserTimetable, military: boolean) {
    const subjects = new Map(Object.values(timetable).flatMap(day => Object.values(day))
        .map(subject => [JSON.stringify([subject.code, subject.group, subject.classtime]), subject]));
    return [...subjects.entries()].flatMap(([id, subject]) => {
        const classroom = (military ? subject.classroomMilitary ?? subject.classroom : subject.classroom).trim();
        return classroom ? [{ id, code: subject.code, name: subject.name, group: subject.group, classroom }] : [];
    });
}
