<template>
    <el-container style="height: 100vh;">
        <!-- 左侧菜单栏 -->
        <el-aside width="250px" style="background-color: #f4f4f4;">
            <Menu />
        </el-aside>

        <!-- 右侧内容区 -->
        <el-main>
            <router-view />
        </el-main>
    </el-container>
</template>

<script>
import Menu from './components/Menu.vue'

export default {
    name: 'App',
    components: {
        Menu
    }
}
</script>

<style>
#app {
    font-family: 'Arial', sans-serif;
    margin: 0;
}

.el-main {
    padding: 20px;
    background-color: #fff;
}

.el-aside {
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}
</style>
