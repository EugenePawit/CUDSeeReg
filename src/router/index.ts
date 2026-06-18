import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            alias: ['/planner', '/p'],
            name: 'planner',
            component: () => import('@/views/PlannerView.vue'),
        },
        {
            path: '/search',
            name: 'search',
            component: HomeView,
        },
    ],
});

export default router;
