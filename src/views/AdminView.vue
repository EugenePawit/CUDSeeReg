<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import {
    Lock, LogOut, Plus, Trash2, Edit2, Save, X, Check,
    Settings, BookOpen, CalendarDays, Layout,
    Eye, EyeOff, Upload, FileDown, Search,
} from 'lucide-vue-next';
import { fetchSubjects } from '@/lib/dataFetcher';
import { useAdminStore } from '@/stores/admin';
import { useTermStore } from '@/stores/term';
import { BASE_TIMETABLES, DAYS, DAY_NAMES_TH, PERIODS } from '@/lib/baseTimetables';
import type { BaseTimetable, BaseTimetableEntry, Subject } from '@/types/subject';
import {
    parseSubjectFile,
    downloadCsvTemplate,
    downloadXlsxTemplate,
    IMPORT_COLUMNS,
} from '@/lib/subjectImport';

const adminStore = useAdminStore();
const termStore = useTermStore();

// ─── Auth ───────────────────────────────────────────────────────────────────
const loginPassword = ref('');
const loginError = ref('');
const showLoginPw = ref(false);

const loginLabel = computed(() =>
    adminStore.hasPassword ? 'Sign in' : 'Set password'
);

const handleLogin = () => {
    loginError.value = '';
    const ok = adminStore.login(loginPassword.value);
    if (!ok) {
        loginError.value = adminStore.hasPassword
            ? 'Incorrect password'
            : 'Please enter a password to set';
    } else {
        loginPassword.value = '';
    }
};

// ─── Tabs ───────────────────────────────────────────────────────────────────
type Tab = 'terms' | 'subjects' | 'timetables' | 'settings';
const activeTab = ref<Tab>('terms');

// ─── Terms Tab ───────────────────────────────────────────────────────────────
const showAddTermForm = ref(false);
const newTermYear = ref(2568);
const newTermSemester = ref<1 | 2>(1);
const termDupError = ref('');

const newTermId = computed(() => `${newTermYear.value}/${newTermSemester.value}`);

const addTerm = () => {
    termDupError.value = '';
    const ok = termStore.addTerm({
        id: newTermId.value,
        label: newTermId.value,
        year: newTermYear.value,
        semester: newTermSemester.value,
    });
    if (!ok) {
        termDupError.value = `Term ${newTermId.value} already exists`;
        return;
    }
    showAddTermForm.value = false;
};

const editingTermId = ref<string | null>(null);
const editingTermLabel = ref('');

const startEditTerm = (id: string, label: string) => {
    editingTermId.value = id;
    editingTermLabel.value = label;
};

const saveEditTerm = () => {
    if (!editingTermId.value) return;
    termStore.updateTerm(editingTermId.value, { label: editingTermLabel.value });
    editingTermId.value = null;
};

// ─── Subjects Tab ────────────────────────────────────────────────────────────
const subjectsTermId = ref(termStore.activeTerm);
const subjectsGrade = ref('6');
const showAddSubjectForm = ref(false);
const editingSubjectIndex = ref<number | null>(null);
const subjectsLoading = ref(false);
const liveSubjects = ref<Subject[]>([]);

// Search and filter state
const subjectSearch = ref('');
const subjectFilterSlot = ref('');

const blankSubject = (): Subject => ({
    order: Date.now(),
    code: '',
    name: '',
    credit: '1.0',
    classPerWeek: '2',
    group: '1',
    instructor: '',
    enrollment: '30',
    electiveQuantity: '30',
    updatedElectiveQuantity: '30',
    classtime: '',
    classroom: '',
    note: '',
});

const subjectForm = reactive(blankSubject());

// Admin-managed subjects for the selected term+grade (used for CRUD indexing).
const customSubjectsList = computed(() =>
    adminStore.getSubjects(subjectsTermId.value, subjectsGrade.value)
);

// Merged list: live CUD catalog subjects (default term only) + custom subjects.
// Re-computes reactively when the store changes so CRUD updates show instantly.
const allSubjectsRaw = computed(() => [
    ...liveSubjects.value.map((s) => ({ subject: s, isCustom: false as const, customIndex: undefined as number | undefined })),
    ...customSubjectsList.value.map((s, i) => ({ subject: s, isCustom: true as const, customIndex: i as number | undefined })),
]);

// Unique time slots across all subjects, for the filter dropdown.
const availableSlots = computed(() => {
    const slots = new Set<string>();
    for (const { subject } of allSubjectsRaw.value) {
        const ct = subject.classtime;
        if (Array.isArray(ct)) ct.forEach((c) => c && slots.add(c));
        else if (ct) slots.add(ct);
    }
    return [...slots].sort();
});

// Subjects visible after applying search + slot filters.
const filteredSubjectsList = computed(() => {
    const q = subjectSearch.value.trim().toLowerCase();
    return allSubjectsRaw.value.filter(({ subject }) => {
        if (subjectFilterSlot.value) {
            const ct = Array.isArray(subject.classtime)
                ? subject.classtime.join(' ')
                : subject.classtime || '';
            if (!ct.includes(subjectFilterSlot.value)) return false;
        }
        if (q) {
            const instructor = Array.isArray(subject.instructor)
                ? subject.instructor.join(' ')
                : subject.instructor || '';
            const haystack = `${subject.code} ${subject.name} ${instructor}`.toLowerCase();
            if (!haystack.includes(q)) return false;
        }
        return true;
    });
});

const getSubjectClasstime = (s: Subject): string => {
    if (Array.isArray(s.classtime)) return s.classtime.join(', ');
    return s.classtime || '';
};

const getSubjectInstructor = (s: Subject): string => {
    if (Array.isArray(s.instructor)) return s.instructor.join(', ');
    return s.instructor || '';
};

// Pull subjects from API + live CUD catalog when term/grade/revision changes.
watch(
    [subjectsTermId, subjectsGrade, () => termStore.dataRevision],
    async () => {
        subjectsLoading.value = true;
        await adminStore.ensureSubjects(subjectsTermId.value, subjectsGrade.value);
        const isDefaultTerm = subjectsTermId.value === termStore.defaultTermId;
        if (isDefaultTerm) {
            try {
                liveSubjects.value = await fetchSubjects(Number(subjectsGrade.value));
            } catch {
                liveSubjects.value = [];
            }
        } else {
            liveSubjects.value = [];
        }
        subjectsLoading.value = false;
    },
    { immediate: true },
);

const resetSubjectForm = () => {
    Object.assign(subjectForm, blankSubject());
    showAddSubjectForm.value = false;
    editingSubjectIndex.value = null;
};

const startEditSubject = (customIndex: number) => {
    const s = customSubjectsList.value[customIndex];
    Object.assign(subjectForm, JSON.parse(JSON.stringify(s)));
    editingSubjectIndex.value = customIndex;
    showAddSubjectForm.value = true;
};

const saveSubject = () => {
    const s: Subject = JSON.parse(JSON.stringify(subjectForm));
    s.order = editingSubjectIndex.value !== null ? s.order : Date.now();
    if (editingSubjectIndex.value !== null) {
        adminStore.updateSubject(subjectsTermId.value, subjectsGrade.value, editingSubjectIndex.value, s);
    } else {
        adminStore.addSubject(subjectsTermId.value, subjectsGrade.value, s);
    }
    resetSubjectForm();
};

const deleteSubject = (customIndex: number) => {
    adminStore.deleteSubject(subjectsTermId.value, subjectsGrade.value, customIndex);
};

// Elective class-time slots available for the selected grade, derived from the
// elective cells of every timetable for that grade. Contiguous elective periods
// on the same day are grouped into a single block (e.g. "พฤหัสบดี 5-6").
const electiveSlotOptions = computed(() => {
    const grade = subjectsGrade.value;
    const seen = new Set<string>();
    const result: { value: string; sort: number }[] = [];
    const timetables = Object.values(allTimetables.value).filter((tt) => String(tt.grade) === grade);

    DAYS.forEach((day, dayIndex) => {
        for (const tt of timetables) {
            const sched = tt.schedule[day] ?? {};
            let run: number[] = [];
            const flush = () => {
                if (run.length === 0) return;
                const start = run[0];
                const end = run[run.length - 1];
                const thaiDay = DAY_NAMES_TH[day];
                const value = start === end ? `${thaiDay} ${start}` : `${thaiDay} ${start}-${end}`;
                if (!seen.has(value)) {
                    seen.add(value);
                    result.push({ value, sort: dayIndex * 100 + start });
                }
                run = [];
            };
            for (const period of PERIODS) {
                if (sched[period]?.type === 'elective') run.push(period);
                else flush();
            }
            flush();
        }
    });

    return result.sort((a, b) => a.sort - b.sort).map((o) => o.value);
});

// Ensure an existing/custom class time is still selectable when editing.
// Subject.classtime is typed string | string[]; the form only ever holds a
// single string, so normalize before comparing.
const classtimeOptions = computed(() => {
    const opts = [...electiveSlotOptions.value];
    const current = Array.isArray(subjectForm.classtime)
        ? subjectForm.classtime.join(', ')
        : subjectForm.classtime;
    if (current && !opts.includes(current)) opts.unshift(current);
    return opts;
});

// ─── Subject Import ──────────────────────────────────────────────────────────
const subjectFileRef = ref<HTMLInputElement | null>(null);
const subjectImportMsg = ref('');
const subjectImportError = ref(false);

const handleSubjectImport = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    subjectImportMsg.value = '';
    subjectImportError.value = false;

    try {
        const parsed = await parseSubjectFile(file);
        if (parsed.length === 0) {
            subjectImportError.value = true;
            subjectImportMsg.value = 'No valid subjects found in the file.';
        } else {
            for (const subject of parsed) {
                adminStore.addSubject(subjectsTermId.value, subjectsGrade.value, subject);
            }
            subjectImportMsg.value = `Imported ${parsed.length} subject${parsed.length === 1 ? '' : 's'} into M.${subjectsGrade.value}, term ${subjectsTermId.value}.`;
        }
    } catch (err) {
        console.error(err);
        subjectImportError.value = true;
        subjectImportMsg.value = 'Failed to read the file. Make sure it is a valid .csv or .xlsx file.';
    } finally {
        input.value = '';
    }
};

// ─── Timetables Tab ──────────────────────────────────────────────────────────
const timetableMode = ref<'list' | 'edit'>('list');
const draftTimetable = ref<BaseTimetable | null>(null);
const draftIsNew = ref(false);

const newTTId = ref('');
const newTTLabel = ref('');
const newTTGrade = ref(1);
const newTTCopyFrom = ref('');
const showNewTTForm = ref(false);
const newTTError = ref('');

const allTimetables = computed<Record<string, BaseTimetable>>(() => ({
    ...BASE_TIMETABLES,
    ...adminStore.customTimetables,
}));

const editingCell = ref<{ day: string; period: number } | null>(null);
const cellForm = reactive({ type: 'core' as 'core' | 'elective' | 'break', name: '', code: '' });

const cellTypeLabel: Record<string, string> = {
    core: 'Core',
    elective: 'Elective',
    break: 'Break',
};

const cellTypeBg: Record<string, string> = {
    core: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    elective: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    break: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
};

const openEditTimetable = (id: string) => {
    const tt = allTimetables.value[id];
    if (!tt) return;
    draftTimetable.value = JSON.parse(JSON.stringify(tt));
    draftIsNew.value = false;
    timetableMode.value = 'edit';
    editingCell.value = null;
};

const startNewTimetable = () => {
    newTTError.value = '';
    if (!newTTId.value.trim() || !newTTLabel.value.trim()) {
        newTTError.value = 'Please enter an ID and a name.';
        return;
    }
    if (allTimetables.value[newTTId.value.trim()]) {
        newTTError.value = 'This ID already exists.';
        return;
    }

    let schedule: BaseTimetable['schedule'];
    if (newTTCopyFrom.value && allTimetables.value[newTTCopyFrom.value]) {
        schedule = JSON.parse(JSON.stringify(allTimetables.value[newTTCopyFrom.value].schedule));
    } else {
        schedule = {};
        const breakPeriod = newTTGrade.value <= 3 ? 4 : 5;
        for (const day of DAYS) {
            schedule[day] = {};
            for (const p of PERIODS) {
                schedule[day][p] = {
                    code: '',
                    name: p === 0 ? 'Homeroom' : p === breakPeriod ? 'Lunch' : '',
                    type: p === breakPeriod ? 'break' : 'core',
                };
            }
        }
    }

    draftTimetable.value = {
        id: newTTId.value.trim(),
        label: newTTLabel.value.trim(),
        grade: newTTGrade.value,
        schedule,
    };
    draftIsNew.value = true;
    showNewTTForm.value = false;
    timetableMode.value = 'edit';
    newTTId.value = '';
    newTTLabel.value = '';
    editingCell.value = null;
};

const selectCell = (day: string, period: number) => {
    if (!draftTimetable.value) return;
    editingCell.value = { day, period };
    const entry = draftTimetable.value.schedule[day]?.[period];
    cellForm.type = entry?.type ?? 'core';
    cellForm.name = entry?.name ?? '';
    cellForm.code = entry?.code ?? '';
};

const applyCell = () => {
    if (!editingCell.value || !draftTimetable.value) return;
    const { day, period } = editingCell.value;
    draftTimetable.value.schedule[day][period] = {
        code: cellForm.code,
        name: cellForm.name,
        type: cellForm.type,
    };
    editingCell.value = null;
};

const saveDraftTimetable = () => {
    if (!draftTimetable.value) return;
    adminStore.upsertTimetable(draftTimetable.value);
    timetableMode.value = 'list';
    draftTimetable.value = null;
};

const deleteTimetable = (id: string) => {
    adminStore.deleteTimetable(id);
};

const getCellDisplay = (entry: BaseTimetableEntry | undefined): { bg: string; text: string } => {
    if (!entry) return { bg: 'bg-slate-50 dark:bg-slate-800/40', text: '' };
    return {
        bg: cellTypeBg[entry.type] ?? 'bg-slate-100 dark:bg-slate-700',
        text: entry.name || (entry.type === 'elective' ? 'Elective' : entry.type === 'break' ? 'Break' : '—'),
    };
};

// ─── Settings Tab ────────────────────────────────────────────────────────────
const pwCurrent = ref('');
const pwNew = ref('');
const pwConfirm = ref('');
const pwMsg = ref('');
const pwSuccess = ref(false);
const showPwCurrent = ref(false);
const showPwNew = ref(false);

const handleChangePw = () => {
    pwMsg.value = '';
    pwSuccess.value = false;
    if (!pwNew.value.trim()) { pwMsg.value = 'New password cannot be empty.'; return; }
    if (pwNew.value !== pwConfirm.value) { pwMsg.value = 'New passwords do not match.'; return; }
    const ok = adminStore.changePassword(pwCurrent.value, pwNew.value);
    if (!ok) { pwMsg.value = 'Current password is incorrect.'; return; }
    pwMsg.value = 'Password changed successfully.';
    pwSuccess.value = true;
    pwCurrent.value = '';
    pwNew.value = '';
    pwConfirm.value = '';
};

const exportData = () => {
    const data = {
        terms: termStore.terms,
        customSubjects: adminStore.customSubjects,
        customTimetables: adminStore.customTimetables,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cudseereg-admin-data.json';
    a.click();
};

const importFileRef = ref<HTMLInputElement | null>(null);
const importMsg = ref('');

const handleImport = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result as string);
            if (data.terms) {
                for (const t of data.terms) {
                    if (!t.isDefault) termStore.addTerm(t);
                }
            }
            if (data.customSubjects) {
                for (const [termId, gradeMap] of Object.entries(data.customSubjects as Record<string, Record<string, Subject[]>>)) {
                    for (const [grade, subjects] of Object.entries(gradeMap)) {
                        for (const subject of subjects) {
                            adminStore.addSubject(termId, grade, subject);
                        }
                    }
                }
            }
            if (data.customTimetables) {
                for (const tt of Object.values(data.customTimetables as Record<string, BaseTimetable>)) {
                    adminStore.upsertTimetable(tt);
                }
            }
            importMsg.value = 'Data imported successfully.';
        } catch {
            importMsg.value = 'Invalid file.';
        }
    };
    reader.readAsText(file);
};
</script>

<template>
    <div class="min-h-screen flex flex-col pt-28 pb-12">
        <!-- Login Screen -->
        <div v-if="!adminStore.isAuthenticated" class="flex flex-grow items-center justify-center px-4">
            <div class="glass-card p-8 w-full max-w-sm shadow-xl">
                <div class="flex items-center gap-3 mb-8">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                        <Lock :size="20" class="text-white" />
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400">CUDSeeReg</p>
                    </div>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div>
                        <label class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                            {{ adminStore.hasPassword ? 'Password' : 'Set a new password' }}
                        </label>
                        <div class="relative">
                            <input
                                v-model="loginPassword"
                                :type="showLoginPw ? 'text' : 'password'"
                                class="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm"
                                placeholder="Password"
                                autofocus
                            />
                            <button
                                type="button"
                                @click="showLoginPw = !showLoginPw"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <EyeOff v-if="showLoginPw" :size="16" />
                                <Eye v-else :size="16" />
                            </button>
                        </div>
                        <p v-if="loginError" class="text-xs text-red-500 mt-1.5">{{ loginError }}</p>
                        <p v-if="!adminStore.hasPassword" class="text-xs text-slate-400 mt-1.5">
                            This password will be saved for future sign-ins.
                        </p>
                    </div>
                    <button type="submit" class="btn-primary w-full py-3 text-sm">
                        {{ loginLabel }}
                    </button>
                </form>
            </div>
        </div>

        <!-- Dashboard -->
        <template v-else>
            <main class="container mx-auto px-4 max-w-6xl flex-grow flex flex-col z-10 w-full relative">
                <!-- Header -->
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h1 class="text-4xl font-kanit font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-400">
                            Admin Panel
                        </h1>
                        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage CUDSeeReg data</p>
                    </div>
                    <button
                        @click="adminStore.logout()"
                        class="btn-secondary flex items-center gap-2 text-sm interactive-press"
                    >
                        <LogOut :size="16" />
                        Sign out
                    </button>
                </div>

                <!-- Tab Bar -->
                <div class="glass-card p-1.5 rounded-2xl flex gap-1 mb-6 shadow-glass overflow-x-auto no-scrollbar">
                    <button
                        v-for="tab in ([
                            { id: 'terms', label: 'Terms', icon: CalendarDays },
                            { id: 'subjects', label: 'Subjects', icon: BookOpen },
                            { id: 'timetables', label: 'Timetables', icon: Layout },
                            { id: 'settings', label: 'Settings', icon: Settings },
                        ] as const)"
                        :key="tab.id"
                        @click="activeTab = tab.id; timetableMode = 'list'"
                        :class="[
                            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                            activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        ]"
                    >
                        <component :is="tab.icon" :size="15" />
                        {{ tab.label }}
                    </button>
                </div>

                <!-- ═══ TERMS TAB ═══════════════════════════════════════════════════ -->
                <div v-if="activeTab === 'terms'" class="space-y-4">
                    <div class="glass-card p-6 shadow-glass">
                        <div class="flex items-center justify-between mb-5">
                            <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">All terms</h2>
                            <button
                                @click="showAddTermForm = !showAddTermForm"
                                class="btn-primary text-sm flex items-center gap-2 interactive-press"
                            >
                                <Plus :size="16" /> Add term
                            </button>
                        </div>

                        <!-- Add Term Form -->
                        <Transition
                            enter-active-class="transition duration-200 ease-out"
                            enter-from-class="opacity-0 -translate-y-2"
                            enter-to-class="opacity-100 translate-y-0"
                            leave-active-class="transition duration-150 ease-in"
                            leave-from-class="opacity-100 translate-y-0"
                            leave-to-class="opacity-0 -translate-y-2"
                        >
                            <div v-if="showAddTermForm" class="mb-5 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                                <h3 class="font-semibold text-sm text-pink-700 dark:text-pink-300 mb-3">Add a new term</h3>
                                <div class="flex flex-wrap gap-3 items-end">
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">Academic year (B.E.)</label>
                                        <input
                                            v-model.number="newTermYear"
                                            type="number"
                                            min="2560"
                                            max="2600"
                                            class="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                        />
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">Semester</label>
                                        <select
                                            v-model.number="newTermSemester"
                                            class="w-20 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                        >
                                            <option :value="1">1</option>
                                            <option :value="2">2</option>
                                        </select>
                                    </div>
                                    <div class="text-sm text-slate-500 dark:text-slate-400 pb-2">
                                        → ID: <span class="font-mono text-pink-600 dark:text-pink-400">{{ newTermId }}</span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button @click="addTerm" class="btn-primary text-sm px-4 py-2 interactive-press">
                                            <Check :size="15" />
                                        </button>
                                        <button @click="showAddTermForm = false; termDupError = ''" class="btn-secondary text-sm px-4 py-2 interactive-press">
                                            <X :size="15" />
                                        </button>
                                    </div>
                                </div>
                                <p v-if="termDupError" class="text-xs text-red-500 mt-2">{{ termDupError }}</p>
                            </div>
                        </Transition>

                        <!-- Terms List -->
                        <div class="space-y-2">
                            <div
                                v-for="term in termStore.terms"
                                :key="term.id"
                                class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl"
                            >
                                <div class="flex items-center gap-3">
                                    <span
                                        :class="[
                                            'w-2 h-2 rounded-full',
                                            term.id === termStore.activeTerm ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'
                                        ]"
                                    />
                                    <div>
                                        <div v-if="editingTermId === term.id" class="flex items-center gap-2">
                                            <input
                                                v-model="editingTermLabel"
                                                class="px-2 py-1 text-sm rounded-lg border border-pink-300 dark:border-pink-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                                @keydown.enter="saveEditTerm"
                                                @keydown.escape="editingTermId = null"
                                            />
                                            <button @click="saveEditTerm" class="text-pink-500 hover:text-pink-600">
                                                <Check :size="16" />
                                            </button>
                                            <button @click="editingTermId = null" class="text-slate-400 hover:text-slate-600">
                                                <X :size="16" />
                                            </button>
                                        </div>
                                        <div v-else>
                                            <span class="font-medium text-slate-800 dark:text-slate-200">Term {{ term.label }}</span>
                                            <span v-if="term.isDefault" class="ml-2 text-xs text-slate-400 dark:text-slate-500">(default)</span>
                                            <span v-if="term.id === termStore.activeTerm" class="ml-2 text-xs bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-full">Current</span>
                                        </div>
                                        <div class="text-xs text-slate-400 dark:text-slate-500">ID: {{ term.id }}</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button
                                        v-if="term.id !== termStore.activeTerm"
                                        @click="termStore.setActiveTerm(term.id)"
                                        class="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                                    >
                                        Set as current
                                    </button>
                                    <button
                                        v-if="editingTermId !== term.id"
                                        @click="startEditTerm(term.id, term.label)"
                                        class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <Edit2 :size="15" />
                                    </button>
                                    <button
                                        v-if="!term.isDefault"
                                        @click="termStore.deleteTerm(term.id)"
                                        class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 :size="15" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ═══ SUBJECTS TAB ════════════════════════════════════════════════ -->
                <div v-else-if="activeTab === 'subjects'" class="space-y-4">
                    <div class="glass-card p-6 shadow-glass">
                        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5">Subjects</h2>

                        <!-- Selectors + Add button -->
                        <div class="flex flex-wrap gap-4 mb-5">
                            <div class="flex flex-col gap-1.5">
                                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Term</label>
                                <select
                                    v-model="subjectsTermId"
                                    class="appearance-none px-4 py-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer"
                                >
                                    <option v-for="term in termStore.terms" :key="term.id" :value="term.id">
                                        Term {{ term.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Grade</label>
                                <select
                                    v-model="subjectsGrade"
                                    class="appearance-none px-4 py-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer"
                                >
                                    <option v-for="g in ['1','2','3','4','5','6']" :key="g" :value="g">M.{{ g }}</option>
                                </select>
                            </div>
                            <div class="flex items-end">
                                <button
                                    @click="resetSubjectForm(); showAddSubjectForm = true"
                                    class="btn-primary text-sm flex items-center gap-2 interactive-press"
                                >
                                    <Plus :size="16" /> Add subject
                                </button>
                            </div>
                        </div>

                        <!-- Search & Filters -->
                        <div class="flex flex-wrap gap-3 mb-5">
                            <div class="relative flex-1 min-w-[180px]">
                                <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    v-model="subjectSearch"
                                    type="text"
                                    placeholder="Search code, name, instructor…"
                                    class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                />
                            </div>
                            <select
                                v-model="subjectFilterSlot"
                                class="appearance-none px-3 py-2.5 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer"
                            >
                                <option value="">All time slots</option>
                                <option v-for="slot in availableSlots" :key="slot" :value="slot">{{ slot }}</option>
                            </select>
                        </div>

                        <!-- Import panel -->
                        <div class="mb-5 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                            <div class="flex items-start gap-3 mb-4">
                                <div class="w-9 h-9 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0">
                                    <Upload :size="17" class="text-pink-600 dark:text-pink-400" />
                                </div>
                                <div>
                                    <h3 class="font-semibold text-sm text-slate-800 dark:text-slate-200">Import subjects from a file</h3>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Upload a <span class="font-mono">.csv</span> or <span class="font-mono">.xlsx</span> file. Rows are added to
                                        <span class="font-medium">M.{{ subjectsGrade }}</span>, term <span class="font-medium">{{ subjectsTermId }}</span>.
                                    </p>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-3">
                                <button @click="subjectFileRef?.click()" class="btn-primary text-sm flex items-center gap-2 interactive-press">
                                    <Upload :size="15" /> Choose file
                                </button>
                                <button @click="downloadXlsxTemplate" class="btn-secondary text-sm flex items-center gap-2 interactive-press">
                                    <FileDown :size="15" /> Example .xlsx
                                </button>
                                <button @click="downloadCsvTemplate" class="btn-secondary text-sm flex items-center gap-2 interactive-press">
                                    <FileDown :size="15" /> Example .csv
                                </button>
                                <input ref="subjectFileRef" type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="handleSubjectImport" />
                            </div>
                            <p class="text-xs text-slate-400 dark:text-slate-500 mt-3">
                                Columns: <span class="font-mono">{{ IMPORT_COLUMNS.join(', ') }}</span>
                            </p>
                            <p v-if="subjectImportMsg" :class="['text-xs mt-2 px-3 py-2 rounded-lg', subjectImportError ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400']">
                                {{ subjectImportMsg }}
                            </p>
                        </div>

                        <!-- Add/Edit Form -->
                        <Transition
                            enter-active-class="transition duration-200 ease-out"
                            enter-from-class="opacity-0 -translate-y-2"
                            enter-to-class="opacity-100 translate-y-0"
                            leave-active-class="transition duration-150"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                        >
                            <div v-if="showAddSubjectForm" class="mb-6 p-5 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                                <h3 class="font-semibold text-sm text-pink-700 dark:text-pink-300 mb-4">
                                    {{ editingSubjectIndex !== null ? 'Edit subject' : 'Add new subject' }}
                                </h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div v-for="field in ([
                                        { key: 'code', label: 'Subject code', placeholder: 'e.g. W20202' },
                                        { key: 'name', label: 'Subject name', placeholder: 'e.g. Thai Art' },
                                        { key: 'credit', label: 'Credits', placeholder: '1.0' },
                                        { key: 'group', label: 'Group', placeholder: '1' },
                                        { key: 'instructor', label: 'Instructor', placeholder: 'Instructor name' },
                                    ] as const)" :key="field.key" class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">{{ field.label }}</label>
                                        <input
                                            v-model="(subjectForm as any)[field.key]"
                                            :placeholder="field.placeholder"
                                            class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                        />
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">Class time (elective slot)</label>
                                        <select
                                            v-model="subjectForm.classtime"
                                            class="appearance-none px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer"
                                        >
                                            <option value="" disabled>Select a slot…</option>
                                            <option v-for="slot in classtimeOptions" :key="slot" :value="slot">{{ slot }}</option>
                                        </select>
                                        <p v-if="electiveSlotOptions.length === 0" class="text-[11px] text-amber-600 dark:text-amber-400">
                                            No elective slots defined for M.{{ subjectsGrade }} timetables.
                                        </p>
                                    </div>
                                    <div v-for="field in ([
                                        { key: 'classroom', label: 'Classroom', placeholder: 'e.g. Room 101' },
                                        { key: 'enrollment', label: 'Capacity', placeholder: '30' },
                                        { key: 'electiveQuantity', label: 'Elective seats', placeholder: '30' },
                                    ] as const)" :key="field.key" class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">{{ field.label }}</label>
                                        <input
                                            v-model="(subjectForm as any)[field.key]"
                                            :placeholder="field.placeholder"
                                            class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                        />
                                    </div>
                                </div>
                                <div class="flex gap-2 mt-4">
                                    <button @click="saveSubject" class="btn-primary text-sm flex items-center gap-2 interactive-press">
                                        <Save :size="15" /> Save
                                    </button>
                                    <button @click="resetSubjectForm" class="btn-secondary text-sm interactive-press">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </Transition>

                        <!-- Subject list (all: live catalog + custom) -->
                        <div v-if="subjectsLoading" class="flex justify-center py-10">
                            <div class="animate-spin w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full" />
                        </div>
                        <template v-else>
                            <div v-if="filteredSubjectsList.length === 0" class="text-center py-10 text-slate-400 dark:text-slate-500">
                                <BookOpen :size="32" class="mx-auto mb-2 opacity-40" />
                                <p class="text-sm">
                                    {{ allSubjectsRaw.length === 0
                                        ? `No subjects for M.${subjectsGrade}, term ${subjectsTermId} yet.`
                                        : 'No subjects match your search or filters.' }}
                                </p>
                            </div>
                            <template v-else>
                                <p class="text-xs text-slate-400 dark:text-slate-500 mb-2">
                                    Showing {{ filteredSubjectsList.length }} of {{ allSubjectsRaw.length }} subjects
                                </p>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-sm min-w-[760px]">
                                        <thead>
                                            <tr class="text-left border-b border-slate-200 dark:border-slate-700">
                                                <th class="pb-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Code</th>
                                                <th class="pb-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Name</th>
                                                <th class="pb-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Credits</th>
                                                <th class="pb-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Instructor</th>
                                                <th class="pb-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Time</th>
                                                <th class="pb-2 font-medium text-slate-600 dark:text-slate-400"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                                v-for="item in filteredSubjectsList"
                                                :key="`${item.subject.code}-${item.isCustom ? 'c' + item.customIndex : 'l'}`"
                                                class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                            >
                                                <td class="py-3 pr-4 font-mono text-xs text-slate-500 dark:text-slate-400">{{ item.subject.code }}</td>
                                                <td class="py-3 pr-4 font-medium text-slate-800 dark:text-slate-200">{{ item.subject.name }}</td>
                                                <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ item.subject.credit }}</td>
                                                <td class="py-3 pr-4 text-slate-500 dark:text-slate-400 text-xs max-w-[160px] truncate">{{ getSubjectInstructor(item.subject) }}</td>
                                                <td class="py-3 pr-4 text-slate-500 dark:text-slate-500 text-xs">{{ getSubjectClasstime(item.subject) }}</td>
                                                <td class="py-3">
                                                    <div v-if="item.isCustom" class="flex gap-1">
                                                        <button @click="startEditSubject(item.customIndex!)" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                            <Edit2 :size="14" />
                                                        </button>
                                                        <button @click="deleteSubject(item.customIndex!)" class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                            <Trash2 :size="14" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </template>
                        </template>
                    </div>
                </div>

                <!-- ═══ TIMETABLES TAB ══════════════════════════════════════════════ -->
                <div v-else-if="activeTab === 'timetables'">
                    <!-- List Mode -->
                    <div v-if="timetableMode === 'list'" class="glass-card p-6 shadow-glass">
                        <div class="flex items-center justify-between mb-5">
                            <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">All timetables</h2>
                            <button
                                @click="showNewTTForm = !showNewTTForm"
                                class="btn-primary text-sm flex items-center gap-2 interactive-press"
                            >
                                <Plus :size="16" /> New timetable
                            </button>
                        </div>

                        <!-- New Timetable Form -->
                        <Transition
                            enter-active-class="transition duration-200 ease-out"
                            enter-from-class="opacity-0 -translate-y-2"
                            enter-to-class="opacity-100 translate-y-0"
                            leave-active-class="transition duration-150"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                        >
                            <div v-if="showNewTTForm" class="mb-6 p-5 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                                <h3 class="font-semibold text-sm text-pink-700 dark:text-pink-300 mb-3">Create a new timetable</h3>
                                <div class="flex flex-wrap gap-3 items-end">
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">ID (no spaces)</label>
                                        <input v-model="newTTId" placeholder="e.g. M1-Custom" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-40" />
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">Name</label>
                                        <input v-model="newTTLabel" placeholder="e.g. M.1 Special" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-40" />
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">Grade</label>
                                        <select v-model.number="newTTGrade" class="appearance-none px-3 py-2 pr-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer w-24">
                                            <option v-for="g in [1,2,3,4,5,6]" :key="g" :value="g">M.{{ g }}</option>
                                        </select>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">Copy from (optional)</label>
                                        <select v-model="newTTCopyFrom" class="appearance-none px-3 py-2 pr-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer w-40">
                                            <option value="">— Start empty —</option>
                                            <option v-for="(tt, id) in allTimetables" :key="id" :value="id">{{ tt.label }}</option>
                                        </select>
                                    </div>
                                    <div class="flex gap-2">
                                        <button @click="startNewTimetable" class="btn-primary text-sm px-4 py-2 interactive-press">Create</button>
                                        <button @click="showNewTTForm = false; newTTError = ''" class="btn-secondary text-sm px-4 py-2 interactive-press">Cancel</button>
                                    </div>
                                </div>
                                <p v-if="newTTError" class="text-xs text-red-500 mt-2">{{ newTTError }}</p>
                            </div>
                        </Transition>

                        <!-- Timetable List -->
                        <div class="space-y-2">
                            <div
                                v-for="(tt, id) in allTimetables"
                                :key="id"
                                class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-pink-200 dark:hover:border-pink-800 transition-colors"
                            >
                                <div>
                                    <span class="font-medium text-slate-800 dark:text-slate-200">{{ tt.label }}</span>
                                    <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                        ID: <span class="font-mono">{{ tt.id }}</span> · M.{{ tt.grade }}
                                        <span v-if="!BASE_TIMETABLES[id]" class="ml-2 text-pink-500 dark:text-pink-400">● custom</span>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button @click="openEditTimetable(id as string)" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                        <Edit2 :size="16" />
                                    </button>
                                    <button
                                        v-if="!BASE_TIMETABLES[id]"
                                        @click="deleteTimetable(id as string)"
                                        class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 :size="16" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Mode -->
                    <div v-else-if="timetableMode === 'edit' && draftTimetable" class="space-y-4">
                        <!-- Toolbar -->
                        <div class="glass-card p-4 shadow-glass flex flex-wrap items-center justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <button @click="timetableMode = 'list'; draftTimetable = null; editingCell = null" class="btn-secondary text-sm flex items-center gap-2 interactive-press">
                                    <X :size="15" /> Cancel
                                </button>
                                <div>
                                    <span class="font-bold text-slate-800 dark:text-slate-200">{{ draftTimetable.label }}</span>
                                    <span class="text-xs text-slate-400 dark:text-slate-500 ml-2">{{ draftIsNew ? 'New timetable' : 'Editing' }}</span>
                                </div>
                            </div>
                            <button @click="saveDraftTimetable" class="btn-primary text-sm flex items-center gap-2 interactive-press">
                                <Save :size="15" /> Save timetable
                            </button>
                        </div>

                        <!-- Cell Editor -->
                        <Transition
                            enter-active-class="transition duration-200 ease-out"
                            enter-from-class="opacity-0 -translate-y-1"
                            enter-to-class="opacity-100 translate-y-0"
                        >
                            <div v-if="editingCell" class="glass-card p-5 shadow-glass border-pink-200 dark:border-pink-800">
                                <div class="flex items-center gap-2 mb-3">
                                    <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Edit cell — {{ DAY_NAMES_TH[editingCell.day] }} period {{ editingCell.period }}
                                    </span>
                                    <button @click="editingCell = null" class="ml-auto text-slate-400 hover:text-slate-600">
                                        <X :size="16" />
                                    </button>
                                </div>
                                <div class="flex flex-wrap gap-3 items-end">
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">Type</label>
                                        <select v-model="cellForm.type" class="appearance-none px-3 py-2 pr-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer">
                                            <option value="core">Core</option>
                                            <option value="elective">Elective</option>
                                            <option value="break">Break</option>
                                        </select>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">Name</label>
                                        <input v-model="cellForm.name" placeholder="e.g. Mathematics" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-44" />
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-xs text-slate-600 dark:text-slate-400">Subject code</label>
                                        <input v-model="cellForm.code" placeholder="e.g. MA101" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-32" />
                                    </div>
                                    <button @click="applyCell" class="btn-primary text-sm flex items-center gap-2 interactive-press">
                                        <Check :size="15" /> Apply
                                    </button>
                                </div>
                            </div>
                        </Transition>

                        <!-- Grid -->
                        <div class="glass-card p-4 shadow-glass overflow-x-auto">
                            <p class="text-xs text-slate-400 dark:text-slate-500 mb-3">Click a cell to edit it.</p>
                            <table class="w-full border-collapse min-w-[800px] table-fixed">
                                <thead>
                                    <tr>
                                        <th class="border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 w-20 text-xs text-slate-600 dark:text-slate-400">Day / Period</th>
                                        <th
                                            v-for="period in PERIODS"
                                            :key="period"
                                            class="border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 text-center text-xs text-slate-600 dark:text-slate-400"
                                        >{{ period }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="day in DAYS" :key="day">
                                        <td class="border border-slate-200 dark:border-slate-700 p-2 text-center text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                                            {{ DAY_NAMES_TH[day] }}
                                        </td>
                                        <td
                                            v-for="period in PERIODS"
                                            :key="period"
                                            @click="selectCell(day, period)"
                                            :class="[
                                                'border border-slate-200 dark:border-slate-700 p-1 text-center text-xs cursor-pointer h-16 align-middle transition-all',
                                                editingCell?.day === day && editingCell?.period === period
                                                    ? 'ring-2 ring-pink-500 ring-inset'
                                                    : 'hover:ring-1 hover:ring-pink-300 dark:hover:ring-pink-700 hover:ring-inset',
                                                getCellDisplay(draftTimetable.schedule[day]?.[period]).bg,
                                            ]"
                                        >
                                            {{ getCellDisplay(draftTimetable.schedule[day]?.[period]).text }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <!-- Legend -->
                            <div class="flex flex-wrap gap-3 mt-4">
                                <span v-for="(bg, type) in cellTypeBg" :key="type" :class="['text-xs px-2 py-1 rounded-full', bg]">
                                    {{ cellTypeLabel[type] }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ═══ SETTINGS TAB ════════════════════════════════════════════════ -->
                <div v-else-if="activeTab === 'settings'" class="space-y-4">
                    <!-- Change Password -->
                    <div class="glass-card p-6 shadow-glass">
                        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5">Change password</h2>
                        <form @submit.prevent="handleChangePw" class="space-y-3 max-w-sm">
                            <div>
                                <label class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Current password</label>
                                <div class="relative">
                                    <input v-model="pwCurrent" :type="showPwCurrent ? 'text' : 'password'" class="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
                                    <button type="button" @click="showPwCurrent = !showPwCurrent" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <EyeOff v-if="showPwCurrent" :size="15" /><Eye v-else :size="15" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">New password</label>
                                <div class="relative">
                                    <input v-model="pwNew" :type="showPwNew ? 'text' : 'password'" class="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
                                    <button type="button" @click="showPwNew = !showPwNew" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <EyeOff v-if="showPwNew" :size="15" /><Eye v-else :size="15" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Confirm new password</label>
                                <input v-model="pwConfirm" type="password" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
                            </div>
                            <div v-if="pwMsg" :class="['text-xs px-3 py-2 rounded-lg', pwSuccess ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500']">
                                {{ pwMsg }}
                            </div>
                            <button type="submit" class="btn-primary text-sm w-full py-2.5 interactive-press">Change password</button>
                        </form>
                    </div>

                    <!-- Data Export/Import -->
                    <div class="glass-card p-6 shadow-glass">
                        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Backup data</h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">Export or import your custom terms, subjects, and timetables.</p>
                        <div class="flex flex-wrap gap-3">
                            <button @click="exportData" class="btn-secondary text-sm flex items-center gap-2 interactive-press">
                                <Save :size="16" /> Export data (JSON)
                            </button>
                            <button @click="importFileRef?.click()" class="btn-secondary text-sm flex items-center gap-2 interactive-press">
                                <Plus :size="16" /> Import data
                            </button>
                            <input ref="importFileRef" type="file" accept=".json" class="hidden" @change="handleImport" />
                        </div>
                        <p v-if="importMsg" class="text-xs text-emerald-600 dark:text-emerald-400 mt-3">{{ importMsg }}</p>
                    </div>
                </div>
            </main>

            <footer class="w-full border-t border-slate-200 dark:border-slate-700 py-6 mt-12 z-20 relative">
                <div class="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    CUDSeeReg Admin Panel
                </div>
            </footer>
        </template>
    </div>
</template>
