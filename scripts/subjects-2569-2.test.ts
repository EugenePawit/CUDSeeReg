import { beforeEach, expect, test } from 'bun:test';
import { createPinia, setActivePinia } from 'pinia';
import catalog from '../src/data/subjects-2569-2.json';
import serverCatalog from '../server/src/subjects-2569-2.json';
import { flattenSubjects } from '../src/lib/dataFetcher';
import { getBundledSubjects, isBundledSubject } from '../src/lib/bundledSubjects';

// The stores use browser storage; keep tests isolated from real user data.
function storage() {
    const values = new Map<string, string>();
    return {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
    };
}
Object.defineProperty(globalThis, 'localStorage', { value: storage(), configurable: true });
Object.defineProperty(globalThis, 'sessionStorage', { value: storage(), configurable: true });
const { useAdminStore } = await import('../src/stores/admin');
const { useTermStore } = await import('../src/stores/term');

beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: storage(), configurable: true });
    setActivePinia(createPinia());
});

test('new visitors start on 2569/2 without changing the live catalog term', () => {
    const term = useTermStore();
    expect(term.activeTerm).toBe('2569/2');
    expect(term.currentTerm.id).toBe('2569/2');
    expect(term.defaultTermId).toBe('2569/1');
    expect(term.isLiveDataTerm).toBe(false);
});

test('returning visitors retain their selected term', () => {
    localStorage.setItem('cudseereg_active_term', '2569/1');
    expect(useTermStore().activeTerm).toBe('2569/1');
    useTermStore().setActiveTerm('2569/2');
    setActivePinia(createPinia());
    expect(useTermStore().activeTerm).toBe('2569/2');
});

test('all six grades retain their groups and every checked spreadsheet period', () => {
    expect(serverCatalog).toEqual(catalog);
    const groupCounts = [54, 53, 52, 77, 86, 108];
    const markedPeriods = [95, 94, 90, 181, 217, 222];
    for (let grade = 1; grade <= 6; grade++) {
        const subjects = getBundledSubjects('2569/2', String(grade));
        expect(subjects).toHaveLength(groupCounts[grade - 1]);
        const flattened = flattenSubjects(subjects);
        expect(flattened.reduce((sum, s) => sum + s.parsedTimeSlots.reduce((n, slot) => n + slot.periods.length, 0), 0))
            .toBe(markedPeriods[grade - 1]);
        expect(subjects.every(s => s.description && s.instructor && s.group && s.note)).toBe(true);
    }
    expect(getBundledSubjects('2569/1', '1')).toEqual([]);
});

test('merged continuation rows preserve course metadata and distinct instructors', () => {
    const groups = getBundledSubjects('2569/2', '1').filter(s => s.code === 'ค20202');
    expect(groups).toHaveLength(3);
    expect(groups.map(s => s.group)).toEqual(['1', '2', '3']);
    expect(groups.every(s => s.name && s.description && s.note.includes('EP'))).toBe(true);
    expect(groups[0].classtime).toBe('พุธ 8');
    expect(groups[1].classtime).toBe('พุธ 7');
});

test('temporary upper-grade timetable periods are notes, not extra weekly periods', () => {
    const subject = getBundledSubjects('2569/2', '6').find(s => s.code === 'ท30229')!;
    expect(subject.classtime).toBe('อังคาร 6');
    expect(subject.note).toContain('อังคาร 6 → พ9');
    expect(subject.note).toContain('4 พ.ย. 69 - 11 ธ.ค. 69');
});

test('older browsers get the new term and editing keeps all other bundled groups', () => {
    localStorage.setItem('cudseereg_terms_v1', JSON.stringify([{ id: '2569/1', label: '2569/1', year: 2569, semester: 1, isDefault: true }]));
    expect(useTermStore().terms.map(t => t.id)).toEqual(['2569/1', '2569/2']);
    const admin = useAdminStore();
    const original = admin.getSubjects('2569/2', '1')[0];
    expect(isBundledSubject('2569/2', '1', original)).toBe(true);
    admin.updateSubject('2569/2', '1', 0, { ...original, name: 'Edited course' });
    expect(admin.getSubjects('2569/2', '1')).toHaveLength(54);
    expect(admin.getSubjects('2569/2', '1')[0].name).toBe('Edited course');
    expect(getBundledSubjects('2569/2', '1')[0].name).toBe(original.name);
    admin.deleteSubject('2569/2', '1', 0);
    setActivePinia(createPinia());
    expect(useAdminStore().getSubjects('2569/2', '1')).toHaveLength(53);
});
