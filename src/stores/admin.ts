import { defineStore } from 'pinia';
import type { Subject, BaseTimetable } from '@/types/subject';

const PASSWORD_KEY = 'cudseereg_admin_pw';
const SESSION_KEY = 'cudseereg_admin_session';
const CUSTOM_SUBJECTS_KEY = 'cudseereg_custom_subjects_v1';
const CUSTOM_TIMETABLES_KEY = 'cudseereg_custom_timetables_v1';

type SubjectsMap = Record<string, Record<string, Subject[]>>;

function parseJson<T>(key: string, fallback: T): T {
    try {
        const s = localStorage.getItem(key);
        if (s) return JSON.parse(s) as T;
    } catch {}
    return fallback;
}

export const useAdminStore = defineStore('admin', {
    state: () => ({
        isAuthenticated: sessionStorage.getItem(SESSION_KEY) === '1',
        customSubjects: parseJson<SubjectsMap>(CUSTOM_SUBJECTS_KEY, {}),
        customTimetables: parseJson<Record<string, BaseTimetable>>(CUSTOM_TIMETABLES_KEY, {}),
    }),

    getters: {
        hasPassword: () => localStorage.getItem(PASSWORD_KEY) !== null,
    },

    actions: {
        login(password: string): boolean {
            const stored = localStorage.getItem(PASSWORD_KEY);
            if (stored === null) {
                if (!password.trim()) return false;
                localStorage.setItem(PASSWORD_KEY, password);
                sessionStorage.setItem(SESSION_KEY, '1');
                this.isAuthenticated = true;
                return true;
            }
            if (password === stored) {
                sessionStorage.setItem(SESSION_KEY, '1');
                this.isAuthenticated = true;
                return true;
            }
            return false;
        },

        logout() {
            sessionStorage.removeItem(SESSION_KEY);
            this.isAuthenticated = false;
        },

        changePassword(current: string, next: string): boolean {
            if (localStorage.getItem(PASSWORD_KEY) !== current) return false;
            localStorage.setItem(PASSWORD_KEY, next);
            return true;
        },

        getSubjects(termId: string, grade: string): Subject[] {
            return this.customSubjects[termId]?.[grade] ?? [];
        },

        addSubject(termId: string, grade: string, subject: Subject) {
            if (!this.customSubjects[termId]) this.customSubjects[termId] = {};
            if (!this.customSubjects[termId][grade]) this.customSubjects[termId][grade] = [];
            this.customSubjects[termId][grade].push(subject);
            this._saveSubjects();
        },

        updateSubject(termId: string, grade: string, index: number, subject: Subject) {
            if (this.customSubjects[termId]?.[grade]?.[index] !== undefined) {
                this.customSubjects[termId][grade][index] = subject;
                this._saveSubjects();
            }
        },

        deleteSubject(termId: string, grade: string, index: number) {
            this.customSubjects[termId]?.[grade]?.splice(index, 1);
            this._saveSubjects();
        },

        upsertTimetable(timetable: BaseTimetable) {
            this.customTimetables[timetable.id] = timetable;
            this._saveTimetables();
        },

        deleteTimetable(id: string) {
            delete this.customTimetables[id];
            this._saveTimetables();
        },

        _saveSubjects() {
            localStorage.setItem(CUSTOM_SUBJECTS_KEY, JSON.stringify(this.customSubjects));
        },

        _saveTimetables() {
            localStorage.setItem(CUSTOM_TIMETABLES_KEY, JSON.stringify(this.customTimetables));
        },
    },
});
