// Thin client for the optional backend API. The app works without it (data
// lives in localStorage); when the API is reachable it becomes the source of
// truth and changes are shared across devices.
import type { Term } from '@/stores/term';
import type { BaseTimetable, Subject } from '@/types/subject';

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

let available: boolean | null = null;
export function isApiAvailable(): boolean {
    return available === true;
}

async function jsonRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    // A static host (e.g. Vercel) rewrites unknown paths to index.html and
    // returns HTML with a 200 — guard against parsing that as a valid API hit.
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        throw new Error('API unavailable (non-JSON response)');
    }
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
    return body as T;
}

export async function checkHealth(timeoutMs = 3000): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const r = await jsonRequest<{ ok: boolean }>('/health', { signal: controller.signal });
            available = r.ok === true;
        } finally {
            clearTimeout(timer);
        }
    } catch {
        available = false;
    }
    return available;
}

export type StoredSubject = Subject & { id?: number };

const enc = encodeURIComponent;

export const api = {
    listTerms: () => jsonRequest<Term[]>('/terms'),
    createTerm: (t: Term) =>
        jsonRequest('/terms', { method: 'POST', body: JSON.stringify(t) }),
    updateTerm: (id: string, updates: Partial<Term>) =>
        jsonRequest(`/terms/${enc(id)}`, { method: 'PUT', body: JSON.stringify(updates) }),
    renameTerm: (oldId: string, newId: string, newLabel: string) =>
        jsonRequest(`/terms/${enc(oldId)}/rename`, { method: 'PUT', body: JSON.stringify({ newId, newLabel }) }),
    deleteTerm: (id: string) =>
        jsonRequest(`/terms/${enc(id)}`, { method: 'DELETE' }),

    listTimetables: () => jsonRequest<BaseTimetable[]>('/timetables'),
    upsertTimetable: (tt: BaseTimetable) =>
        jsonRequest(`/timetables/${enc(tt.id)}`, { method: 'PUT', body: JSON.stringify(tt) }),
    deleteTimetable: (id: string) =>
        jsonRequest(`/timetables/${enc(id)}`, { method: 'DELETE' }),

    listSubjects: (term: string, grade: string) =>
        jsonRequest<StoredSubject[]>(`/subjects?term=${enc(term)}&grade=${enc(grade)}`),
    createSubject: (termId: string, grade: string, data: Subject) =>
        jsonRequest<StoredSubject>('/subjects', {
            method: 'POST',
            body: JSON.stringify({ termId, grade, data }),
        }),
    updateSubject: (id: number, data: Subject) =>
        jsonRequest(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),
    deleteSubject: (id: number) =>
        jsonRequest(`/subjects/${id}`, { method: 'DELETE' }),
};
