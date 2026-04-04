<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search } from 'lucide-vue-next';
import { fetchSubjects, flattenSubjects, groupSubjectsByCode, fetchSubjectDescriptions } from '@/lib/dataFetcher';
import type { GroupedSubject } from '@/types/subject';
import TiltCard from '@/components/TiltCard.vue';

const DAY_COLORS: Record<string, string> = {
    'จ': 'bg-yellow-100 text-yellow-700',
    'อ': 'bg-pink-100 text-pink-700',
    'พ': 'bg-green-100 text-green-700',
    'พฤ': 'bg-orange-100 text-orange-700',
    'ศ': 'bg-blue-100 text-blue-700',
};

function normalizeText(input: string): string {
    return input.trim().toLowerCase();
}

const route = useRoute();
const router = useRouter();

const grade = ref(5);
const subjects = ref<GroupedSubject[]>([]);
const loading = ref(false);
const search = ref('');
const deferredSearch = ref('');
const descriptions = ref<Record<string, string>>({});
const modalData = ref<{ subject: GroupedSubject; groupIndex: number; description: string; anchor?: DOMRect } | null>(null);
const isMounted = ref(false);
const isMobile = ref(false);
const modalPositionStyle = ref({});

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(search, (newVal) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        deferredSearch.value = newVal;
    }, 300);
});

// Get grade from query params
const gradeValue = computed(() => {
    const g = route.query.grade as string;
    const parsed = g ? parseInt(g, 10) : null;
    return parsed && parsed >= 1 && parsed <= 6 ? parsed : 5;
});

const normalizedSearch = computed(() => normalizeText(deferredSearch.value));

const filteredSubjects = computed(() => {
    if (!normalizedSearch.value) {
        return subjects.value;
    }
    return subjects.value.filter((subject) => {
        const firstGroup = subject.groups[0];
        const haystack = `${subject.code} ${subject.name} ${firstGroup?.instructor ?? ''}`.toLowerCase();
        return haystack.includes(normalizedSearch.value);
    });
});

// Handle grade change and update URL
const handleGradeChange = (nextGrade: number) => {
    const params = new URLSearchParams(route.query as Record<string, string>);
    params.set('grade', nextGrade.toString());
    router.replace({ query: Object.fromEntries(params) });
};

// Handle view details modal
const handleViewDetails = (subject: GroupedSubject, groupIndex: number, rect?: DOMRect) => {
    updateModalPosition(rect);
    modalData.value = { subject, groupIndex, description: descriptions.value[subject.code] || '', anchor: rect };
};

// Update modal position based on anchor
const updateModalPosition = (anchor?: DOMRect) => {
    if (!anchor || isMobile.value) {
        modalPositionStyle.value = {};
        return;
    }

    const cardCenter = anchor.left + (anchor.width / 2);
    const modalWidth = 448;
    let left = cardCenter - (modalWidth / 2);
    const top = anchor.top - 48;

    left = Math.max(16, left);
    const maxLeft = window.innerWidth - modalWidth - 16;
    left = Math.min(left, maxLeft);

    modalPositionStyle.value = {
        position: 'fixed' as const,
        top: `${top}px`,
        left: `${left}px`,
        width: '100%',
        maxWidth: '28rem',
        margin: '0',
    };
};

// Modal close
const closeModal = () => {
    modalData.value = null;
};

// Keyboard handler for Escape
const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        closeModal();
    }
};

watch(modalData, (newVal) => {
    if (newVal) {
        window.addEventListener('keydown', handleKeydown);
    } else {
        window.removeEventListener('keydown', handleKeydown);
    }
}, { immediate: true });

// Load data when grade changes
watch(gradeValue, async (newGrade) => {
    if (!newGrade) return;
    let cancelled = false;
    setLoading(true);

    try {
        const [data, descs] = await Promise.all([fetchSubjects(newGrade), fetchSubjectDescriptions(newGrade)]);
        if (cancelled) return;
        const flattened = flattenSubjects(data);
        const grouped = groupSubjectsByCode(flattened);
        subjects.value = grouped;
        descriptions.value = descs;
    } catch (error) {
        console.error(error);
    } finally {
        if (!cancelled) setLoading(false);
    }
}, { immediate: true });

onMounted(() => {
    isMounted.value = true;
    isMobile.value = window.innerWidth < 768;
    window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth < 768;
    });
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    if (searchTimeout) clearTimeout(searchTimeout);
});

// Subject Card component
const SubjectCard = {
    props: {
        subject: { type: Object as () => GroupedSubject, required: true },
        description: { type: String, default: '' },
        dayColors: { type: Object as () => Record<string, string>, required: true },
    },
    emits: ['view-details'],
    setup(props: any, { emit }: any) {
        const selectedGroup = ref(0);
        const cardRef = ref<HTMLElement | null>(null);

        const current = computed(() => props.subject.groups[selectedGroup.value] ?? props.subject.groups[0]);
        const hasMultipleGroups = computed(() => props.subject.groups.length > 1);

        watch(() => props.subject.groups.length, (len: number) => {
            if (selectedGroup.value >= len) {
                selectedGroup.value = 0;
            }
        });

        const handleCardClick = (e: MouseEvent) => {
            const rect = cardRef.value?.getBoundingClientRect() || (e.currentTarget as HTMLElement).getBoundingClientRect();
            emit('view-details', props.subject, selectedGroup.value, rect);
        };

        return { selectedGroup, cardRef, current, hasMultipleGroups, handleCardClick };
    },
    template: `
        <div
            ref="cardRef"
            class="w-full h-full p-6 relative flex flex-col justify-between z-30 cursor-pointer group"
            @click="handleCardClick"
        >
            <div
                class="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 group-hover:bg-pink-100 flex items-center justify-center text-slate-600 group-hover:text-pink-600 transition-all duration-300 group-hover:scale-110 z-40 shadow-sm"
                aria-label="Show details"
            >
                <span class="text-sm font-bold font-sans">i</span>
            </div>

            <div class="mb-4 pr-10">
                <div class="text-sm font-mono tracking-widest text-pink-500 font-semibold mb-1 uppercase drop-shadow-sm">{{ subject.code }}</div>
                <h3 class="text-2xl font-black text-slate-800 leading-tight tracking-tight drop-shadow-sm">{{ subject.name }}</h3>
            </div>

            <div v-if="hasMultipleGroups" class="mb-5 relative z-40">
                <select
                    v-model="selectedGroup"
                    @click.stop
                    class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none cursor-pointer hover:bg-slate-50 transition-colors relative z-50"
                >
                    <option
                        v-for="(group, groupIndex) in subject.groups"
                        :key="\`\${group.group}-\${groupIndex}\`"
                        :value="groupIndex"
                        class="text-slate-900 bg-white"
                    >
                        กลุ่ม {{ group.group }} - {{ group.instructor }}
                    </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
            </div>

            <div class="mt-auto">
                <div class="text-sm text-slate-600 space-y-3 font-medium">
                    <div v-if="!hasMultipleGroups" class="text-slate-700">
                        <span class="text-slate-500 mr-2">อาจารย์:</span>{{ current.instructor }}
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <template v-if="current.parsedTimeSlots.length > 0">
                            <span
                                v-for="(timeSlot, timeIndex) in current.parsedTimeSlots"
                                :key="timeIndex"
                                :class="['px-3 py-1 rounded-full text-xs font-semibold shadow-sm', dayColors[timeSlot.dayAbbrev] || 'bg-slate-100 text-slate-700']"
                            >
                                {{ timeSlot.dayAbbrev }}. {{ timeSlot.timeRange }}
                            </span>
                        </template>
                        <span v-else class="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs italic">
                            ไม่มีข้อมูลเวลา
                        </span>
                    </div>
                    <div class="flex items-center gap-3 pt-2">
                        <span class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                            {{ subject.credit }} หน่วยกิต
                        </span>
                        <span class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                            รับ {{ current.availableSeats }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `,
};

// Modal Content component
const ModalContent = {
    props: {
        data: { type: Object as (): { subject: GroupedSubject; groupIndex: number; description: string; anchor?: DOMRect } | null, required: true },
        descriptions: { type: Object as () => Record<string, string>, required: true },
        dayColors: { type: Object as () => Record<string, string>, required: true },
    },
    emits: ['close', 'select-group'],
    setup(props: any, { emit }: any) {
        const currentGroup = computed(() => {
            if (!props.data) return null;
            return props.data.subject.groups[props.data.groupIndex] ?? props.data.subject.groups[0];
        });

        const hasMultipleGroups = computed(() => {
            if (!props.data) return false;
            return props.data.subject.groups.length > 1;
        });

        return { currentGroup, hasMultipleGroups };
    },
    template: `
        <div v-if="data && currentGroup">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <div class="text-sm font-mono text-pink-600 mb-1">{{ data.subject.code }}</div>
                    <h3 class="text-xl font-bold text-slate-900">{{ data.subject.name }}</h3>
                </div>
                <button
                    @click="emit('close')"
                    class="text-slate-400 hover:text-slate-600 text-2xl leading-none interactive-press"
                >
                    ×
                </button>
            </div>

            <div class="space-y-3 text-sm">
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 pb-3 border-b border-slate-100">
                    <div>
                        <span class="text-slate-500 text-xs uppercase tracking-wider font-semibold">หน่วยกิต</span>
                        <div class="font-medium text-slate-800">{{ data.subject.credit }}</div>
                    </div>
                    <div v-if="currentGroup.classPerWeek">
                        <span class="text-slate-500 text-xs uppercase tracking-wider font-semibold">ชม./สัปดาห์</span>
                        <div class="font-medium text-slate-800">{{ currentGroup.classPerWeek }}</div>
                    </div>
                    <div v-if="currentGroup.enrollment" class="col-span-2">
                        <span class="text-slate-500 text-xs uppercase tracking-wider font-semibold">เปิดรับ</span>
                        <div class="font-medium text-slate-800">{{ currentGroup.enrollment }}</div>
                    </div>
                </div>

                <div>
                    <div class="font-bold text-slate-800 mb-2">กลุ่มเรียน:</div>
                    <div class="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        <div
                            v-for="(group, idx) in data.subject.groups"
                            :key="\`\${group.group}-\${idx}\`"
                            :class="[
                                'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                                idx === data.groupIndex
                                    ? 'bg-pink-50 border-pink-200 ring-1 ring-pink-200'
                                    : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-pink-100 hover:shadow-sm'
                            ]"
                            @click="emit('select-group', idx)"
                        >
                            <div class="flex justify-between items-start mb-1">
                                <div>
                                    <span class="font-semibold text-pink-700">กลุ่ม {{ group.group }}</span>
                                    <span class="text-slate-600 ml-2 text-sm">{{ group.instructor }}</span>
                                </div>
                                <div class="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    รับ {{ group.availableSeats }}
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-1 mt-2">
                                <template v-if="group.parsedTimeSlots.length > 0">
                                    <span
                                        v-for="(timeSlot, timeIndex) in group.parsedTimeSlots"
                                        :key="timeIndex"
                                        :class="['px-2 py-1 rounded text-xs', dayColors[timeSlot.dayAbbrev] || 'bg-pink-100 text-pink-700']"
                                    >
                                        {{ timeSlot.dayAbbrev }}. {{ timeSlot.timeRange }}
                                    </span>
                                </template>
                                <span v-else class="text-xs text-slate-400 italic">ไม่มีข้อมูลเวลา</span>
                            </div>
                            <div v-if="group.note" class="text-xs text-amber-700 mt-2 bg-amber-50 p-1.5 rounded border border-amber-100">{{ group.note }}</div>
                        </div>
                    </div>
                </div>

                <div v-if="(descriptions[data.subject.code] || data.description)?.trim()" class="pt-2 border-t border-slate-200">
                    <span class="font-medium text-slate-700">รายละเอียด:</span>
                    <p class="text-slate-600 mt-1 leading-relaxed">{{ descriptions[data.subject.code] || data.description }}</p>
                </div>
            </div>
        </div>
    `,
};

const { emit } = { emit: (event: string, ...args: any[]) => {} };
</script>

<template>
    <div class="min-h-screen flex flex-col pt-32 pb-12">
        <main class="container mx-auto px-4 max-w-7xl flex-grow flex flex-col z-10 w-full relative">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <h1 class="text-5xl md:text-7xl font-sans font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-400 mb-3 drop-shadow-sm">
                        รายวิชาเรียน
                    </h1>
                    <p class="text-slate-600 font-medium text-lg tracking-wide">สำรวจและวางแผนวิชาเลือกที่เปิดสอน</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                <!-- Grade Selector -->
                <div class="md:col-span-5 glass-card p-2 shadow-glass rounded-full flex gap-1 z-20 relative">
                    <button
                        v-for="itemGrade in [1, 2, 3, 4, 5, 6]"
                        :key="itemGrade"
                        @click="handleGradeChange(itemGrade)"
                        :class="[
                            'flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-300',
                            gradeValue === itemGrade
                                ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        ]"
                    >
                        ม.{{ itemGrade }}
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="md:col-span-7 glass-card shadow-glass relative rounded-full overflow-hidden flex items-center z-20">
                    <Search class="absolute left-6 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อวิชา, รหัสวิชา, หรืออาจารย์ผู้สอน..."
                        v-model="search"
                        class="w-full pl-14 pr-6 py-4 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base border-none ring-0 outline-none"
                    />
                </div>
            </div>

            <div v-if="loading" class="flex justify-center py-32 flex-grow items-center">
                <div class="animate-spin w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full" />
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(280px,auto)]">
                <div
                    v-for="(subject, index) in filteredSubjects"
                    :key="subject.code"
                    class="col-span-1 w-full h-full relative z-10 stagger-item"
                    :style="{ animationDelay: `${index * 0.05}s` }"
                >
                    <TiltCard class="w-full h-full glass-card hover:border-pink-300 transition-colors">
                        <SubjectCard
                            :subject="subject"
                            :description="descriptions[subject.code] || ''"
                            :day-colors="DAY_COLORS"
                            @view-details="handleViewDetails"
                        />
                    </TiltCard>
                </div>
            </div>
        </main>

        <footer class="glass-card border-t border-white/20 py-6 mt-12">
            <div class="container mx-auto px-4 text-center text-sm text-slate-600">
                <p class="mt-1">CUDSeeReg © 2026</p>
            </div>
        </footer>

        <!-- Modal with Teleport -->
        <Teleport to="body">
            <div
                v-if="modalData && isMounted"
                :class="[
                    'modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4',
                    modalData.anchor && !isMobile ? 'bg-black/20 block overflow-y-auto' : 'bg-black/50'
                ]"
                @click="closeModal"
            >
                <div
                    v-if="!modalData.anchor || isMobile"
                    class="modal-content bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/40"
                    @click.stop
                >
                    <ModalContent
                        :data="modalData"
                        :descriptions="descriptions"
                        :day-colors="DAY_COLORS"
                        @close="closeModal"
                        @select-group="(idx: number) => { if (modalData) modalData.groupIndex = idx; }"
                    />
                </div>
                <div
                    v-else
                    class="modal-content bg-white rounded-2xl p-6 shadow-2xl border border-white/40"
                    :style="modalPositionStyle"
                    @click.stop
                >
                    <ModalContent
                        :data="modalData"
                        :descriptions="descriptions"
                        :day-colors="DAY_COLORS"
                        @close="closeModal"
                        @select-group="(idx: number) => { if (modalData) modalData.groupIndex = idx; }"
                    />
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script lang="ts">
import SubjectCard from './SubjectCard.vue';
import ModalContent from './ModalContent.vue';

export default {
    components: {
        SubjectCard,
        ModalContent,
    },
};
</script>