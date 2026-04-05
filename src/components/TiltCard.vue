<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
    className?: string;
}>();

const cardRef = ref<HTMLElement | null>(null);
const x = ref(0);
const y = ref(0);

const rotateX = computed(() => -y.value * 14);
const rotateY = computed(() => x.value * 14);

const sheenX = computed(() => (x.value + 0.5) * 100);
const sheenY = computed(() => (y.value + 0.5) * 100);
const sheenOpacity = computed(() => {
    const base = 0.15;
    return base - Math.abs(x.value) * 0.15;
});

const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.value) return;
    const rect = cardRef.value.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.value = xPct;
    y.value = yPct;
};

const handleMouseLeave = () => {
    x.value = 0;
    y.value = 0;
};
</script>

<template>
    <div
        ref="cardRef"
        class="relative overflow-hidden cursor-pointer"
        :class="props.className"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
        :style="{
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
            transition: 'transform 0.1s ease-out',
            transformStyle: 'preserve-3d',
            zIndex: 10
        }"
    >
        <slot />

        <!-- Sheen Overlay -->
        <div
            class="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
            :style="{
                background: `radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 50%)`,
                opacity: sheenOpacity,
                left: `${sheenX}%`,
                top: `${sheenY}%`,
                transform: 'translate(-50%, -50%)',
                width: '200%',
                height: '200%'
            }"
        />
    </div>
</template>