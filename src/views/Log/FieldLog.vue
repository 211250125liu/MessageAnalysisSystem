<template>
    <div class="app-container">
        <el-table :data="tableData" style="width: 100%" border>
            <el-table-column prop="timestamp" label="时间戳" width="180" />
            <el-table-column prop="subjectProcessId" label="主体进程ID" width="120" />
            <el-table-column prop="objectProcessId" label="对象进程ID" width="120" />
            <el-table-column prop="dataSrcIP" label="源IP" width="150" />
            <el-table-column prop="level" label="日志级别" width="120" />
            <el-table-column prop="logfile" label="日志文件" width="120" />
            <el-table-column prop="factoryName" label="工厂名称" width="120" />
            <el-table-column prop="groupId" label="组ID" width="120" />
            <el-table-column prop="keywords" label="关键词" width="150">
                <template #default="{ row }">
                    {{ row.keywords[0] }} <!-- 直接显示 keywords 数组的第一个元素 -->
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
                class="pagination"
                background
                layout="->, total,sizes, prev, pager, next,jumper"
                :total="total"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 30, 40]"
                :current-page="currentPage"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAllFieldsLog } from "../../api/apiForLog/logApi.js"; // 导入你的数据获取函数

// 表格数据
const tableData = ref([]);

// 分页相关变量
const total = ref(0); // 总数据量
const pageSize = ref(10); // 每页显示条数
const currentPage = ref(1); // 当前页码

// 获取数据
const fetchData = async () => {
    try {
        const response = await getAllFieldsLog(currentPage.value, pageSize.value);
        tableData.value = response.list.map((item) => ({
            ...item,
            keywords: Array.isArray(item.keywords) ? item.keywords : [item.keywords], // 确保 keywords 是数组
        }));
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

const handleSizeChange = (size)=>{
    pageSize.value = size
    fetchData()
}
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
