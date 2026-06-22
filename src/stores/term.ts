import { defineStore } from 'pinia';

export interface Term {
    id: string;
    label: string;
    year: number;
    semester: number;
    isDefault?: boolean;
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
        return { terms, activeTerm };
    },

    getters: {
        currentTerm: (state): Term =>
            state.terms.find(t => t.id === state.activeTerm) ?? state.terms[0],
    },

    actions: {
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
            return true;
        },

        updateTerm(id: string, updates: Partial<Pick<Term, 'label' | 'year' | 'semester'>>) {
            const idx = this.terms.findIndex(t => t.id === id);
            if (idx >= 0) {
                this.terms[idx] = { ...this.terms[idx], ...updates };
                this._save();
            }
        },

        deleteTerm(id: string) {
            const term = this.terms.find(t => t.id === id);
            if (!term || term.isDefault) return;
            this.terms = this.terms.filter(t => t.id !== id);
            if (this.activeTerm === id) {
                this.activeTerm = this.terms[0]?.id ?? '';
                localStorage.setItem(ACTIVE_TERM_KEY, this.activeTerm);
            }
            this._save();
        },

        _save() {
            localStorage.setItem(TERMS_KEY, JSON.stringify(this.terms));
        },
    },
});
