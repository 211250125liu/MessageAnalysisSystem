<template>
        <div style="float: left; display: flex; align-items: center;">
                <el-icon :size="20" @click="collapseSidebar"><DArrowLeft /></el-icon>
                <el-icon :size="20" @click="expandSidebar"><DArrowRight /></el-icon>
                <el-icon :size="20" @click="refreshPage"><RefreshRight /></el-icon>
                <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/' }">homepage</el-breadcrumb-item>
                        <el-breadcrumb-item>
                                <a href="/">promotion management</a>
                        </el-breadcrumb-item>
                        <el-breadcrumb-item>promotion list</el-breadcrumb-item>
                        <el-breadcrumb-item>promotion detail</el-breadcrumb-item>
                </el-breadcrumb>
        </div>
</template>

<script lang="ts" setup>
import { ref, provide } from 'vue'
import { DArrowLeft, DArrowRight, RefreshRight } from '@element-plus/icons-vue'

const isCollapse = ref(true) // 控制侧边栏坍塌状态
provide('isCollapse', isCollapse)

const collapseSidebar = () => {
        isCollapse.value = true
}

const expandSidebar = () => {
        isCollapse.value = false
}

const refreshPage = () => {
        window.location.reload() // 刷新页面
}
</script>
