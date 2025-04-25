<template>
    <div class="security-alert-container">
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
                            <el-option label="warning" value="warning" />
                            <el-option label="alert" value="alert" />
                            <el-option label="event" value="event" />
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
                <el-table-column prop="eventType" label="类型" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.eventType === 'warning' ? 'warning' : 'danger'">
                            {{ row.eventType }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="告警名称" width="250" show-overflow-tooltip />
                <el-table-column prop="deviceIp" label="设备IP" width="150" />
                <el-table-column prop="factoryName" label="工厂" width="120" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'Y' ? 'success' : 'danger'">
                            {{ row.status === 'Y' ? '已处理' : '未处理' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="ciaLevel" label="CIA级别" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getCiaLevelTagType(row.ciaLevel)">
                            {{ row.ciaLevel }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="120">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleDetail(row)">
                            详情
                        </el-button>
                        <el-button
                                v-if="row.status !== 'Y'"
                                link
                                type="success"
                                size="small"
                                @click="handleProcess(row)"
                        >
                            处理
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
        <el-dialog v-model="dialogVisible" title="告警详情" width="60%">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
                <el-descriptions-item label="时间">{{ formatTime(currentRow.timestamp) }}</el-descriptions-item>
                <el-descriptions-item label="类型">
                    <el-tag :type="currentRow.eventType === 'warning' ? 'warning' : 'danger'">
                        {{ currentRow.eventType }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="currentRow.status === 'Y' ? 'success' : 'danger'">
                        {{ currentRow.status === 'Y' ? '已处理' : '未处理' }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="告警名称">{{ currentRow.name }}</el-descriptions-item>
                <el-descriptions-item label="CIA级别">
                    <el-tag :type="getCiaLevelTagType(currentRow.ciaLevel)">
                        {{ currentRow.ciaLevel }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="设备IP">{{ currentRow.deviceIp }}</el-descriptions-item>
                <el-descriptions-item label="组件">{{ currentRow.component }}</el-descriptions-item>
                <el-descriptions-item label="工厂ID">{{ currentRow.factoryId }}</el-descriptions-item>
                <el-descriptions-item label="工厂名称">{{ currentRow.factoryName }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">
                    <div class="long-text-container">
                        {{ currentRow.remarks }}
                    </div>
                </el-descriptions-item>

                <el-descriptions-item label="额外字段" :span="2">
                    <pre class="long-text-container">{{ formatEventData(currentRow.extraFields) }}</pre>
                </el-descriptions-item>
            </el-descriptions>
            <template #footer>
        <span class="dialog-footer">
          <el-button
                  v-if="currentRow.status !== 'Y'"
                  type="primary"
                  @click="handleProcess(currentRow)"
          >
            标记为已处理
          </el-button>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getId } from '../../api/apiForOriginLog/originLogApi.js'
import { ElMessage, ElMessageBox } from 'element-plus'

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
    eventType: '',
    status: '',
    sortField: '',
    sortOrder: ''
})

// 获取数据
const fetchData = async () => {
    try {
        loading.value = true
        const response = await getId(
            queryParams.page,
            queryParams.size,
            queryParams.startTime,
            queryParams.endTime,
            queryParams.eventType
        )
        // 前端过滤状态
        let filteredList = response.list
        if (queryParams.status) {
            filteredList = filteredList.filter(item => item.status === queryParams.status)
        }
        tableData.value = filteredList
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

// 获取CIA级别对应的标签类型
const getCiaLevelTagType = (ciaLevel) => {
    switch (ciaLevel) {
        case 'confidentiality':
            return 'danger'
        case 'integrity':
            return 'warning'
        case 'availability':
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
    queryParams.eventType = ''
    queryParams.status = ''
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

// 处理告警
const handleProcess = (row) => {
    ElMessageBox.confirm(
        `确定要将ID为${row.id}的告警标记为已处理吗?`,
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        // 这里应该是调用API更新状态
        row.status = 'Y'
        ElMessage.success('处理成功')
        if (dialogVisible.value) {
            dialogVisible.value = false
        }
    }).catch(() => {
        ElMessage.info('已取消处理')
    })
}

// 初始化加载数据
onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.long-text-container {
    max-height: 200px;  /* 设置最大高度 */
    overflow-y: auto;   /* 超出时显示滚动条 */
    white-space: pre-wrap; /* 保留换行符 */
    word-break: break-word; /* 长单词换行 */
    padding: 8px;
    background: #f5f7fa;
    border-radius: 4px;
    margin: 4px 0;
}
.security-alert-container {
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
