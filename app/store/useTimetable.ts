import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FlattenedSubject, UserTimetable } from '../types/subject';

interface TimetableState {
    baseTimetableId: string;
    selectedElectives: UserTimetable;
    setBaseTimetableId: (id: string) => void;
    replaceTimetable: (baseTimetableId: string, subjects: FlattenedSubject[]) => void;
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

            setBaseTimetableId: (id) => set((state) => {
                if (state.baseTimetableId === id) {
                    return state;
                }
                return { baseTimetableId: id, selectedElectives: {} };
            }),

            replaceTimetable: (baseTimetableId, subjects) => set(() => {
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

                return { baseTimetableId, selectedElectives };
            }),

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
