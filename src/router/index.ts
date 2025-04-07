import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/dataStatistics',
            name: 'dataStatistics',
            component: () => import('../views/Message/DataStatistics.vue')
        },
        {
            path: '/dataAnalysis',
            name: 'dataAnalysis',
            component: () => import('../views/Message/FlowAnalysis.vue')
        },
        {
            path: '/',
            name: 'dataSearch',
            component: () => import('../views/Message/DataSearch.vue')
        },
        {
            path: '/flowChart',
            name: 'flowChart',
            component: () => import('../views/Message/FlowChart.vue')
        },
        {
            path: '/fieldLog',
            name: 'fieldLog',
            component: () => import('../views/Log/FieldLog.vue')
        },
        {
            path: '/filePathLog',
            name: 'filePathLog',
            component: () => import('../views/Log/FilePathLog.vue')
        },
        {
            path: '/flowStartLog',
            name: 'flowStartLog',
            component: () => import('../views/Log/FlowStartLog.vue')
        },
        {
            path: '/idLog',
            name: 'idLog',
            component: () => import('../views/Log/IdLog.vue')
        },
        {
            path: '/productFamilyLog',
            name: 'productFamilyLog',
            component: () => import('../views/Log/ProductFamilyLog.vue')
        },
        {
            path: '/rcodeNameLog',
            name: 'rcodeNameLog',
            component: () => import('../views/Log/RcodeNameLog.vue')
        },
        {
            path: '/rtLog',
            name: 'rtLog',
            component: () => import('../views/Log/RtLog.vue')
        },
        {
            path: '/wideTable',
            name: 'wideTable',
            component: () => import('../views/Log/WideTable.vue')
        }
    ]
})

export default router
