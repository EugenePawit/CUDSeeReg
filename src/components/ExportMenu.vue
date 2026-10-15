<script setup lang="ts">
import { ref } from 'vue';
import { Share2, X, Link, Image, Download, List, LoaderCircle } from 'lucide-vue-next';

const props = defineProps<{ busy: boolean; canCopyImage: boolean; hasSubjects: boolean }>();
const emit = defineEmits<{ action: [action: 'link' | 'copy-image' | 'download-image' | 'list'] }>();
const dialog = ref<HTMLDialogElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const position = ref({ top: '0px', left: '0px' });

function open() {
    if (props.busy || !trigger.value) return;
    const bounds = trigger.value.getBoundingClientRect();
    position.value = {
        top: `${Math.max(16, Math.min(bounds.bottom + 8, window.innerHeight - 400))}px`,
        left: `${Math.max(16, Math.min(bounds.right - 320, window.innerWidth - 336))}px`,
    };
    dialog.value?.showModal();
}

function choose(action: 'link' | 'copy-image' | 'download-image' | 'list') {
    dialog.value?.close();
    emit('action', action);
}

function dismiss(event: MouseEvent) {
    const element = dialog.value;
    if (element && event.target === element) {
        const bounds = element.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
            element.close();
        }
    }
}
</script>

<template>
    <button ref="trigger" type="button" class="btn-primary flex items-center gap-2 interactive-press disabled:opacity-60 disabled:cursor-wait"
        :disabled="busy" :aria-busy="busy" :aria-label="busy ? 'กำลังเตรียมรูปภาพ' : 'แชร์ / ส่งออก'" :title="busy ? 'กำลังเตรียมรูปภาพ...' : 'แชร์ / ส่งออก'" aria-haspopup="dialog" @click="open">
        <LoaderCircle v-if="busy" :size="18" class="animate-spin" />
        <span v-else class="flex items-center gap-1" aria-hidden="true"><Share2 :size="17" /><Download :size="17" /></span>
    </button>
    <Teleport to="body">
        <dialog ref="dialog" aria-labelledby="export-title" :style="{ '--export-top': position.top, '--export-left': position.left }"
            class="export-dialog bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xl p-4" @click="dismiss">
            <div class="flex items-center justify-between px-2 mb-3">
                <h2 id="export-title" class="font-semibold text-lg">แชร์ / ส่งออก</h2>
                <button type="button" aria-label="ปิด" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" @click="dialog?.close()"><X :size="20" /></button>
            </div>
            <div class="flex flex-col gap-1">
                <button type="button" class="export-option" @click="choose('link')"><Link :size="20" /><span>คัดลอกลิงก์</span></button>
                <button type="button" class="export-option" :disabled="!canCopyImage" :aria-describedby="!canCopyImage ? 'copy-image-help' : undefined" @click="choose('copy-image')">
                    <Image :size="20" /><span>คัดลอกรูปภาพ<small v-if="!canCopyImage" id="copy-image-help">เบราว์เซอร์นี้ไม่รองรับ กรุณาดาวน์โหลดรูปภาพ</small></span>
                </button>
                <button type="button" class="export-option" @click="choose('download-image')"><Download :size="20" /><span>ดาวน์โหลดรูปภาพ</span></button>
                <button type="button" class="export-option" :disabled="!hasSubjects" @click="choose('list')"><List :size="20" /><span>คัดลอกรายชื่อวิชา</span></button>
            </div>
        </dialog>
    </Teleport>
</template>

<style scoped>
.export-dialog { position: fixed; inset: auto 0 0; margin: 0; width: 100%; max-width: none; max-height: 90dvh; border-radius: 24px 24px 0 0; padding-bottom: max(16px, env(safe-area-inset-bottom)); }
.export-dialog::backdrop { background: rgb(15 23 42 / 0.35); }
.export-option { display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 12px; border-radius: 12px; text-align: left; }
.export-option:hover:not(:disabled), .export-option:focus-visible { background: rgb(236 72 153 / 0.08); }
.export-option:focus-visible { outline: 2px solid #ec4899; outline-offset: -2px; }
.export-option:disabled { opacity: 0.45; cursor: not-allowed; }
.export-option svg { flex-shrink: 0; }
.export-option small { display: block; margin-top: 3px; font-size: 12px; opacity: 0.7; }
@media (min-width: 640px) {
    .export-dialog { inset: var(--export-top) auto auto var(--export-left); width: 320px; border-radius: 20px; max-height: calc(100dvh - 32px); }
    .export-dialog::backdrop { background: transparent; }
}
</style>
