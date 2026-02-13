import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FlattenedSubject, UserTimetable } from '../types/subject';

interface TimetableState {
    baseTimetableId: string;
    selectedElectives: UserTimetable;
    setBaseTimetableId: (id: string) => void;
    addElective: (day: string, period: number, subject: FlattenedSubject) => void;
    removeElective: (day: string, period: number) => void;
    clearAllElectives: () => void;
    hasConflict: (subject: FlattenedSubject) => boolean;
}

export const useTimetableStore = create<TimetableState>()(
    persist(
        (set, get) => ({
            baseTimetableId: '',
            selectedElectives: {},

            setBaseTimetableId: (id) => set({ baseTimetableId: id, selectedElectives: {} }),

            addElective: (day, period, subject) => set((state) => {
                const newElectives = { ...state.selectedElectives };

                subject.parsedTimeSlots.forEach(slot => {
                    const slotDay = slot.day;
                    if (!newElectives[slotDay]) newElectives[slotDay] = {};

                    slot.periods.forEach(p => {
                        newElectives[slotDay][p] = subject;
                    });
                });

                return { selectedElectives: newElectives };
            }),

            removeElective: (day, period) => set((state) => {
                const newElectives = { ...state.selectedElectives };
                const subject = newElectives[day]?.[period];

                if (!subject) return state;

                subject.parsedTimeSlots.forEach(slot => {
                    const slotDay = slot.day;
                    if (newElectives[slotDay]) {
                        slot.periods.forEach(p => {
                            delete newElectives[slotDay][p];
                        });
                    }
                });

                return { selectedElectives: newElectives };
            }),

            clearAllElectives: () => set({ selectedElectives: {} }),

            hasConflict: (subject) => {
                const state = get();

                for (const slot of subject.parsedTimeSlots) {
                    if (state.selectedElectives[slot.day]) {
                        for (const period of slot.periods) {
                            if (state.selectedElectives[slot.day][period]) return true;
                        }
                    }
                }

                return false;
            },
        }),
        {
            name: 'cudseereg-timetable',
        }
    )
);
