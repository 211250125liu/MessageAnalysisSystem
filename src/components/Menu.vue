<template>
    <el-menu default-active="/" class="el-menu-vertical-demo" background-color="#f4f4f4" router>
        <el-menu-item index="/">
            <el-icon><Search /></el-icon>
            <span>数据查询</span>
        </el-menu-item>
        <el-menu-item index="/dataStatistics">
            <el-icon><DataBoard /></el-icon>
            <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/dataAnalysis" >
            <el-icon><DataAnalysis /></el-icon>
            <span>数据分析</span>
        </el-menu-item>
        <el-menu-item index="/flowChart">
            <el-icon><TrendCharts /></el-icon>
            <span>流量图</span>
        </el-menu-item>
    </el-menu>
</template>

<script setup lang="ts">
import {DataAnalysis, DataBoard, Search, TrendCharts} from "@element-plus/icons-vue";
</script>

<style scoped>
.el-menu-item {
    padding: 10px 20px;
}

.el-menu-item:hover {
    background-color: #ddd;
}
</style>
