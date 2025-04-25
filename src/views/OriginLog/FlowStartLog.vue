<template>
    <div class="flow-stats-container">
        <el-card>
            <div class="filter-container">
                <el-form :inline="true" :model="queryParams" class="demo-form-inline">
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
                    <el-form-item label="事件类型">
                        <el-select
                                v-model="queryParams.eventType"
                                placeholder="请选择事件类型"
                                clearable
                                style="width: 180px"
                        >
                            <el-option label="stats" value="stats" />
                            <el-option label="dns" value="dns" />
                            <el-option label="http" value="http" />
                            <el-option label="smb" value="smb" />
                            <el-option label="tls" value="tls" />
                            <el-option label="dcerpc" value="dcerpc" />
                            <el-option label="alert" value="alert" />
                            <el-option label="krb5" value="krb5" />
                            <el-option label="snmp" value="snmp" />
                            <el-option label="fileinfo" value="fileinfo" />
                            <el-option label="dhcp" value="dhcp" />
                            <el-option label="ssh" value="ssh" />
                            <el-option label="mqtt" value="mqtt" />
                            <el-option label="rdp" value="rdp" />
                            <el-option label="全部" value="" />
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
                <el-table-column prop="eventType" label="事件类型" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getEventTypeTagType(row.eventType)">
                            {{ row.eventType }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="factoryName" label="工厂" width="120" />
                <el-table-column prop="src" label="源地址" width="150" />
                <el-table-column prop="dst" label="目标地址" width="150" />
                <el-table-column prop="proto" label="协议" width="100" />
                <el-table-column prop="spt" label="源端口" width="100" />
                <el-table-column prop="dpt" label="目标端口" width="100" />
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
        <el-dialog v-model="dialogVisible" title="流量详情" width="70%">
            <el-tabs v-model="activeTab">
                <el-tab-pane label="基本信息" name="basic">
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
                        <el-descriptions-item label="时间">{{ formatTime(currentRow.timestamp) }}</el-descriptions-item>
                        <el-descriptions-item label="事件类型">
                            <el-tag :type="getEventTypeTagType(currentRow.eventType)">
                                {{ currentRow.eventType }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="工厂">{{ currentRow.factoryName }}</el-descriptions-item>
                        <el-descriptions-item label="源地址">{{ currentRow.src }}</el-descriptions-item>
                        <el-descriptions-item label="目标地址">{{ currentRow.dst }}</el-descriptions-item>
                        <el-descriptions-item label="协议">{{ currentRow.proto }}</el-descriptions-item>
                        <el-descriptions-item label="源端口">{{ currentRow.spt }}</el-descriptions-item>
                        <el-descriptions-item label="目标端口">{{ currentRow.dpt }}</el-descriptions-item>
                        <el-descriptions-item label="告警信息">{{ currentRow.alertMsg }}</el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>

                <el-tab-pane :label="currentRow.eventType.toUpperCase()" :name="currentRow.eventType">
                    <pre style="background: #f5f7fa; padding: 10px; border-radius: 4px;">{{ formatEventData(currentRow[currentRow.eventType]) }}</pre>
                </el-tab-pane>

                <el-tab-pane label="统计信息" name="stats" v-if="currentRow.stats">
                    <pre style="background: #f5f7fa; padding: 10px; border-radius: 4px;">{{ formatEventData(currentRow.stats) }}</pre>
                </el-tab-pane>

                <el-tab-pane label="元数据" name="metadata">
                    <pre style="background: #f5f7fa; padding: 10px; border-radius: 4px;">{{ formatEventData(currentRow.metadata) }}</pre>
                </el-tab-pane>
            </el-tabs>
            <template #footer>
                <el-button @click="dialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getFlowStart } from '../../api/apiForOriginLog/originLogApi.js'
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
    startTime: '',
    endTime: '',
    eventType: '',
    sortField: '',
    sortOrder: ''
})

// 获取数据
const fetchData = async () => {
    try {
        loading.value = true
        const response = await getFlowStart(
            queryParams.page,
            queryParams.size,
            queryParams.startTime,
            queryParams.endTime,
            queryParams.eventType
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
const formatEventData = (data) => {
    if (!data) return ''
    try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        return JSON.stringify(parsed, null, 2)
    } catch {
        return data
    }
}

// 获取事件类型对应的标签类型
const getEventTypeTagType = (eventType) => {
    switch (eventType) {
        case 'alert':
            return 'danger'
        case 'stats':
            return 'info'
        case 'http':
        case 'dns':
        case 'smb':
        case 'tls':
            return ''
        case 'dcerpc':
        case 'krb5':
            return 'warning'
        default:
            return 'success'
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
    queryParams.eventType = ''
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
.flow-stats-container {
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
