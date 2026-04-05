<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { GroupedSubject } from '@/types/subject';

const props = defineProps<{
    subject: GroupedSubject;
    description: string;
    dayColors: Record<string, string>;
}>();

const emit = defineEmits<{
    (e: 'view-details', subject: GroupedSubject, groupIndex: number, rect?: DOMRect): void;
}>();

const selectedGroup = ref(0);
const cardRef = ref<HTMLElement | null>(null);

const current = computed(() => props.subject.groups[selectedGroup.value] ?? props.subject.groups[0]);
const hasMultipleGroups = computed(() => props.subject.groups.length > 1);

watch(() => props.subject.groups.length, (len) => {
    if (selectedGroup.value >= len) {
        selectedGroup.value = 0;
    }
});

const handleCardClick = (e: MouseEvent) => {
    const rect = cardRef.value?.getBoundingClientRect() || (e.currentTarget as HTMLElement).getBoundingClientRect();
    emit('view-details', props.subject, selectedGroup.value, rect);
};
</script>

<template>
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
                    :key="`${group.group}-${groupIndex}`"
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
</template>