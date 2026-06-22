import { defineStore } from 'pinia';
import { api, isApiAvailable } from '@/lib/api';

export interface Term {
    id: string;
    label: string;
    year: number;
    semester: number;
    isDefault?: boolean;
    order?: number;
}

const TERMS_KEY = 'cudseereg_terms_v1';
const ACTIVE_TERM_KEY = 'cudseereg_active_term';

const DEFAULT_TERMS: Term[] = [
    { id: '2568/1', label: '2568/1', year: 2568, semester: 1, isDefault: true },
];

export const useTermStore = defineStore('term', {
    state: () => {
        let terms: Term[] = DEFAULT_TERMS;
        let activeTerm = '2568/1';
        try {
            const s = localStorage.getItem(TERMS_KEY);
            if (s) terms = JSON.parse(s);
            const a = localStorage.getItem(ACTIVE_TERM_KEY);
            if (a) activeTerm = a;
        } catch {}
        // Bumped after the API hydrates so data-loading watchers re-run.
        return { terms, activeTerm, dataRevision: 0 };
    },

    getters: {
        currentTerm: (state): Term =>
            state.terms.find(t => t.id === state.activeTerm) ?? state.terms[0],

        // The term that the live CUD data set represents. Falls back to the
        // first term if no term is explicitly marked default.
        defaultTermId: (state): string =>
            (state.terms.find(t => t.isDefault) ?? state.terms[0])?.id ?? '',

        // True when the active term is the one the live data belongs to.
        isLiveDataTerm(): boolean {
            return this.activeTerm === this.defaultTermId;
        },
    },

    actions: {
        // Replace local terms with the server's set when the API is reachable.
        // The active term is a client preference and is never sent to the server.
        async hydrate() {
            if (!isApiAvailable()) return;
            try {
                const terms = await api.listTerms();
                if (terms.length > 0) {
                    this.terms = terms;
                    this._save();
                    if (!this.terms.some(t => t.id === this.activeTerm)) {
                        this.setActiveTerm(this.defaultTermId);
                    }
                }
            } catch {
                // keep localStorage state
            }
        },

        setActiveTerm(id: string) {
            if (this.terms.some(t => t.id === id)) {
                this.activeTerm = id;
                localStorage.setItem(ACTIVE_TERM_KEY, id);
            }
        },

        addTerm(term: Omit<Term, 'isDefault'>): boolean {
            if (this.terms.some(t => t.id === term.id)) return false;
            this.terms.push({ ...term });
            this._save();
            if (isApiAvailable()) api.createTerm({ ...term }).catch(() => {});
            return true;
        },

        updateTerm(id: string, updates: Partial<Pick<Term, 'label' | 'year' | 'semester'>>) {
            const idx = this.terms.findIndex(t => t.id === id);
            if (idx >= 0) {
                this.terms[idx] = { ...this.terms[idx], ...updates };
                this._save();
                if (isApiAvailable()) api.updateTerm(id, updates).catch(() => {});
            }
        },

        deleteTerm(id: string) {
            const term = this.terms.find(t => t.id === id);
            if (!term) return;
            this.terms = this.terms.filter(t => t.id !== id);
            if (this.activeTerm === id) {
                this.activeTerm = this.terms[0]?.id ?? '';
                localStorage.setItem(ACTIVE_TERM_KEY, this.activeTerm);
            }
            this._save();
            if (isApiAvailable()) api.deleteTerm(id).catch(() => {});
        },

        reorderTerm(id: string, direction: 'up' | 'down') {
            const idx = this.terms.findIndex(t => t.id === id);
            if (idx < 0) return;
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= this.terms.length) return;
            const [moved] = this.terms.splice(idx, 1);
            this.terms.splice(newIdx, 0, moved);
            // Update order values to match array positions
            this.terms.forEach((t, i) => t.order = i);
            this._save();
            if (isApiAvailable()) {
                // Sync each term's order to the server
                this.terms.forEach(t => api.updateTerm(t.id, { order: t.order }).catch(() => {}));
            }
        },

        async renameTerm(oldId: string, newId: string, newLabel: string): Promise<boolean> {
            // Check if new ID already exists
            if (this.terms.some(t => t.id === newId)) return false;

            const term = this.terms.find(t => t.id === oldId);
            if (!term) return false;

            // If API is available, use the rename endpoint
            if (isApiAvailable()) {
                try {
                    await api.renameTerm(oldId, newId, newLabel);
                    // Refresh terms from server
                    await this.hydrate();
                } catch {
                    return false;
                }
            } else {
                // LocalStorage-only update
                const idx = this.terms.findIndex(t => t.id === oldId);
                this.terms[idx] = { ...term, id: newId, label: newLabel };
                if (this.activeTerm === oldId) {
                    this.activeTerm = newId;
                    localStorage.setItem(ACTIVE_TERM_KEY, newId);
                }
                this._save();
            }

            return true;
        },

        _save() {
            localStorage.setItem(TERMS_KEY, JSON.stringify(this.terms));
        },
    },
});
