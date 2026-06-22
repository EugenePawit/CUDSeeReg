import { checkHealth, isApiAvailable, api } from '@/lib/api';
import { useTermStore } from '@/stores/term';
import { useAdminStore } from '@/stores/admin';

const MIGRATED_KEY = 'cudseereg_migrated_v1';

// One-time push of whatever the admin previously created in this browser
// (terms, timetables, custom subjects) up to the server, so existing local
// data is "converted into the database" on first connection.
async function migrateLocalToServer() {
    if (localStorage.getItem(MIGRATED_KEY)) return;
    const term = useTermStore();
    const admin = useAdminStore();

    for (const t of term.terms) {
        if (!t.isDefault) await api.createTerm({ ...t }).catch(() => {});
    }
    for (const tt of Object.values(admin.customTimetables)) {
        await api.upsertTimetable(tt).catch(() => {});
    }
    for (const [termId, grades] of Object.entries(admin.customSubjects)) {
        for (const [grade, subjects] of Object.entries(grades)) {
            for (const subject of subjects) {
                const { id: _localId, ...data } = subject as typeof subject & { id?: number };
                void _localId;
                await api.createSubject(termId, grade, data).catch(() => {});
            }
        }
    }

    localStorage.setItem(MIGRATED_KEY, '1');
}

// Runs in the background after mount. The app already rendered from
// localStorage; when the API is reachable we migrate, then replace local
// state with the server's and bump dataRevision to re-trigger loaders.
export async function bootstrapData() {
    await checkHealth();
    if (!isApiAvailable()) return;

    const term = useTermStore();
    const admin = useAdminStore();

    await migrateLocalToServer();
    await Promise.all([term.hydrate(), admin.hydrateTimetables()]);
    term.dataRevision++;
}
