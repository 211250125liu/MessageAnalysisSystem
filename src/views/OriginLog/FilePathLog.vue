<template>
    <div class="file-transfer-container">
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
                <el-table-column prop="dataSrcIP" label="源IP" width="150" />
                <el-table-column prop="factoryName" label="工厂" width="120" />
                <el-table-column prop="fname" label="文件名" width="200" show-overflow-tooltip />
                <el-table-column prop="txHosts" label="发送主机" width="180">
                    <template #default="{ row }">
                        <el-tag v-for="(host, index) in row.txHosts" :key="index" size="small" style="margin-right: 5px;">
                            {{ host }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="rxHosts" label="接收主机" width="180">
                    <template #default="{ row }">
                        <el-tag v-for="(host, index) in row.rxHosts" :key="index" size="small" type="success" style="margin-right: 5px;">
                            {{ host }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="host" label="主机" width="150" />
                <el-table-column prop="md5" label="MD5" width="220" show-overflow-tooltip />
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
        <el-dialog v-model="dialogVisible" title="文件传输详情" width="60%">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
                <el-descriptions-item label="时间">{{ formatTime(currentRow.timestamp) }}</el-descriptions-item>
                <el-descriptions-item label="源IP">{{ currentRow.dataSrcIP }}</el-descriptions-item>
                <el-descriptions-item label="组ID">{{ currentRow.groupId }}</el-descriptions-item>
                <el-descriptions-item label="工厂名称">{{ currentRow.factoryName }}</el-descriptions-item>
                <el-descriptions-item label="主机">{{ currentRow.host }}</el-descriptions-item>
                <el-descriptions-item label="文件名">{{ currentRow.fname }}</el-descriptions-item>
                <el-descriptions-item label="文件类型">{{ currentRow.fileType || '未知' }}</el-descriptions-item>
                <el-descriptions-item label="分类">{{ currentRow.cat }}</el-descriptions-item>
                <el-descriptions-item label="MD5">{{ currentRow.md5 }}</el-descriptions-item>
                <el-descriptions-item label="文件哈希">{{ currentRow.fileHash }}</el-descriptions-item>
                <el-descriptions-item label="发送主机" :span="2">
                    <el-tag v-for="(host, index) in currentRow.txHosts" :key="'tx'+index" style="margin-right: 5px;">
                        {{ host }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="接收主机" :span="2">
                    <el-tag v-for="(host, index) in currentRow.rxHosts" :key="'rx'+index" type="success" style="margin-right: 5px;">
                        {{ host }}
                    </el-tag>
                </el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="dialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getFilePath } from '../../api/apiForOriginLog/originLogApi.js'
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
    dataSrcIp: '',
    fileName: '',
    startTime: '',
    endTime: '',
    sortField: '',
    sortOrder: ''
})

// 获取数据
const fetchData = async () => {
    try {
        loading.value = true
        const response = await getFilePath(
            queryParams.page,
            queryParams.size,
            queryParams.dataSrcIp,
            queryParams.startTime,
            queryParams.endTime
        )
        // 前端过滤文件名
        let filteredList = response.list
        if (queryParams.fileName) {
            filteredList = filteredList.filter(item =>
                item.fname && item.fname.toLowerCase().includes(queryParams.fileName.toLowerCase())
            )
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

// 查询
const handleQuery = () => {
    queryParams.page = 1
    fetchData()
}

// 重置查询
const resetQuery = () => {
    queryParams.page = 1
    queryParams.dataSrcIp = ''
    queryParams.fileName = ''
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
}

// 初始化加载数据
onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.file-transfer-container {
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
