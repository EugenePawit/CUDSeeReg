<script setup lang="ts">
import { computed } from 'vue';
import type { GroupedSubject } from '@/types/subject';

const props = defineProps<{
    data: {
        subject: GroupedSubject;
        groupIndex: number;
        description: string;
        anchor?: DOMRect;
    } | null;
    descriptions: Record<string, string>;
    dayColors: Record<string, string>;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'select-group', index: number): void;
}>();

const currentGroup = computed(() => {
    if (!props.data) return null;
    return props.data.subject.groups[props.data.groupIndex] ?? props.data.subject.groups[0];
});

const hasMultipleGroups = computed(() => {
    if (!props.data) return false;
    return props.data.subject.groups.length > 1;
});
</script>

<template>
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
                        :key="`${group.group}-${idx}`"
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
</template>