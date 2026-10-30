<script setup lang="ts">
defineProps<{
    classroom: string;
    classroomMilitary?: string;
}>();
</script>

<template>
    <dl class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <div>
            <dt class="font-semibold">ห้องเรียน</dt>
            <dd class="mt-0.5 whitespace-pre-line break-words">{{ classroom.trim() || 'ยังไม่ระบุ' }}</dd>
        </div>
        <div v-if="classroomMilitary?.trim()">
            <dt class="font-semibold">ห้องเรียน (ช่วง รด.)</dt>
            <dd class="mt-0.5 whitespace-pre-line break-words">{{ classroomMilitary }}</dd>
        </div>
    </dl>
</template>
