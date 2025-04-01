<template>
    <div class="app-container">
        <el-table :data="tableData" style="width: 100%" border>
            <el-table-column prop="timestamp" label="时间戳" width="180" />
            <el-table-column prop="dataSrcIP" label="源IP" width="150" />
            <el-table-column prop="missingBytes" label="缺失字节数" width="120" />
            <el-table-column prop="filePath" label="文件路径" width="200" />
            <el-table-column prop="fileHash" label="文件哈希" width="180" />
            <el-table-column prop="seenBytes" label="已读字节数" width="120" />
            <el-table-column prop="offset" label="偏移量" width="120" />
            <el-table-column prop="factoryName" label="工厂名称" width="120" />
            <el-table-column prop="groupId" label="组ID" width="120" />
            <el-table-column prop="cat" label="类别" width="120" />
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
                class="pagination"
                background
                layout="->, total, sizes, prev, pager, next, jumper"
                :total="total"
                :page-size="pageSize"
                :page-sizes="[10, 20, 30, 40]"
                :current-page="currentPage"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAllFilePathLog } from '../../api/apiForLog/logApi.js'; // 导入新的数据获取函数

// 表格数据
const tableData = ref([]);

// 分页相关变量
const total = ref(0); // 总数据量
const pageSize = ref(10); // 每页显示条数
const currentPage = ref(1); // 当前页码

// 获取数据
const fetchData = async () => {
    try {
        const response = await getAllFilePathLog(currentPage.value, pageSize.value);
        tableData.value = response.list; // 假设接口返回的数据在 list 字段中
        total.value = response.total; // 假设接口返回总数据量
    } catch (error) {
        console.error('数据加载失败:', error);
    }
};

// 分页切换
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchData();
};

// 每页条数切换
const handleSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1; // 重置为第一页
    fetchData();
};

// 组件挂载时加载数据
onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.app-container {
    padding: 20px;
}

.pagination {
    margin-top: 20px;
    text-align: right;
}
</style>
