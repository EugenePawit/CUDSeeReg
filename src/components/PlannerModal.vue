<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { X } from 'lucide-vue-next';
import { DAY_NAMES_TH } from '@/lib/baseTimetables';
import type { FlattenedSubject, BaseTimetable } from '@/types/subject';

const DAY_COLORS: Record<string, string> = {
    'จ': 'bg-yellow-100 text-yellow-700',
    'อ': 'bg-pink-100 text-pink-700',
    'พ': 'bg-green-100 text-green-700',
    'พฤ': 'bg-orange-100 text-orange-700',
    'ศ': 'bg-blue-100 text-blue-700',
};

const props = defineProps<{
    isOpen: boolean;
    selectedSlot: { day: string; period: number } | null;
    searchQuery: string;
    loading: boolean;
    baseTimetable: BaseTimetable | null;
    filteredSubjects: FlattenedSubject[];
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'searchChange', query: string): void;
    (e: 'selectSubject', subject: FlattenedSubject): void;
}>();

const mounted = ref(false);
onMounted(() => {
    mounted.value = true;
});

const handleSelectSubject = (subject: FlattenedSubject) => {
    emit('selectSubject', subject);
};

const handleSubjectKeydown = (e: KeyboardEvent, subject: FlattenedSubject) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        emit('selectSubject', subject);
    }
};

const slotDisplay = computed(() => {
    if (!props.selectedSlot) return '';
    return `${DAY_NAMES_TH[props.selectedSlot.day]} คาบ ${props.selectedSlot.period}`;
});
</script>

<template>
    <Teleport to="body">
        <div
            v-if="isOpen && selectedSlot && mounted"
            class="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-10"
            @click="emit('close')"
        >
            <div
                class="modal-content bg-white/90 backdrop-blur-3xl border border-slate-200 shadow-glass-lg rounded-bento max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                @click.stop
            >
                <div class="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-black text-slate-800 drop-shadow-sm">
                            เลือกวิชา - {{ slotDisplay }}
                        </h2>
                        <button
                            @click="emit('close')"
                            class="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-colors interactive-press"
                        >
                            <X :size="20" />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาวิชา (ชื่อวิชา, รหัสวิชา, อาจารย์)..."
                        :value="searchQuery"
                        @input="emit('searchChange', ($event.target as HTMLInputElement).value)"
                        class="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-slate-800 placeholder-slate-400 shadow-sm"
                        autofocus
                    />
                </div>
                <div class="p-4 overflow-y-auto max-h-[60vh] custom-scrollbar flex-grow z-10 relative">
                    <div v-if="loading" class="flex justify-center py-12">
                        <div class="animate-spin w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full" />
                    </div>
                    <p v-else-if="filteredSubjects.length === 0" class="text-center text-slate-500 py-12 font-medium">
                        ไม่พบวิชาที่เปิดสอนในคาบนี้
                    </p>
                    <div v-else class="space-y-4 p-2">
                        <div
                            v-for="(subject, index) in filteredSubjects"
                            :key="`${subject.code}-${subject.group}-${index}`"
                            @click="handleSelectSubject(subject)"
                            @keydown="handleSubjectKeydown($event, subject)"
                            tabindex="0"
                            role="button"
                            :aria-label="`เลือก ${subject.name}`"
                            class="stagger-item p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-pink-300 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-sm active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                            :style="{ animationDelay: `${Math.min(index * 0.03, 0.2)}s` }"
                        >
                            <div class="flex justify-between items-start gap-4">
                                <div>
                                    <div class="text-xs font-mono tracking-wider text-pink-600 mb-1">
                                        {{ subject.code }}
                                        <span v-if="subject.group"> กลุ่ม {{ subject.group }}</span>
                                        <span class="ml-2 px-2 py-0.5 bg-pink-100 text-pink-700 rounded-md font-semibold">
                                            {{ subject.credit }} หน่วยกิต
                                        </span>
                                    </div>
                                    <div class="font-bold text-slate-800 text-lg tracking-tight leading-tight mb-1">{{ subject.name }}</div>
                                    <div class="text-sm text-slate-500 font-medium">{{ subject.instructor }}</div>
                                </div>
                                <div class="flex flex-col items-end gap-1 shrink-0">
                                    <span
                                        v-for="(timeSlot, timeIndex) in subject.parsedTimeSlots"
                                        :key="timeIndex"
                                        :class="['px-2.5 py-1 rounded-lg text-xs font-semibold', DAY_COLORS[timeSlot.dayAbbrev] || 'bg-slate-100 text-slate-700']"
                                    >
                                        {{ timeSlot.dayAbbrev }}. {{ timeSlot.timeRange }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>