<script setup lang="ts">
import { ref } from 'vue';
import { Calendar, ChevronDown } from 'lucide-vue-next';
import { onClickOutside } from '@vueuse/core';
import { useTermStore } from '@/stores/term';

const termStore = useTermStore();
const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

onClickOutside(containerRef, () => { isOpen.value = false; });

const select = (id: string) => {
    termStore.setActiveTerm(id);
    isOpen.value = false;
};
</script>

<template>
    <div ref="containerRef" class="relative">
        <button
            @click="isOpen = !isOpen"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs sm:text-sm font-medium hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors whitespace-nowrap"
        >
            <Calendar :size="13" />
            <span>ภาคเรียน {{ termStore.currentTerm?.label }}</span>
            <ChevronDown :size="13" :class="['transition-transform duration-200', isOpen ? 'rotate-180' : '']" />
        </button>

        <Transition
            enter-active-class="transition duration-150 ease-out origin-top-right"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in origin-top-right"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="isOpen"
                class="absolute top-full mt-2 right-0 min-w-[170px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
            >
                <button
                    v-for="term in termStore.terms"
                    :key="term.id"
                    @click="select(term.id)"
                    :class="[
                        'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5',
                        term.id === termStore.activeTerm
                            ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    ]"
                >
                    <span :class="['w-1.5 h-1.5 rounded-full shrink-0', term.id === termStore.activeTerm ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600']" />
                    ภาคเรียน {{ term.label }}
                </button>
            </div>
        </Transition>
    </div>
</template>
