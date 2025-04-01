<template>
    <div class="app-container">
        <el-table :data="tableData" style="width: 100%" border>
            <el-table-column prop="timestamp" label="时间戳" width="180" />
            <el-table-column prop="dataSrcIP" label="源IP" width="150" />
            <el-table-column prop="ip" label="IP" width="150" />
            <el-table-column prop="mac" label="MAC地址" width="150" />
            <el-table-column prop="ports" label="端口" width="120" />
            <el-table-column prop="significance" label="重要性" width="120" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="groupId" label="组ID" width="120" />
            <el-table-column prop="factoryName" label="工厂名称" width="120" />
            <el-table-column prop="cat" label="类别" width="120" />
            <el-table-column prop="macList" label="MAC地址列表" width="150">
                <template #default="{ row }">
                    {{ row.macList.join(', ') }} <!-- 展平 macList 数组 -->
                </template>
            </el-table-column>
            <el-table-column prop="ipList" label="IP列表" width="150">
                <template #default="{ row }">
                    {{ row.ipList.join(', ') }} <!-- 展平 ipList 数组 -->
                </template>
            </el-table-column>
            <el-table-column prop="portsList" label="端口列表" width="150">
                <template #default="{ row }">
                    {{ row.portsList.join(', ') }} <!-- 展平 portsList 数组 -->
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
                class="pagination"
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
import { getAllProductFamilyLog } from '../../api/apiForLog/logApi.js'; // 导入新的数据获取函数

// 表格数据
const tableData = ref([]);

// 分页相关变量
const total = ref(0); // 总数据量
const pageSize = ref(10); // 每页显示条数
const currentPage = ref(1); // 当前页码

// 获取数据
const fetchData = async () => {
    try {
        const response = await getAllProductFamilyLog(currentPage.value, pageSize.value);
        tableData.value = response.list.map((item) => ({
            ...item,
            macList: item.macList || [], // 确保 macList 是数组
            ipList: item.ipList || [], // 确保 ipList 是数组
            portsList: item.portsList || [], // 确保 portsList 是数组
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
