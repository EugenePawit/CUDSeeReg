<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { Worker } from 'tesseract.js';
import type { BaseTimetable, FlattenedSubject, UserTimetable } from '@/types/subject';
import { matchScannedCourses, offeringId, planScreenshotImport, type ScannedCourse } from '@/lib/screenshotImport';
const props=defineProps<{catalog: FlattenedSubject[]; timetable: BaseTimetable; existing: UserTimetable}>();
const emit=defineEmits<{close: []; apply: [subjects: FlattenedSubject[]]}>();
const dialog=ref<HTMLDialogElement|null>(null);
const files=ref<File[]>([]), busy=ref(false), progress=ref(''), error=ref('');
const scanProgress=ref(0);
const result=ref<ReturnType<typeof matchScannedCourses>|null>(null);
let worker: Worker | null=null; let disposed=false;
const selected=computed(()=>result.value?.matches.flatMap(m=>m.candidates.filter(s=>offeringId(s)===m.selected))??[]);
const plan=computed(()=>planScreenshotImport(selected.value,props.existing,props.timetable));
onMounted(()=>dialog.value?.showModal());
onBeforeUnmount(()=>{disposed=true; void worker?.terminate();worker=null;});
function choose(event: Event) {
    const input=event.target as HTMLInputElement;
    const additions=Array.from(input.files??[]);
    if(files.value.length+additions.length>12) {error.value='เลือกได้ไม่เกิน 12 รูปต่อครั้ง';return;}
    if(additions.some(f=>!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>15*1024*1024)) {error.value='ใช้รูป PNG, JPEG หรือ WebP ขนาดไม่เกิน 15 MB ต่อรูป';return;}
    files.value.push(...additions);result.value=null;error.value=''; input.value='';
}
async function imageCanvas(file: File) {
    const bitmap=await createImageBitmap(file);
    try {
        const scale=Math.min(2,4000/bitmap.width,4000/bitmap.height);
        const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
        const ctx=canvas.getContext('2d'); if(!ctx)throw new Error('Image unavailable');
        ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);return canvas;
    } finally {bitmap.close();}
}
async function scan() {
    if(!files.value.length||busy.value)return;
    busy.value=true;error.value='';result.value=null;scanProgress.value=0;progress.value='กำลังเตรียมอ่านรูปภาพ';
    let index=0;
    try {
        const [{ createWorker }, { scanScreenshot }]=await Promise.all([import('tesseract.js'),import('@/lib/screenshotOcr')]);
        if(disposed)return;
        const created=await createWorker('tha+eng',1,{});
        if(disposed){await created.terminate();return;} worker=created;
        const courses: ScannedCourse[]=[];
        for(index=0;index<files.value.length;index++) {
            if(disposed)return;
            const canvas=await imageCanvas(files.value[index]);
            if(disposed)return;
            progress.value=`กำลังอ่านรูป ${index+1}/${files.value.length}`;
            try {
                courses.push(...await scanScreenshot(canvas,worker,fraction=>{
                    if(!disposed)scanProgress.value=Math.min(100,Math.round((index+fraction)/files.value.length*100));
                },()=>disposed));
            } finally {canvas.width=canvas.height=1;}
        }
        if(!disposed) {result.value=matchScannedCourses(courses,props.catalog);if(!courses.length)error.value='ไม่พบรหัสวิชา ลองใช้รูปที่คมชัดขึ้นหรือตัดรูปให้เหลือรายการวิชา';}
    } catch(e) {if(!disposed){console.error(e);error.value='อ่านรูปไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตและลองใช้รูปที่คมชัดขึ้น';}}
    finally {await worker?.terminate();worker=null;busy.value=false;}
}
function apply() {if(!plan.value.conflicts.length&&plan.value.additions.length)emit('apply',plan.value.additions);}
</script>
<template>
    <dialog ref="dialog" aria-labelledby="screenshot-import-title" class="screenshot-import-dialog bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 backdrop:bg-black/50" @cancel.prevent="emit('close')">
        <div class="import-layout flex flex-col">
            <header class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
                <h2 id="screenshot-import-title" class="text-lg sm:text-xl font-semibold">นำเข้าวิชาจากรูปภาพ</h2>
                <button type="button" aria-label="ปิด" class="min-h-11 min-w-11 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" @click="emit('close')">✕</button>
            </header>
            <div class="p-4 sm:p-6 overflow-y-auto overscroll-contain min-h-0">
                <p class="text-sm text-slate-500 mb-4">{{ timetable.label }} · {{ timetable.termId }} — เลือกรูปรายการวิชาของภาคเรียนนี้ได้หลายรูป แล้วตรวจสอบวิชาและกลุ่มก่อนเพิ่ม</p>
                <label class="block text-sm font-medium mb-2">รูปภาพรายการวิชา<input type="file" accept="image/png,image/jpeg,image/webp" multiple :disabled="busy" class="block mt-2 w-full min-w-0 text-base file:mr-3 file:rounded-lg file:border-0 file:bg-pink-50 file:px-3 file:py-3 file:text-pink-700" @change="choose" /></label>
                <ul class="my-3 text-sm space-y-1"><li v-for="(file,i) in files" :key="i" class="flex items-center justify-between gap-2"><span class="break-all min-w-0">{{ file.name }}</span><button v-if="!busy" type="button" class="min-h-11 min-w-11 shrink-0 text-pink-600 rounded-lg" :aria-label="`ลบ ${file.name}`" @click="files.splice(i,1);result=null">ลบ</button></li></ul>
                <button type="button" class="btn-primary min-h-11 w-full sm:w-auto disabled:opacity-50" :disabled="!files.length||busy" @click="scan">{{ busy?'กำลังอ่านรูป…':'สแกนรูปภาพ' }}</button>
                <div v-if="busy" class="mt-4">
                    <div class="flex justify-between gap-3 text-sm mb-2"><span role="status">{{ progress }}</span><span class="tabular-nums">{{ scanProgress }}%</span></div>
                    <progress :value="scanProgress" max="100" aria-label="ความคืบหน้าการอ่านรูปภาพ" class="scan-progress block w-full h-2.5 rounded-full overflow-hidden" />
                </div>
                <p v-if="error" role="alert" class="text-sm text-red-600 mt-3">{{ error }}</p>
                <template v-if="result">
                    <p class="text-sm mt-5 mb-3">พบวิชาเพิ่มเติม {{ result.matches.length }} รายการ · ตัดรายการซ้ำ {{ result.duplicates }} รายการ · ไม่อยู่ในวิชาเพิ่มเติม {{ result.ignored.length }} รายการ</p>
                    <p class="text-sm text-slate-500 mb-3">ตรวจสอบให้ตรงกับภาพ หากไม่พบกลุ่มหรืออ่านไม่ชัด กรุณาเลือกเอง วิชาพื้นฐานจะไม่ถูกเพิ่ม</p>
                    <div v-for="(match,i) in result.matches" :key="i" class="border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-3 min-w-0">
                        <p class="text-xs text-slate-500 break-words">อ่านได้: {{ match.source.text }} · {{ match.source.code }}</p>
                        <p class="font-medium text-sm mt-2 break-words">{{ match.candidates[0]?.code }} {{ match.candidates[0]?.name }}</p>
                        <label class="text-sm block mt-2">กลุ่มเรียน<select v-model="match.selected" class="block w-full min-w-0 min-h-11 text-base mt-1 p-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-600"><option value="">เลือกกลุ่ม หรือข้าม</option><option v-for="s in match.candidates" :key="offeringId(s)" :value="offeringId(s)">{{ s.code }} · กลุ่ม {{ s.group }} · {{ s.classtime }}</option></select></label>
                        <p v-if="match.recovered" class="text-xs text-amber-600 mt-2">รหัสอาจอ่านคลาดเคลื่อน กรุณายืนยันวิชา</p>
                    </div>
                    <details v-if="result.ignored.length" class="text-sm mb-4"><summary class="py-3">รายการที่ไม่ตรงกับวิชาเพิ่มเติม</summary><ul class="mt-2 space-y-1 break-words"><li v-for="(s,i) in result.ignored" :key="i">{{ s.code }} {{ s.text }}</li></ul></details>
                </template>
            </div>
            <footer v-if="result" class="p-4 sm:px-6 border-t border-slate-200 dark:border-slate-700 shrink-0 import-footer">
                <ul v-if="plan.conflicts.length" role="alert" class="text-sm text-red-600 mb-3 max-h-24 overflow-y-auto"><li v-for="message in plan.conflicts" :key="message">{{ message }}</li></ul>
                <p v-if="plan.duplicates" class="text-sm mb-3">มีในตารางแล้ว {{ plan.duplicates }} รายการ จะไม่เพิ่มซ้ำ</p>
                <button type="button" class="btn-primary min-h-11 w-full disabled:opacity-50" :disabled="!plan.additions.length||!!plan.conflicts.length" @click="apply">เพิ่ม {{ plan.additions.length }} วิชาในตาราง</button>
            </footer>
        </div>
    </dialog>
</template>
<style scoped>
.screenshot-import-dialog { width: min(44rem, calc(100% - 2rem)); max-height: 90dvh; border-radius: 1rem; padding: 0; overflow: hidden; }
.import-layout { max-height: 90dvh; }
.import-footer { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
.scan-progress { appearance: none; background: #e2e8f0; accent-color: #ec4899; }
.scan-progress::-webkit-progress-bar { background: #e2e8f0; border-radius: 999px; }
.scan-progress::-webkit-progress-value { background: #ec4899; border-radius: 999px; transition: width 150ms; }
.scan-progress::-moz-progress-bar { background: #ec4899; border-radius: 999px; }
@media (max-width: 639px) {
    .screenshot-import-dialog { width: 100%; height: 100dvh; max-height: 100dvh; max-width: none; margin: 0; border: 0; border-radius: 0; }
    .import-layout { height: 100%; max-height: 100dvh; }
}
</style>
