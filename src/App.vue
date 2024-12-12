<script setup lang="ts">
import Aside from './views/menu/index.vue'
import Header from './views/header/index.vue'
</script>


<template>
    <el-container style="width: 100vw;height: 100vh">
        <el-aside style="width: fit-content" >
            <Aside/>
        </el-aside>
        <el-container>
            <el-header>
                <Header/>
            </el-header>
            <el-main style="background-color: #535bf2">Main</el-main>
        </el-container>
    </el-container>
</template>


<style scoped>

</style>
