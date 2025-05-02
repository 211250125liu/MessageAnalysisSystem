<template>
    <div class="event-table-container">
        <el-card>
            <div class="filter-container">
                <el-form :inline="true" :model="queryParams" class="demo-form-inline">
                    <el-form-item label="开始时间">
                        <el-date-picker
                            v-model="queryParams.startTime"
                            type="datetime"
                            placeholder="选择开始时间"
                            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                        />
                    </el-form-item>
                    <el-form-item label="结束时间">
                        <el-date-picker
                            v-model="queryParams.endTime"
                            type="datetime"
                            placeholder="选择结束时间"
                            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                        />
                    </el-form-item>
                    <el-form-item label="日志级别">
                        <el-select v-model="queryParams.level" placeholder="请选择日志级别" clearable style="width: 10rem">
                            <el-option label="Warning" value="Warning" />
                            <el-option label="Information" value="Information" />
                            <el-option label="Error" value="Error" />
                            <el-option label="??" value="??" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleQuery">查询</el-button>
                        <el-button @click="resetQuery">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <el-table
                :data="tableData"
                border
                style="width: 100%"
                v-loading="loading"
                @sort-change="handleSortChange"
            >
                <el-table-column prop="id" label="ID" width="80" sortable="custom" />
                <el-table-column prop="timestamp" label="时间" width="180" sortable="custom">
                    <template #default="{ row }">
                        {{ formatTime(row.timestamp) }}
                    </template>
                </el-table-column>
                <el-table-column prop="level" label="级别" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getLevelTagType(row.level)">
                            {{ row.level }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="eventId" label="事件ID" width="100" />
                <el-table-column prop="sourceName" label="来源名称" width="180" show-overflow-tooltip />
                <el-table-column prop="factoryName" label="工厂名称" width="120" />
                <el-table-column prop="computerName" label="计算机名" width="180" show-overflow-tooltip />
                <el-table-column prop="msg" label="消息" show-overflow-tooltip />
                <el-table-column fixed="right" label="操作" width="150">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">
                            详情
                        </el-button>
                        <el-button
                            link
                            type="warning"
                            size="small"
                            @click="showAnomalyInfo(row.id)"
                        >
                            异常信息
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="queryParams.page"
                    v-model:page-size="queryParams.size"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 详情对话框 -->
        <el-dialog v-model="dialogVisible" title="事件详情" width="70%">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
                <el-descriptions-item label="时间">{{ formatTime(currentRow.timestamp) }}</el-descriptions-item>
                <el-descriptions-item label="类型">{{ currentRow.type }}</el-descriptions-item>
                <el-descriptions-item label="级别">
                    <el-tag :type="getLevelTagType(currentRow.level)">
                        {{ currentRow.level }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="事件ID">{{ currentRow.eventId }}</el-descriptions-item>
                <el-descriptions-item label="来源名称">{{ currentRow.sourceName }}</el-descriptions-item>
                <el-descriptions-item label="工厂ID">{{ currentRow.factoryId }}</el-descriptions-item>
                <el-descriptions-item label="工厂名称">{{ currentRow.factoryName }}</el-descriptions-item>
                <el-descriptions-item label="计算机名">{{ currentRow.computerName }}</el-descriptions-item>
                <el-descriptions-item label="主机名">{{ currentRow.shost }}</el-descriptions-item>
                <el-descriptions-item label="数据源IP">{{ currentRow.dataSrcIP }}</el-descriptions-item>
                <el-descriptions-item label="消息" :span="2">{{ currentRow.msg }}</el-descriptions-item>
                <el-descriptions-item label="标签" :span="2">
                    <el-tag v-for="tag in currentRow.tags" :key="tag" style="margin-right: 5px;">
                        {{ tag }}
                    </el-tag>
                </el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="dialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>

        <el-drawer
            v-model="drawerVisible"
            title="日志异常信息"
            direction="rtl"
            size="30%"
        >
            <div v-if="anomalyData">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="是否异常">
                        {{ anomalyData.isAnomaly ? 'true' : false }}
                    </el-descriptions-item>
                    <el-descriptions-item label="异常详情">
                        <ul>
                            <li v-for="(detail, index) in anomalyData.reason" :key="index">
                                {{ detail }}
                            </li>
                        </ul>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
            <div v-else>
                加载中...
            </div>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {getEventData, getEventDataAnomaly} from '../../api/apiForOriginLog/originLogApi.js'
import { ElMessage } from 'element-plus'

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const currentRow = ref({})

// 查询参数
const queryParams = reactive({
    page: 1,
    size: 20,
    startTime: '',
    endTime: '',
    level: '',
    sortField: '',
    sortOrder: ''
})

// 获取数据
const fetchData = async () => {
    try {
        loading.value = true
        const response = await getEventData(
            queryParams.page,
            queryParams.size,
            queryParams.startTime,
            queryParams.endTime,
            queryParams.level
        )
        console.log(response)
        tableData.value = response.list
        total.value = response.total || 0
    } catch (error) {
        ElMessage.error('获取数据失败: ' + error.message)
    } finally {
        loading.value = false
    }
}

// 格式化时间
const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString()
}

// 获取日志级别对应的标签类型
const getLevelTagType = (level) => {
    switch (level) {
        case 'Error':
            return 'danger'
        case 'Warning':
            return 'warning'
        case 'Information':
            return 'info'
        default:
            return ''
    }
}

// 查询
const handleQuery = () => {
    queryParams.page = 1
    fetchData()
}

// 重置查询
const resetQuery = () => {
    queryParams.page = 1
    queryParams.startTime = ''
    queryParams.endTime = ''
    queryParams.level = ''
    fetchData()
}

// 分页大小变化
const handleSizeChange = (val) => {
    queryParams.size = val
    fetchData()
}

// 当前页变化
const handleCurrentChange = (val) => {
    queryParams.page = val
    fetchData()
}

// 排序变化
const handleSortChange = ({ prop, order }) => {
    queryParams.sortField = prop
    queryParams.sortOrder = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : ''
    fetchData()
}

// 查看详情
const handleDetail = (row) => {
    currentRow.value = row
    dialogVisible.value = true
}

// 初始化加载数据
onMounted(() => {
    fetchData()
})

const drawerVisible = ref(false)
const anomalyData = ref(null)
const showAnomalyInfo =  async (id) => {
    try{
        anomalyData.value = await getEventDataAnomaly(id)
        drawerVisible.value = true
    } catch (e){
        console.log(e)
    }
}
</script>

<style scoped>
.event-table-container {
    padding: 20px;
}
.filter-container {
    margin-bottom: 20px;
}
.pagination-container {
    margin-top: 20px;
    text-align: right;
}
</style>
