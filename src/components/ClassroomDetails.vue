<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    classroom: string;
    classroomMilitary?: string;
}>();

const showMilitaryClassroom = computed(() => {
    const normalize = (room: string) => room.replace(/\s+/g, ' ').trim();
    const military = normalize(props.classroomMilitary ?? '');
    return military !== '' && military !== normalize(props.classroom);
});
</script>

<template>
    <dl class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <div>
            <dt class="font-semibold">ห้องเรียน</dt>
            <dd class="mt-0.5 whitespace-pre-line break-words">{{ classroom.trim() || 'ยังไม่ระบุ' }}</dd>
        </div>
        <div v-if="showMilitaryClassroom">
            <dt class="font-semibold">ห้องเรียน (ช่วง รด.)</dt>
            <dd class="mt-0.5 whitespace-pre-line break-words">{{ classroomMilitary }}</dd>
        </div>
    </dl>
</template>
