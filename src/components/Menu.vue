<template>
    <el-menu default-active="/" class="el-menu-vertical-demo" background-color="#f4f4f4" router>
        <!-- 使用 to 来进行路由跳转 -->
        <el-menu-item index="/">
            <i class="el-icon-house"></i>
            <span>Home</span>
        </el-menu-item>
        <el-menu-item index="/about" >
            <i class="el-icon-info"></i>
            <span>About</span>
        </el-menu-item>
        <el-menu-item index="/contact">
            <i class="el-icon-phone"></i>
            <span>Contact</span>
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
