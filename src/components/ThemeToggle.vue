<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { Sun, Moon, Monitor } from 'lucide-vue-next';

const mode = useColorMode({
  emitAuto: true,
  modes: {
    // custom modes if any
  },
});

const toggleMode = () => {
  if (mode.value === 'auto') {
    mode.value = 'light';
  } else if (mode.value === 'light') {
    mode.value = 'dark';
  } else {
    mode.value = 'auto';
  }
};
</script>

<template>
  <button
    @click="toggleMode"
    class="p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 transition-all interactive-press"
    aria-label="Toggle theme"
    title="Toggle theme"
  >
    <Monitor v-if="mode === 'auto'" :size="20" />
    <Sun v-else-if="mode === 'light'" :size="20" />
    <Moon v-else :size="20" />
  </button>
</template>
