<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { Plus, X, Download, Trash2, ChevronDown, Share2, Check } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { useTimetableStore } from '@/stores/timetable';
import { BASE_TIMETABLES, DAYS, DAY_NAMES_TH, PERIODS } from '@/lib/baseTimetables';
import { PERIOD_TIMES } from '@/lib/thaiTimeParser';
import { fetchSubjects, flattenSubjects } from '@/lib/dataFetcher';
import {
    decodeTimetableShare,
    encodeTimetableShare,
    resolveSharedSubjects,
} from '@/lib/shareTimetable';
import type { FlattenedSubject } from '@/types/subject';
import PlannerModal from '@/components/PlannerModal.vue';

const DAY_COLORS: Record<string, string> = {
    Monday: 'day-monday',
    Tuesday: 'day-tuesday',
    Wednesday: 'day-wednesday',
    Thursday: 'day-thursday',
    Friday: 'day-friday',
};

const GRADES = ['1', '2', '3', '4', '5', '6'];
const PROGRAMS: Record<string, { value: string; label: string }[]> = {
    '1': [{ value: 'EP', label: 'EP' }, { value: 'Normal', label: 'ปกติ' }],
    '2': [{ value: 'EP', label: 'EP' }, { value: 'Normal', label: 'ปกติ' }],
    '3': [{ value: 'EP', label: 'EP' }, { value: 'Normal', label: 'ปกติ' }],
    '4': [{ value: 'Science', label: 'วิทย์-คณิต' }, { value: 'Arts', label: 'ศิลป์' }],
    '5': [{ value: 'Science', label: 'วิทย์-คณิต' }, { value: 'Arts', label: 'ศิลป์' }],
    '6': [{ value: 'Science', label: 'วิทย์-คณิต' }, { value: 'Arts', label: 'ศิลป์' }],
};

const FEEDBACK_TIMEOUT_MS = 2800;

function getDefaultProgram(grade: string): string {
    return ['1', '2', '3'].includes(grade) ? 'EP' : 'Science';
}

function normalizeProgram(grade: string, program: string): string {
    const options = PROGRAMS[grade] ?? [];
    if (options.some((item) => item.value === program)) {
        return program;
    }
    return getDefaultProgram(grade);
}

function parseBaseTimetableId(baseTimetableId: string): { grade: string; program: string } | null {
    const match = baseTimetableId.match(/^M([1-6])-(EP|Normal|Science|Arts)$/);
    if (!match) {
        return null;
    }
    return {
        grade: match[1],
        program: match[2],
    };
}

function makeSubjectIdentity(subject: FlattenedSubject): string {
    return `${subject.code}||${subject.group || ''}||${subject.classtime || ''}`;
}

const route = useRoute();
const timetableStore = useTimetableStore();
const { baseTimetableId, selectedElectives } = storeToRefs(timetableStore);

const modalOpen = ref(false);
const selectedSlot = ref<{ day: string; period: number } | null>(null);
const subjects = ref<FlattenedSubject[]>([]);
const subjectsGrade = ref<number | null>(null);
const loading = ref(false);
const searchQuery = ref('');
const feedback = ref('');
const didCopyShareLink = ref(false);

const timetableRef = ref<HTMLElement | null>(null);
const feedbackTimeoutRef = ref<number | null>(null);
const appliedShareTokenRef = ref<string | null>(null);
const pendingSharedPayload = ref<{ b: string; s: Array<{ c: string; g: string; t: string }> } | null>(null);

const parsedFromStore = computed(() => {
    return parseBaseTimetableId(baseTimetableId.value) ?? { grade: '1', program: 'EP' };
});

const programs = computed(() => PROGRAMS[parsedFromStore.value.grade] ?? []);

const baseTimetable = computed(() => {
    return baseTimetableId.value ? BASE_TIMETABLES[baseTimetableId.value] ?? null : null;
});

const shareToken = computed(() => {
    return route.query.tt as string | undefined;
});

const decodedSharePayload = computed(() => decodeTimetableShare(shareToken.value ?? null));

const setTransientFeedback = (message: string) => {
    feedback.value = message;
    if (feedbackTimeoutRef.value !== null) {
        window.clearTimeout(feedbackTimeoutRef.value);
    }
    feedbackTimeoutRef.value = window.setTimeout(() => {
        feedback.value = '';
    }, FEEDBACK_TIMEOUT_MS);
};

watch(baseTimetable, async (newBaseTimetable) => {
    if (!newBaseTimetable) {
        subjects.value = [];
        subjectsGrade.value = null;
        loading.value = false;
        return;
    }

    loading.value = true;
    subjectsGrade.value = null;

    try {
        const data = await fetchSubjects(newBaseTimetable.grade);
        subjects.value = flattenSubjects(data);
        subjectsGrade.value = newBaseTimetable.grade;
    } catch (err) {
        console.error('Failed to fetch subjects:', err);
        subjects.value = [];
        subjectsGrade.value = newBaseTimetable.grade;
    } finally {
        loading.value = false;
    }
}, { immediate: true });

watch([shareToken, decodedSharePayload], () => {
    if (!shareToken.value || !decodedSharePayload.value) {
        return;
    }
    if (appliedShareTokenRef.value === shareToken.value) {
        return;
    }

    const parsed = parseBaseTimetableId(decodedSharePayload.value.b);
    if (!parsed || !BASE_TIMETABLES[decodedSharePayload.value.b]) {
        setTransientFeedback('ลิงก์แชร์ไม่ถูกต้อง');
        return;
    }

    pendingSharedPayload.value = decodedSharePayload.value;
    if (baseTimetableId.value !== decodedSharePayload.value.b) {
        timetableStore.setBaseTimetableId(decodedSharePayload.value.b);
    }
}, { immediate: true });

watch([pendingSharedPayload, shareToken, baseTimetableId, subjectsGrade, loading], () => {
    if (!pendingSharedPayload.value || !shareToken.value) {
        return;
    }
    if (pendingSharedPayload.value.b !== baseTimetableId.value) {
        return;
    }

    const expectedGrade = BASE_TIMETABLES[pendingSharedPayload.value.b]?.grade;
    if (typeof expectedGrade === 'number' && subjectsGrade.value !== expectedGrade) {
        return;
    }
    if (loading.value) {
        return;
    }

    const { resolved, missing } = resolveSharedSubjects(pendingSharedPayload.value.s, subjects.value);
    timetableStore.replaceTimetable(pendingSharedPayload.value.b, resolved);
    pendingSharedPayload.value = null;
    appliedShareTokenRef.value = shareToken.value;

    if (missing.length > 0) {
        setTransientFeedback(`นำเข้าแล้ว ${resolved.length} วิชา (ไม่พบ ${missing.length} วิชา)`);
    } else {
        setTransientFeedback(`นำเข้าตารางแล้ว ${resolved.length} วิชา`);
    }
});

const occupiedSlots = computed(() => {
    const occupied = new Set<string>();
    for (const day of Object.keys(selectedElectives.value)) {
        for (const period of Object.keys(selectedElectives.value[day])) {
            occupied.add(`${day}:${period}`);
        }
    }
    return occupied;
});

const selectedSubjectKeys = computed(() => {
    const keys = new Set<string>();
    for (const day of Object.keys(selectedElectives.value)) {
        for (const periodKey of Object.keys(selectedElectives.value[day])) {
            const period = Number(periodKey);
            const subject = selectedElectives.value[day]?.[period];
            if (subject) {
                keys.add(makeSubjectIdentity(subject));
            }
        }
    }
    return keys;
});

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase());

const filteredSubjects = computed(() => {
    if (!selectedSlot.value) {
        return [];
    }

    return subjects.value.filter((subject) => {
        const matchesSlot = subject.parsedTimeSlots.some(
            (slot) => slot.day === selectedSlot.value!.day && slot.periods.includes(selectedSlot.value!.period)
        );
        if (!matchesSlot) {
            return false;
        }

        const duplicateSelected = selectedSubjectKeys.value.has(makeSubjectIdentity(subject));
        if (duplicateSelected) {
            return false;
        }

        const hasOverlap = subject.parsedTimeSlots.some((slot) =>
            slot.periods.some((period) => occupiedSlots.value.has(`${slot.day}:${period}`))
        );
        if (hasOverlap) {
            return false;
        }

        if (!normalizedSearch.value) {
            return true;
        }

        const searchText = `${subject.name} ${subject.code} ${subject.instructor}`.toLowerCase();
        return searchText.includes(normalizedSearch.value);
    });
});

const handleGradeChange = (nextGrade: string) => {
    const nextProgram = normalizeProgram(nextGrade, parsedFromStore.value.program);
    const nextBaseId = `M${nextGrade}-${nextProgram}`;
    timetableStore.setBaseTimetableId(nextBaseId);
};

const handleProgramChange = (nextProgram: string) => {
    const nextBaseId = `M${parsedFromStore.value.grade}-${nextProgram}`;
    timetableStore.setBaseTimetableId(nextBaseId);
};

const handleSlotClick = (day: string, period: number) => {
    if (!baseTimetable.value) {
        return;
    }
    const entry = baseTimetable.value.schedule[day]?.[period];
    if (entry?.type === 'elective' && !selectedElectives.value[day]?.[period]) {
        selectedSlot.value = { day, period };
        searchQuery.value = '';
        modalOpen.value = true;
    }
};

const handleSelectSubject = (subject: FlattenedSubject) => {
    const fallbackSlot = subject.parsedTimeSlots[0];
    if (!fallbackSlot) {
        return;
    }
    timetableStore.addElective(fallbackSlot.day, fallbackSlot.startPeriod, subject);
    modalOpen.value = false;
    searchQuery.value = '';
};

const handleExport = async () => {
    if (!timetableRef.value) {
        return;
    }
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(timetableRef.value, { scale: 2, backgroundColor: '#fff' });
    const link = document.createElement('a');
    link.download = `timetable-${baseTimetable.value?.label || 'cudseereg'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};

const handleCopyShareLink = async () => {
    const token = encodeTimetableShare(baseTimetableId.value, selectedElectives.value);
    if (!token) {
        setTransientFeedback('ไม่สามารถสร้างลิงก์แชร์ได้');
        return;
    }

    const params = new URLSearchParams(route.query as Record<string, string>);
    params.set('tt', token);

    const url = `${window.location.origin}${route.path}?${params.toString()}`;

    try {
        await navigator.clipboard.writeText(url);
    } catch {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
    }

    didCopyShareLink.value = true;
    window.setTimeout(() => {
        didCopyShareLink.value = false;
    }, 1800);
    setTransientFeedback('คัดลอกลิงก์แชร์แล้ว');
};

const handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        modalOpen.value = false;
    }
};

watch(modalOpen, (isOpen) => {
    if (isOpen) {
        window.addEventListener('keydown', handleEsc);
    } else {
        window.removeEventListener('keydown', handleEsc);
    }
});

onUnmounted(() => {
    if (feedbackTimeoutRef.value !== null) {
        window.clearTimeout(feedbackTimeoutRef.value);
    }
    window.removeEventListener('keydown', handleEsc);
});

type CellType = { type: 'empty'; content: null } |
    { type: 'break'; content: string } |
    { type: 'core'; content: { code: string; name: string } } |
    { type: 'elective'; content: FlattenedSubject } |
    { type: 'elective-empty'; content: null };

const getCellContent = (day: string, period: number): CellType => {
    const entry = baseTimetable.value?.schedule[day]?.[period];
    const elective = selectedElectives.value[day]?.[period];

    if (!entry) {
        return { type: 'empty', content: null };
    }

    if (entry.type === 'break') {
        return { type: 'break', content: period === 5 ? 'พักเที่ยง' : 'พัก' };
    }

    if (entry.type === 'core') {
        return { type: 'core', content: { code: entry.code, name: entry.name } };
    }

    if (elective) {
        return { type: 'elective', content: elective };
    }

    return { type: 'elective-empty', content: null };
};

const removeElective = (day: string, period: number) => {
    timetableStore.removeElective(day, period);
};
</script>

<template>
    <div class="min-h-screen flex flex-col pt-32 pb-12">
        <main class="container mx-auto px-4 max-w-7xl flex-grow flex flex-col z-10 w-full relative">
            <h1 class="text-5xl md:text-6xl font-sans font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-400 mb-8 drop-shadow-sm">
                วางแผนตารางเรียน
            </h1>

            <div class="glass-card shadow-glass p-6 rounded-bento backdrop-blur-2xl mb-8 relative z-20">
                <h2 class="text-xl font-bold mb-5 text-slate-800 drop-shadow-sm">เลือกตารางพื้นฐาน</h2>
                <div class="flex flex-wrap gap-6 items-end">
                    <div class="flex flex-col gap-2 w-full sm:w-auto">
                        <label class="text-sm text-slate-600 font-medium">ระดับชั้น</label>
                        <div class="relative">
                            <select
                                :value="parsedFromStore.grade"
                                @change="handleGradeChange(($event.target as HTMLSelectElement).value)"
                                class="appearance-none w-full sm:w-48 bg-white border border-slate-200 rounded-xl px-5 py-3 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 backdrop-blur-md cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <option v-for="grade in GRADES" :key="grade" :value="grade" class="text-slate-900 bg-white">
                                    ม.{{ grade }}
                                </option>
                            </select>
                            <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" :size="18" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 w-full sm:w-auto">
                        <label class="text-sm text-slate-600 font-medium">แผนการเรียน</label>
                        <div class="relative">
                            <select
                                :value="parsedFromStore.program"
                                @change="handleProgramChange(($event.target as HTMLSelectElement).value)"
                                class="appearance-none w-full sm:w-48 bg-white border border-slate-200 rounded-xl px-5 py-3 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 backdrop-blur-md cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <option v-for="program in programs" :key="program.value" :value="program.value" class="text-slate-900 bg-white">
                                    {{ program.label }}
                                </option>
                            </select>
                            <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" :size="18" />
                        </div>
                    </div>
                </div>
            </div>

            <template v-if="!baseTimetable">
                <div class="glass-card p-12 shadow-glass backdrop-blur-2xl rounded-bento text-center border-slate-200 z-20">
                    <p class="text-slate-500 text-lg font-medium">กรุณาเลือกตารางพื้นฐานด้านบน</p>
                </div>
            </template>
            <template v-else>
                <div class="flex flex-wrap justify-between items-center mb-6 gap-4 z-20 relative">
                    <div>
                        <p class="text-slate-600 font-medium tracking-wide">
                            คลิกที่ช่อง <span class="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-md mx-1 border border-pink-200">วิชาเลือก</span> เพื่อเพิ่มวิชา
                        </p>
                        <p v-if="feedback" class="text-sm text-emerald-600 mt-2 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                            {{ feedback }}
                        </p>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <button
                            @click="handleCopyShareLink"
                            class="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-xl transition-all interactive-press flex items-center gap-2 shadow-sm"
                        >
                            <Check v-if="didCopyShareLink" :size="18" class="text-pink-600" />
                            <Share2 v-else :size="18" />
                            {{ didCopyShareLink ? 'คัดลอกแล้ว' : 'แชร์ตาราง' }}
                        </button>
                        <button
                            @click="timetableStore.clearAllElectives()"
                            class="btn-secondary flex items-center gap-2 interactive-press"
                        >
                            <Trash2 :size="18" /> ล้างทั้งหมด
                        </button>
                        <button
                            @click="handleExport"
                            class="btn-primary flex items-center gap-2 interactive-press"
                        >
                            <Download :size="18" /> ดาวน์โหลด
                        </button>
                    </div>
                </div>

                <div ref="timetableRef" class="glass-card shadow-glass p-6 rounded-bento overflow-x-auto backdrop-blur-2xl border-slate-200 z-20 relative text-slate-800">
                    <table class="w-full border-collapse min-w-[1200px] table-fixed">
                        <thead>
                            <tr>
                                <th class="border border-slate-200 bg-slate-100 p-2 w-24 min-w-[6rem] text-slate-700">วัน</th>
                                <th
                                    v-for="period in PERIODS"
                                    :key="period"
                                    class="border border-slate-200 bg-slate-100 p-2 text-center text-slate-700"
                                >
                                    <div class="font-medium text-slate-800">{{ period }}</div>
                                    <div class="text-xs text-slate-500">{{ PERIOD_TIMES[period] }}</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="day in DAYS" :key="day">
                                <td :class="['border border-slate-200 p-2 text-center font-medium', DAY_COLORS[day]]">
                                    {{ DAY_NAMES_TH[day] }}
                                </td>
                                <template v-for="period in PERIODS" :key="period">
                                    <td
                                        v-if="getCellContent(day, period).type === 'empty'"
                                        class="border border-slate-200 p-2 bg-slate-50 backdrop-blur-sm"
                                    />
                                    <td
                                        v-else-if="getCellContent(day, period).type === 'break'"
                                        class="border border-slate-200 bg-amber-50 text-amber-700 p-2 text-center text-sm h-24 align-middle"
                                    >
                                        {{ (getCellContent(day, period).content as string) }}
                                    </td>
                                    <td
                                        v-else-if="getCellContent(day, period).type === 'core'"
                                        class="border border-slate-200 bg-white p-2 text-center text-sm h-24 align-middle whitespace-normal shadow-sm"
                                    >
                                        <div class="text-slate-500 font-mono text-xs mb-1">
                                            {{ (getCellContent(day, period).content as {code: string; name: string}).code }}
                                        </div>
                                        <div class="font-semibold text-slate-800 tracking-wide">
                                            {{ (getCellContent(day, period).content as {code: string; name: string}).name }}
                                        </div>
                                    </td>
                                    <td
                                        v-else-if="getCellContent(day, period).type === 'elective'"
                                        class="border border-slate-200 bg-emerald-100 text-emerald-800 p-2 relative group h-24 align-middle interactive-press backdrop-blur-md"
                                    >
                                        <div class="text-[10px] font-mono text-emerald-600 whitespace-nowrap">
                                            {{ (getCellContent(day, period).content as FlattenedSubject).code }}
                                            <span v-if="(getCellContent(day, period).content as FlattenedSubject).group"> กลุ่ม {{ (getCellContent(day, period).content as FlattenedSubject).group }}</span>
                                        </div>
                                        <div class="text-xs font-semibold text-emerald-900 mt-1 leading-tight">
                                            {{ (getCellContent(day, period).content as FlattenedSubject).name }}
                                        </div>
                                        <button
                                            @click.stop="removeElective(day, period)"
                                            class="absolute top-1 right-1 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 interactive-press"
                                        >
                                            <X :size="12" />
                                        </button>
                                    </td>
                                    <td
                                        v-else
                                        @click="handleSlotClick(day, period)"
                                        class="border border-slate-200 bg-purple-50 text-purple-700 p-2 hover:bg-purple-100 cursor-pointer transition-colors group relative h-24 align-middle interactive-press backdrop-blur-md"
                                    >
                                        <div class="flex flex-col items-center justify-center h-full text-purple-400 group-hover:text-purple-600">
                                            <Plus :size="20" />
                                            <span class="text-xs mt-1 font-medium tracking-wide">วิชาเลือก</span>
                                        </div>
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </main>

        <PlannerModal
            :is-open="modalOpen"
            :selected-slot="selectedSlot"
            :search-query="searchQuery"
            :loading="loading"
            :base-timetable="baseTimetable"
            :filtered-subjects="filteredSubjects"
            @close="modalOpen = false"
            @search-change="searchQuery = $event"
            @select-subject="handleSelectSubject"
        />

        <footer class="w-full border-t border-slate-200 py-6 mt-12 z-20 relative">
            <div class="container mx-auto px-4 text-center text-sm text-slate-500">
                <p class="mt-1">CUDSeeReg © 2026</p>
            </div>
        </footer>
    </div>
</template>