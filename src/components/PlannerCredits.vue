<script setup lang="ts">
import { computed, ref } from 'vue';
import { Calculator } from 'lucide-vue-next';
import { parseCredit, summarizePlannerCredits } from '@/lib/plannerCredits';
import type { UserTimetable } from '@/types/subject';

const props = defineProps<{ electives: UserTimetable }>();
const targetInput = ref('');
const summary = computed(() => summarizePlannerCredits(props.electives));
const target = computed(() => parseCredit(targetInput.value));
const difference = computed(() => target.value === null ? null
    : Number((target.value - summary.value.total).toFixed(10)));
const progress = computed(() => target.value && target.value > 0
    ? Math.min(100, summary.value.total / target.value * 100) : 0);
</script>

<template>
    <section aria-labelledby="credit-calculator-title" class="glass-card shadow-glass p-5 sm:p-6 rounded-bento mb-6 relative z-20 border-slate-200 dark:border-slate-700">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
                <h2 id="credit-calculator-title" class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Calculator :size="20" class="text-pink-600 dark:text-pink-400" /> คำนวณหน่วยกิตวิชาเลือก
                </h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">รวมเฉพาะวิชาเลือกที่เพิ่มในตาราง ไม่รวมวิชาพื้นฐาน</p>
            </div>
            <div class="flex items-end gap-6 flex-wrap">
                <div role="status" class="text-pink-700 dark:text-pink-300">
                    <span class="text-3xl font-semibold tabular-nums">{{ summary.total }}</span>
                    <span class="ml-2 text-sm">หน่วยกิต{{ summary.unknownCount ? ' (เท่าที่ทราบ)' : '' }}</span>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ summary.courses.length }} วิชา · นับแต่ละวิชาครั้งเดียวแม้เรียนหลายคาบ</p>
                </div>
                <div>
                    <label for="elective-credit-target" class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">เป้าหมายหน่วยกิตวิชาเลือก</label>
                    <input id="elective-credit-target" :value="targetInput" @input="targetInput = ($event.target as HTMLInputElement).value" type="number" min="0" step="any" placeholder="ไม่ระบุ" aria-describedby="credit-target-help"
                        class="w-40 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
                    <p id="credit-target-help" class="text-xs text-slate-500 dark:text-slate-400 mt-1">ระบุได้ตามต้องการ</p>
                </div>
            </div>
        </div>
        <div v-if="difference !== null && !summary.unknownCount" class="mt-4" role="status">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
                <template v-if="difference > 0">ขาดอีก {{ difference }} หน่วยกิตถึงเป้าหมาย</template>
                <template v-else-if="difference === 0">ครบตามเป้าหมายแล้ว</template>
                <template v-else>เกินเป้าหมาย {{ -difference }} หน่วยกิต</template>
            </p>
            <div v-if="target && target > 0" role="progressbar" aria-label="หน่วยกิตวิชาเลือกเทียบกับเป้าหมาย" :aria-valuenow="progress" :aria-valuemin="0" :aria-valuemax="100" class="mt-2 h-2 rounded-full bg-pink-100 dark:bg-pink-900/30 overflow-hidden">
                <div class="h-full rounded-full bg-pink-500 transition-all" :style="{ width: `${progress}%` }" />
            </div>
        </div>
        <p v-else-if="targetInput && target === null" class="mt-3 text-sm text-amber-700 dark:text-amber-400">กรุณาระบุเป้าหมายเป็นตัวเลขตั้งแต่ 0 ขึ้นไป</p>
        <p v-if="summary.unknownCount" class="mt-3 text-sm text-amber-700 dark:text-amber-400">มี {{ summary.unknownCount }} วิชาที่ยังไม่มีข้อมูลหน่วยกิต จึงยังคำนวณยอดรวมที่ครบถ้วนไม่ได้</p>
        <details v-if="summary.courses.length" class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3">
            <summary class="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 focus-visible:outline-pink-500">ดูหน่วยกิตแต่ละวิชา ({{ summary.courses.length }} วิชา)</summary>
            <ul class="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                <li v-for="{ subject, credit } in summary.courses" :key="`${subject.code}||${subject.group}||${subject.classtime}`" class="flex items-center justify-between gap-4 py-2 text-sm">
                    <div class="min-w-0">
                        <p class="text-slate-800 dark:text-slate-200 break-words">{{ subject.name }}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">{{ subject.code }}<span v-if="subject.group"> · กลุ่ม {{ subject.group }}</span></p>
                    </div>
                    <span class="shrink-0 font-medium text-pink-700 dark:text-pink-300">{{ credit === null ? 'ไม่ทราบหน่วยกิต' : `${credit} หน่วยกิต` }}</span>
                </li>
            </ul>
        </details>
        <p v-else class="mt-4 text-sm text-slate-500 dark:text-slate-400">เพิ่มวิชาเลือกในตารางเพื่อเริ่มคำนวณหน่วยกิต</p>
    </section>
</template>
