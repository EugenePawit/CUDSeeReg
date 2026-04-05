import { defineStore } from 'pinia';
import type { FlattenedSubject, UserTimetable } from '@/types/subject';

export const useTimetableStore = defineStore('timetable', {
    state: () => ({
        baseTimetableId: '',
        selectedElectives: {} as UserTimetable,
    }),

    actions: {
        setBaseTimetableId(id: string) {
            if (this.baseTimetableId === id) return;
            this.baseTimetableId = id;
            this.selectedElectives = {};
        },

        replaceTimetable(baseTimetableId: string, subjects: FlattenedSubject[]) {
            const selectedElectives: UserTimetable = {};

            for (const subject of subjects) {
                for (const slot of subject.parsedTimeSlots) {
                    if (!selectedElectives[slot.day]) {
                        selectedElectives[slot.day] = {};
                    }
                    for (const period of slot.periods) {
                        selectedElectives[slot.day][period] = subject;
                    }
                }
            }

            this.baseTimetableId = baseTimetableId;
            this.selectedElectives = selectedElectives;
        },

        addElective(_day: string, _period: number, subject: FlattenedSubject) {
            const newElectives = { ...this.selectedElectives };

            subject.parsedTimeSlots.forEach(slot => {
                const slotDay = slot.day;
                if (!newElectives[slotDay]) newElectives[slotDay] = {};

                slot.periods.forEach(p => {
                    newElectives[slotDay][p] = subject;
                });
            });

            this.selectedElectives = newElectives;
        },

        removeElective(day: string, period: number) {
            const newElectives = { ...this.selectedElectives };
            const subject = newElectives[day]?.[period];

            if (!subject) return;

            subject.parsedTimeSlots.forEach(slot => {
                const slotDay = slot.day;
                if (newElectives[slotDay]) {
                    slot.periods.forEach(p => {
                        delete newElectives[slotDay][p];
                    });
                }
            });

            this.selectedElectives = newElectives;
        },

        clearAllElectives() {
            this.selectedElectives = {};
        },

        hasConflict(subject: FlattenedSubject): boolean {
            for (const slot of subject.parsedTimeSlots) {
                if (this.selectedElectives[slot.day]) {
                    for (const period of slot.periods) {
                        if (this.selectedElectives[slot.day][period]) return true;
                    }
                }
            }
            return false;
        },
    },
});