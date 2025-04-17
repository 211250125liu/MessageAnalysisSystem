<template>
    <el-menu
        unique-opened
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        background-color="#f4f4f4"
        router
    >
        <el-sub-menu index="1">
            <template #title>
                <el-icon><Message /></el-icon>
                <span>报文</span>
            </template>
            <el-menu-item index="/">
                <el-icon><Search /></el-icon>
                <span>数据查询</span>
            </el-menu-item>
            <el-menu-item index="/dataStatistics">
                <el-icon><DataBoard /></el-icon>
                <span>数据统计</span>
            </el-menu-item>
            <el-menu-item index="/dataAnalysis">
                <el-icon><DataAnalysis /></el-icon>
                <span>流量分析</span>
            </el-menu-item>
            <el-menu-item index="/flowChart">
                <el-icon><TrendCharts /></el-icon>
                <span>流量图</span>
            </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="2">
            <template #title>
                <el-icon><BellFilled /></el-icon>
                <span>日志</span>
            </template>
            <el-menu-item index="/logStatistics">
                <el-icon><DataBoard /></el-icon>
                <span>数据统计</span>
            </el-menu-item>
            <el-menu-item index="/logFlowAnalysis">
                <el-icon><DataAnalysis /></el-icon>
                <span>流量分析</span>
            </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
            <template #title>
                <el-icon><ScaleToOriginal /></el-icon>
                <span>日志集成</span>
            </template>
            <el-menu-item index="/wideTable">
                <el-icon><Guide /></el-icon>
                <span>宽表</span>
            </el-menu-item>
        </el-sub-menu>

    </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
    BellFilled, DataAnalysis, DataBoard, Guide, Message, ScaleToOriginal, Search, TrendCharts
} from "@element-plus/icons-vue"

const route = useRoute()

// 计算当前激活的菜单项
const activeMenu = computed(() => {
    // 处理根路径的特殊情况
    return route.path === '/' ? '/' : route.path
})
</script>

<style scoped>
.el-menu-item {
    padding: 10px 20px;
}

.el-menu-item:hover {
    background-color: #ddd;
}
</style>
