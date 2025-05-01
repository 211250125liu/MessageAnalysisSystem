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
            path: '/wideTable',
            name: 'wideTable',
            component: () => import('../views/LogIntegration/WideTable.vue')
        },
        {
            path: '/logStatistics',
            name: 'logStatistics',
            component: () => import('../views/LogIntegration/LogStatistics.vue')
        },
        {
            path: '/logFlowAnalysis',
            name: 'logFlowAnalysis',
            component: () => import('../views/LogIntegration/LogFlowAnalysis.vue')
        },
        {
            path : '/eventDataLog',
            name : 'eventDataLog',
            component : ()=> import('../views/OriginLog/EventDataLog.vue')
        },
        {
            path : '/fieldsLog',
            name : 'fieldsLog',
            component: () => import('../views/OriginLog/FieldsLog.vue')
        },
        {
            path : '/filePathLog',
            component : ()=>import('../views/OriginLog/FilePathLog.vue')
        },
        {
            path : '/flowStartLog',
            component : ()=>import('../views/OriginLog/FlowStartLog.vue')
        },
        {
            path : '/idLog',
            component : ()=>import('../views/OriginLog/IdLog.vue')
        },
        {
            path : '/productFamilyLog',
            component : ()=>import('../views/OriginLog/ProductFamilyLog.vue')
        },
        {
            path : '/rcodeNameLog',
            component : ()=>import('../views/OriginLog/RcodeNameLog.vue')
        },
        {
            path: '/topNLogs',
            component : () => import('../views/OriginLog/TopNLogs.vue')
        },
        {
            path: '/hourlyStatistics',
            component: () => import('../views/OriginLog/HourlyStatistics.vue')
        }
    ]
})

export default router
