<template>
    <el-menu default-active="/" class="el-menu-vertical-demo" background-color="#f4f4f4" router>
        <el-menu-item index="/dataSearch">
            <i class="el-icon-phone"></i>
            <span>数据查询</span>
        </el-menu-item>
        <el-menu-item index="/">
            <i class="el-icon-house"></i>
            <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/about" >
            <i class="el-icon-info"></i>
            <span>数据分析</span>
        </el-menu-item>
    </el-menu>
</template>

<script setup lang="ts">
</script>

<style scoped>
.el-menu-item {
    padding: 10px 20px;
}

.el-menu-item:hover {
    background-color: #ddd;
}
</style>
