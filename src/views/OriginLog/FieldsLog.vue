<template>
    <div class="security-event-container">
        <el-card>
            <div class="filter-container">
                <el-form :inline="true" :model="queryParams" class="demo-form-inline">
                    <el-form-item label="源IP">
                        <el-input
                                v-model="queryParams.dataSrcIp"
                                placeholder="请输入源IP"
                                clearable
                                style="width: 180px"
                        />
                    </el-form-item>
                    <el-form-item label="开始时间">
                        <el-date-picker
                                v-model="queryParams.startTime"
                                type="datetime"
                                placeholder="选择开始时间"
                                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                                style="width: 200px"
                        />
                    </el-form-item>
                    <el-form-item label="结束时间">
                        <el-date-picker
                                v-model="queryParams.endTime"
                                type="datetime"
                                placeholder="选择结束时间"
                                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                                style="width: 200px"
                        />
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
                <el-table-column prop="eventId" label="事件ID" width="100" />
                <el-table-column prop="dataSrcIP" label="源IP" width="150" />
                <el-table-column prop="subjectHostName" label="主机名" width="150" />
                <el-table-column prop="subjectUserName" label="用户" width="120" />
                <el-table-column prop="factoryName" label="工厂" width="120" />
                <el-table-column prop="logfile" label="日志文件" width="120" />
                <el-table-column prop="category" label="分类" width="200" show-overflow-tooltip />
                <el-table-column fixed="right" label="操作" width="120">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">
                            详情
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
        <el-dialog v-model="dialogVisible" title="安全事件详情" width="70%">
            <el-tabs v-model="activeTab">
                <el-tab-pane label="基本信息" name="basic">
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
                        <el-descriptions-item label="时间">{{ formatTime(currentRow.timestamp) }}</el-descriptions-item>
                        <el-descriptions-item label="事件ID">{{ currentRow.eventId }}</el-descriptions-item>
                        <el-descriptions-item label="源IP">{{ currentRow.dataSrcIP }}</el-descriptions-item>
                        <el-descriptions-item label="主机名">{{ currentRow.subjectHostName }}</el-descriptions-item>
                        <el-descriptions-item label="计算机名">{{ currentRow.computerName }}</el-descriptions-item>
                        <el-descriptions-item label="用户">{{ currentRow.subjectUserName }}</el-descriptions-item>
                        <el-descriptions-item label="对象用户">{{ currentRow.objectUserName }}</el-descriptions-item>
                        <el-descriptions-item label="工厂ID">{{ currentRow.factoryId }}</el-descriptions-item>
                        <el-descriptions-item label="工厂名称">{{ currentRow.factoryName }}</el-descriptions-item>
                        <el-descriptions-item label="日志文件">{{ currentRow.logfile }}</el-descriptions-item>
                        <el-descriptions-item label="分类">{{ currentRow.category }}</el-descriptions-item>
                        <el-descriptions-item label="标签" :span="2">
                            <el-tag v-for="tag in currentRow.tags" :key="tag" style="margin-right: 5px;">
                                {{ tag }}
                            </el-tag>
                        </el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>
                <el-tab-pane label="事件数据" name="eventData">
                    <pre style="background: #f5f7fa; padding: 10px; border-radius: 4px;">{{ formatEventData(currentRow.event_data) }}</pre>
                </el-tab-pane>
                <el-tab-pane label="进程信息" name="process">
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="主体进程ID">{{ currentRow.subjectProcessId }}</el-descriptions-item>
                        <el-descriptions-item label="对象进程ID">{{ currentRow.objectProcessId }}</el-descriptions-item>
                        <el-descriptions-item label="命令行">{{ currentRow.scommandLine }}</el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>
            </el-tabs>
            <template #footer>
                <el-button @click="dialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getFields } from '../../api/apiForOriginLog/originLogApi.js'
import { ElMessage } from 'element-plus'

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const currentRow = ref({})
const activeTab = ref('basic')

// 查询参数
const queryParams = reactive({
    page: 1,
    size: 20,
    dataSrcIp: '',
    startTime: '',
    endTime: '',
    sortField: '',
    sortOrder: ''
})

// 获取数据
const fetchData = async () => {
    try {
        loading.value = true
        const response = await getFields(
            queryParams.dataSrcIp,
            queryParams.page,
            queryParams.size,
            queryParams.startTime,
            queryParams.endTime
        )
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

// 格式化事件数据
const formatEventData = (eventData) => {
    if (!eventData) return ''
    try {
        const parsed = JSON.parse(eventData)
        return JSON.stringify(parsed, null, 2)
    } catch {
        return eventData
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
    queryParams.dataSrcIp = ''
    queryParams.startTime = ''
    queryParams.endTime = ''
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
    activeTab.value = 'basic'
}

// 初始化加载数据
onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.security-event-container {
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
