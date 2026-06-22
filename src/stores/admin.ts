import { defineStore } from 'pinia';
import type { Subject, BaseTimetable } from '@/types/subject';
import { api, isApiAvailable, type StoredSubject } from '@/lib/api';

const PASSWORD_KEY = 'cudseereg_admin_pw';
const SESSION_KEY = 'cudseereg_admin_session';
const CUSTOM_SUBJECTS_KEY = 'cudseereg_custom_subjects_v1';
const CUSTOM_TIMETABLES_KEY = 'cudseereg_custom_timetables_v1';

// Subjects may carry a server row id (StoredSubject) once persisted to the API.
type SubjectsMap = Record<string, Record<string, StoredSubject[]>>;

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

        getSubjects(termId: string, grade: string): StoredSubject[] {
            return this.customSubjects[termId]?.[grade] ?? [];
        },

        // Pull the authoritative subject list for a term+grade from the API
        // (no-op offline). Views await this before reading getSubjects.
        async ensureSubjects(termId: string, grade: string) {
            if (!isApiAvailable()) return;
            try {
                const rows = await api.listSubjects(termId, grade);
                if (!this.customSubjects[termId]) this.customSubjects[termId] = {};
                this.customSubjects[termId][grade] = rows;
                this._saveSubjects();
            } catch {
                // keep cached state
            }
        },

        // Replace local timetables with the full server set (which already
        // includes the seeded base timetables) when the API is reachable.
        async hydrateTimetables(activeTermId?: string) {
            if (!isApiAvailable()) return;
            try {
                const list = await api.listTimetables(activeTermId);
                const map: Record<string, BaseTimetable> = {};
                for (const tt of list) map[tt.id] = tt;
                this.customTimetables = map;
                this._saveTimetables();
            } catch {
                // keep cached state
            }
        },

        addSubject(termId: string, grade: string, subject: Subject) {
            if (!this.customSubjects[termId]) this.customSubjects[termId] = {};
            if (!this.customSubjects[termId][grade]) this.customSubjects[termId][grade] = [];
            const stored: StoredSubject = { ...subject };
            this.customSubjects[termId][grade].push(stored);
            this._saveSubjects();
            if (isApiAvailable()) {
                api.createSubject(termId, grade, subject)
                    .then((saved) => {
                        // Record the server id so later edits/deletes target the row.
                        stored.id = saved.id;
                        this._saveSubjects();
                    })
                    .catch(() => {});
            }
        },

        updateSubject(termId: string, grade: string, index: number, subject: Subject) {
            const existing = this.customSubjects[termId]?.[grade]?.[index];
            if (existing === undefined) return;
            const stored: StoredSubject = { ...subject, id: existing.id };
            this.customSubjects[termId][grade][index] = stored;
            this._saveSubjects();
            if (isApiAvailable() && stored.id !== undefined) {
                api.updateSubject(stored.id, subject).catch(() => {});
            }
        },

        deleteSubject(termId: string, grade: string, index: number) {
            const removed = this.customSubjects[termId]?.[grade]?.[index];
            this.customSubjects[termId]?.[grade]?.splice(index, 1);
            this._saveSubjects();
            if (isApiAvailable() && removed?.id !== undefined) {
                api.deleteSubject(removed.id).catch(() => {});
            }
        },

        upsertTimetable(timetable: BaseTimetable) {
            // Ensure termId is set
            if (!timetable.termId) {
                console.warn('[admin] upsertTimetable called without termId, skipping');
                return;
            }
            this.customTimetables[timetable.id] = timetable;
            this._saveTimetables();
            if (isApiAvailable()) api.upsertTimetable(timetable).catch(() => {});
        },

        deleteTimetable(id: string) {
            delete this.customTimetables[id];
            this._saveTimetables();
            if (isApiAvailable()) api.deleteTimetable(id).catch(() => {});
        },

        _saveSubjects() {
            localStorage.setItem(CUSTOM_SUBJECTS_KEY, JSON.stringify(this.customSubjects));
        },

        _saveTimetables() {
            localStorage.setItem(CUSTOM_TIMETABLES_KEY, JSON.stringify(this.customTimetables));
        },
    },
});
