import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/dataStatistics',
            name: 'dataStatistics',
            component: () => import('../views/DataStatistics.vue')
        },
        {
            path: '/dataAnalysis',
            name: 'dataAnalysis',
            component: () => import('../views/DataAnalysis.vue')
        },
        {
            path: '/',
            name: 'dataSearch',
            component: () => import('../views/DataSearch.vue')
        },
        {
            path: '/flowChart',
            name: 'flowChart',
            component: () => import('../views/FlowChart.vue')
        }
    ]
})

export default router
