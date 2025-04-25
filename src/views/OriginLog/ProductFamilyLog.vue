<template>
    <div class="asset-management-container">
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
                <el-table-column prop="ip" label="IP地址" width="180">
                    <template #default="{ row }">
                        <el-tag v-for="(ip, index) in row.ip" :key="index" size="small" style="margin-right: 5px;">
                            {{ ip }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="mac" label="MAC地址" width="180">
                    <template #default="{ row }">
                        <el-tag v-for="(mac, index) in row.mac" :key="index" size="small" type="info" style="margin-right: 5px;">
                            {{ mac }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="vendor" label="厂商" width="150" show-overflow-tooltip />
                <el-table-column prop="operatingSystem" label="操作系统" width="150" />
                <el-table-column prop="ports" label="开放端口" width="180">
                    <template #default="{ row }">
                        <el-tag v-for="(port, index) in row.ports" :key="index" size="small" type="warning" style="margin-right: 5px;">
                            {{ port }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="significance" label="重要性" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getSignificanceTagType(row.significance)">
                            {{ row.significance }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="factoryName" label="工厂" width="120" />
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
        <el-dialog v-model="dialogVisible" title="资产详情" width="65%">
            <el-tabs v-model="activeTab">
                <el-tab-pane label="基本信息" name="basic">
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
                        <el-descriptions-item label="时间">{{ formatTime(currentRow.timestamp) }}</el-descriptions-item>
                        <el-descriptions-item label="源IP">{{ currentRow.dataSrcIP }}</el-descriptions-item>
                        <el-descriptions-item label="厂商">{{ currentRow.vendor }}</el-descriptions-item>
                        <el-descriptions-item label="产品型号">{{ currentRow.productModel || 'N/A' }}</el-descriptions-item>
                        <el-descriptions-item label="产品系列">{{ currentRow.productFamily || 'N/A' }}</el-descriptions-item>
                        <el-descriptions-item label="操作系统">{{ currentRow.operatingSystem }}</el-descriptions-item>
                        <el-descriptions-item label="VLAN">{{ currentRow.vlan }}</el-descriptions-item>
                        <el-descriptions-item label="状态">
                            <el-tag :type="currentRow.status === '1' ? 'success' : 'danger'">
                                {{ currentRow.status === '1' ? '活跃' : '离线' }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="重要性">
                            <el-tag :type="getSignificanceTagType(currentRow.significance)">
                                {{ currentRow.significance }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="工厂ID">{{ currentRow.factoryId }}</el-descriptions-item>
                        <el-descriptions-item label="工厂名称">{{ currentRow.factoryName }}</el-descriptions-item>
                        <el-descriptions-item label="组ID">{{ currentRow.groupId }}</el-descriptions-item>
                        <el-descriptions-item label="分类">{{ currentRow.cat }}</el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>

                <el-tab-pane label="网络信息" name="network">
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="IP地址" :span="2">
                            <div class="tag-group">
                                <el-tag v-for="(ip, index) in currentRow.ip" :key="index" style="margin-right: 8px; margin-bottom: 8px;">
                                    {{ ip }}
                                </el-tag>
                            </div>
                        </el-descriptions-item>
                        <el-descriptions-item label="MAC地址" :span="2">
                            <div class="tag-group">
                                <el-tag v-for="(mac, index) in currentRow.mac" :key="index" type="info" style="margin-right: 8px; margin-bottom: 8px;">
                                    {{ mac }}
                                </el-tag>
                            </div>
                        </el-descriptions-item>
                        <el-descriptions-item label="开放端口" :span="2">
                            <div class="tag-group">
                                <el-tag v-for="(port, index) in currentRow.ports" :key="index" type="warning" style="margin-right: 8px; margin-bottom: 8px;">
                                    {{ port }}
                                </el-tag>
                            </div>
                        </el-descriptions-item>
                        <el-descriptions-item label="IP前缀" :span="2">
                            <div class="tag-group">
                                <el-tag v-for="(prefix, index) in currentRow.ipPrefixes" :key="index" type="success" style="margin-right: 8px; margin-bottom: 8px;">
                                    {{ prefix }}
                                </el-tag>
                                <span v-if="currentRow.ipPrefixes.length === 0">N/A</span>
                            </div>
                        </el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>

                <el-tab-pane label="时间信息" name="timeline">
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="存在时间">
                            <el-timeline>
                                <el-timeline-item
                                        v-for="(time, index) in currentRow.existence"
                                        :key="index"
                                        :timestamp="formatUnixTime(time)"
                                        placement="top"
                                >
                                    {{ index === 0 ? '首次出现' : '最近活跃' }}
                                </el-timeline-item>
                            </el-timeline>
                        </el-descriptions-item>
                        <el-descriptions-item label="最后发现时间">
                            {{ formatUnixTime(currentRow.lastSeen) }}
                        </el-descriptions-item>
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
import { getProductFamily } from '../../api/apiForOriginLog/originLogApi.js'
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
    significance: '',
    sortField: '',
    sortOrder: ''
})

// 获取数据
const fetchData = async () => {
    try {
        loading.value = true
        const response = await getProductFamily(
            queryParams.page,
            queryParams.size,
            queryParams.startTime,
            queryParams.endTime,
            queryParams.dataSrcIp
        )
        // 前端过滤重要性
        let filteredList = response.list
        if (queryParams.significance) {
            filteredList = filteredList.filter(item => item.significance === queryParams.significance)
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

// 格式化Unix时间
const formatUnixTime = (unixTime) => {
    if (!unixTime) return ''
    return new Date(unixTime * 1000).toLocaleString()
}

// 获取重要性对应的标签类型
const getSignificanceTagType = (significance) => {
    switch (significance) {
        case 'CRITICAL':
            return 'danger'
        case 'HIGH':
            return 'warning'
        case 'MEDIUM':
            return ''
        case 'LOW':
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
    queryParams.dataSrcIp = ''
    queryParams.startTime = ''
    queryParams.endTime = ''
    queryParams.significance = ''
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
.asset-management-container {
    padding: 20px;
}
.filter-container {
    margin-bottom: 20px;
}
.pagination-container {
    margin-top: 20px;
    text-align: right;
}
.tag-group {
    display: flex;
    flex-wrap: wrap;
}
</style>
