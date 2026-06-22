<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search } from 'lucide-vue-next';
import { fetchSubjects, flattenSubjects, groupSubjectsByCode, fetchSubjectDescriptions } from '@/lib/dataFetcher';
import type { GroupedSubject } from '@/types/subject';
import TiltCard from '@/components/TiltCard.vue';
import { useTermStore } from '@/stores/term';
import { useAdminStore } from '@/stores/admin';

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
const termStore = useTermStore();
const adminStore = useAdminStore();

const subjects = ref<GroupedSubject[]>([]);
const loading = ref(false);
const search = ref('');
const deferredSearch = ref('');
const descriptions = ref<Record<string, string>>({});
const modalData = ref<{
    subject: GroupedSubject;
    groupIndex: number;
    description: string;
    anchor?: DOMRect;
} | null>(null);
const isMounted = ref(false);
const isMobile = ref(false);
const modalPositionStyle = ref<Record<string, string>>({});
const modalPanelRef = ref<HTMLElement | null>(null);

const MODAL_MARGIN = 16;
const MODAL_MAX_WIDTH = 448;
let modalPositionFrame: number | null = null;
let modalPositionTimeout: ReturnType<typeof setTimeout> | null = null;

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
    return parsed && parsed >= 1 && parsed <= 6 ? parsed : 6;
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
    modalData.value = { subject, groupIndex, description: descriptions.value[subject.code] || '', anchor: rect };
    scheduleModalPositionUpdate(rect);
};

// Update modal position based on anchor
const updateModalPosition = (anchor?: DOMRect) => {
    if (!anchor || isMobile.value) {
        modalPositionStyle.value = {};
        return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = Math.min(MODAL_MAX_WIDTH, viewportWidth - (MODAL_MARGIN * 2));
    const panel = modalPanelRef.value;
    const measuredHeight = panel ? Math.max(panel.getBoundingClientRect().height, panel.scrollHeight) : 520;
    const modalHeight = Math.min(measuredHeight, viewportHeight - (MODAL_MARGIN * 2));
    const cardCenter = anchor.left + (anchor.width / 2);
    let left = cardCenter - (modalWidth / 2);

    left = Math.max(MODAL_MARGIN, left);
    const maxLeft = viewportWidth - modalWidth - MODAL_MARGIN;
    left = Math.min(left, maxLeft);

    let top = anchor.top + (anchor.height / 2) - (modalHeight / 2);
    top = Math.max(MODAL_MARGIN, top);
    const maxTop = viewportHeight - modalHeight - MODAL_MARGIN;
    top = Math.min(top, Math.max(MODAL_MARGIN, maxTop));

    modalPositionStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${modalWidth}px`,
        maxWidth: '28rem',
        maxHeight: `calc(100vh - ${MODAL_MARGIN * 2}px)`,
        overflowY: 'auto',
        margin: '0',
    };
};

const scheduleModalPositionUpdate = (anchor?: DOMRect) => {
    if (modalPositionFrame !== null) {
        window.cancelAnimationFrame(modalPositionFrame);
    }
    if (modalPositionTimeout !== null) {
        clearTimeout(modalPositionTimeout);
    }

    nextTick(() => {
        updateModalPosition(anchor);
        modalPositionFrame = window.requestAnimationFrame(() => {
            updateModalPosition(anchor);
        });
        modalPositionTimeout = setTimeout(() => {
            updateModalPosition(anchor);
            modalPositionTimeout = null;
        }, 350);
    });
};

// Modal close
const closeModal = () => {
    modalData.value = null;
};

const selectModalGroup = (idx: number) => {
    if (!modalData.value) return;
    modalData.value.groupIndex = idx;
    scheduleModalPositionUpdate(modalData.value.anchor);
};

// Keyboard handler for Escape
const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        closeModal();
    }
};

const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
    updateModalPosition(modalData.value?.anchor);
};

watch(modalData, (newVal) => {
    if (newVal) {
        window.addEventListener('keydown', handleKeydown);
    } else {
        window.removeEventListener('keydown', handleKeydown);
    }
}, { immediate: true });

// Load data when grade or active term changes (dataRevision re-triggers this
// once the backend hydrates).
watch([gradeValue, () => termStore.activeTerm, () => termStore.dataRevision], async ([newGrade]) => {
    if (!newGrade) return;
    loading.value = true;

    try {
        await adminStore.ensureSubjects(termStore.activeTerm, String(newGrade));
        const [data, descs] = await Promise.all([fetchSubjects(newGrade), fetchSubjectDescriptions(newGrade)]);
        // The live CUD catalog only applies to the term it was published for
        // (the default term); other terms show only admin-managed subjects.
        const liveData = termStore.isLiveDataTerm ? data : [];
        const customRaw = adminStore.getSubjects(termStore.activeTerm, String(newGrade));
        const merged = [...liveData, ...customRaw];
        const flattened = flattenSubjects(merged);
        const grouped = groupSubjectsByCode(flattened);
        subjects.value = grouped;
        descriptions.value = descs;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}, { immediate: true });

onMounted(() => {
    isMounted.value = true;
    isMobile.value = window.innerWidth < 768;
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', handleResize);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (modalPositionFrame !== null) window.cancelAnimationFrame(modalPositionFrame);
    if (modalPositionTimeout !== null) clearTimeout(modalPositionTimeout);
});
</script>

<template>
    <div class="min-h-screen flex flex-col pt-32 pb-12">
        <main class="container mx-auto px-4 max-w-7xl flex-grow flex flex-col z-10 w-full relative">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <h1 class="text-5xl md:text-7xl font-kanit font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-400 mb-3 drop-shadow-sm">
                        รายวิชาเรียน
                    </h1>
                    <p class="text-slate-600 dark:text-slate-400 font-kanit font-normal text-lg tracking-wide">สำรวจและวางแผนวิชาเลือกที่เปิดสอน</p>
                </div>
                <TermSelector />
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
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        ]"
                    >
                        ม.{{ itemGrade }}
                    </button>
                </div>

                <!-- Search Bar -->
                <div class="md:col-span-7 glass-card shadow-glass relative rounded-full overflow-hidden flex items-center z-20">
                    <Search class="absolute left-6 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อวิชา, รหัสวิชา, หรืออาจารย์ผู้สอน..."
                        v-model="search"
                        class="w-full pl-14 pr-6 py-4 bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-base border-none ring-0 outline-none"
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
                    <TiltCard class="w-full h-full glass-card hover:border-pink-300 dark:hover:border-pink-700/50 transition-colors">
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
            <div class="container mx-auto px-4 text-center text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-3">
                <span>CUDSeeReg © 2026</span>
                <ThemeToggle />
            </div>
        </footer>

        <!-- Modal with Teleport -->
        <Teleport to="body">
            <div
                v-if="modalData && isMounted"
                :class="modalData.anchor && !isMobile
                    ? 'modal-overlay fixed inset-0 z-[100] bg-black/20 dark:bg-black/40'
                    : 'modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/70 p-4'"
                @click="closeModal"
            >
                <div
                    v-if="!modalData.anchor || isMobile"
                    class="modal-content bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/40 dark:border-slate-700"
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
                    ref="modalPanelRef"
                    class="modal-content bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-white/40 dark:border-slate-700"
                    :style="modalPositionStyle"
                    @click.stop
                >
                    <ModalContent
                        :data="modalData"
                        :descriptions="descriptions"
                        :day-colors="DAY_COLORS"
                        @close="closeModal"
                        @select-group="selectModalGroup"
                    />
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script lang="ts">
import SubjectCard from './SubjectCard.vue';
import ModalContent from './ModalContent.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import TermSelector from '@/components/TermSelector.vue';

export default {
    components: {
        SubjectCard,
        ModalContent,
        ThemeToggle,
        TermSelector,
    },
};
</script>
