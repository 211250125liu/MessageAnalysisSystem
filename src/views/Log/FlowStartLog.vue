<template>
    <div class="app-container">
        <el-table :data="tableData" style="width: 100%" border>
            <el-table-column prop="timestamp" label="时间戳" width="180" />
            <el-table-column prop="dataSrcIP" label="源IP" width="150" />
            <el-table-column prop="src" label="来源IP" width="150" />
            <el-table-column prop="dst" label="目标IP" width="150" />
            <el-table-column prop="proto" label="协议" width="120" />
            <el-table-column prop="eventType" label="事件类型" width="120" />
            <el-table-column prop="dns.rrname" label="DNS请求名称" width="200" />
            <el-table-column prop="dns.rrtype" label="DNS请求类型" width="120" />
            <el-table-column prop="dns.type" label="DNS类型" width="120" />
            <el-table-column prop="factoryName" label="工厂名称" width="120" />
            <el-table-column prop="groupId" label="组ID" width="120" />
            <el-table-column prop="cat" label="类别" width="120" />
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
                class="pagination"
                background
                layout="->,total, sizes, prev, pager, next, jumper"
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
import { getAllFlowStartLog } from '../../api/apiForLog/logApi.js'; // 导入新的数据获取函数

// 表格数据
const tableData = ref([]);

// 分页相关变量
const total = ref(0); // 总数据量
const pageSize = ref(10); // 每页显示条数
const currentPage = ref(1); // 当前页码

// 获取数据
const fetchData = async () => {
    try {
        const response = await getAllFlowStartLog(currentPage.value, pageSize.value);
        tableData.value = response.list.map((item) => ({
            ...item,
            'dns.rrname': item.dns?.rrname || '-', // 展平 dns.rrname
            'dns.rrtype': item.dns?.rrtype || '-', // 展平 dns.rrtype
            'dns.type': item.dns?.type || '-', // 展平 dns.type
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
