<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { useWindowScroll } from '@vueuse/core';

const route = useRoute();
const { y: scrollY } = useWindowScroll();
const isMounted = ref(false);

onMounted(() => {
    isMounted.value = true;
});

const navWidth = computed(() => scrollY.value > 100 ? '85%' : '100%');
const navY = computed(() => Math.min(scrollY.value * 0.1, 10));
const navBg = computed(() => scrollY.value > 100 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0)');
const navBlur = computed(() => scrollY.value > 100 ? 'blur(24px)' : 'blur(0px)');

const isHome = computed(() => route.path === '/');
const isPlanner = computed(() => route.path === '/planner');

// MagneticButton component
const MagneticButton = defineComponent({
    name: 'MagneticButton',
    setup(_, { slots }) {
        const buttonRef = ref<HTMLElement | null>(null);
        const position = ref({ x: 0, y: 0 });

        const handleMouse = (e: MouseEvent) => {
            if (!buttonRef.value) return;
            const rect = buttonRef.value.getBoundingClientRect();
            const middleX = e.clientX - (rect.left + rect.width / 2);
            const middleY = e.clientY - (rect.top + rect.height / 2);
            position.value = { x: middleX * 0.2, y: middleY * 0.2 };
        };

        const reset = () => {
            position.value = { x: 0, y: 0 };
        };

        return () => {
            return h('div',
                {
                    ref: buttonRef,
                    onMousemove: handleMouse,
                    onMouseleave: reset,
                    class: 'inline-block',
                    style: {
                        transform: `translate(${position.value.x}px, ${position.value.y}px)`,
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }
                },
                slots.default?.()
            );
        };
    },
});
</script>

<template>
    <header
        v-if="isMounted"
        class="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 font-sans pointer-events-none"
        :style="{ transform: `translateY(${navY}px)` }"
    >
        <div
            class="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3 rounded-full shadow-glass pointer-events-auto border overflow-x-auto no-scrollbar"
            :style="{
                width: navWidth,
                maxWidth: '1200px',
                backgroundColor: navBg,
                backdropFilter: navBlur,
                borderColor: 'rgba(0,0,0,0.05)'
            }"
        >
            <RouterLink to="/" class="flex items-center gap-2 shrink-0">
                <span class="text-lg sm:text-xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                    CUD<span class="text-pink-600">See</span>Reg
                </span>
            </RouterLink>

            <nav class="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar overflow-y-hidden">
                <MagneticButton>
                    <RouterLink
                        to="/"
                        :class="[
                            'px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                            isHome ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        ]"
                    >
                        ค้นหาวิชา
                    </RouterLink>
                </MagneticButton>
                <MagneticButton>
                    <RouterLink
                        to="/planner"
                        :class="[
                            'px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                            isPlanner ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        ]"
                    >
                        จัดตาราง
                    </RouterLink>
                </MagneticButton>
            </nav>
        </div>
    </header>

    <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition
            name="page"
            mode="out-in"
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-5 scale-98 blur-10px"
            enter-to-class="opacity-100 translate-y-0 scale-100 blur-0"
            leave-active-class="transition duration-500 ease-out"
            leave-from-class="opacity-100 translate-y-0 scale-100 blur-0"
            leave-to-class="opacity-0 -translate-y-5 scale-96 blur-10px"
        >
            <component :is="Component" :key="currentRoute.path" />
        </Transition>
    </RouterView>
</template>