<template>
    <div class="dns-query-container">
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
                    <el-form-item label="协议类型">
                        <el-select
                                v-model="queryParams.proto"
                                placeholder="请选择协议"
                                clearable
                                style="width: 120px"
                        >
                            <el-option label="TCP" value="tcp" />
                            <el-option label="UDP" value="udp" />
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
                <el-table-column prop="src" label="源IP" width="150" />
                <el-table-column prop="dst" label="DNS服务器" width="150" />
                <el-table-column prop="proto" label="协议" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.proto === 'udp' ? '' : 'info'">
                            {{ row.proto.toUpperCase() }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="destinationDnsDomain" label="查询域名" width="250" show-overflow-tooltip />
                <el-table-column prop="rcodeName" label="响应码" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getRcodeTagType(row.rcodeName)">
                            {{ row.rcodeName }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="answers" label="解析结果" width="250" show-overflow-tooltip>
                    <template #default="{ row }">
                        <div v-if="row.answers && row.answers.length > 0">
                            <el-tooltip v-for="(answer, index) in row.answers" :key="index" :content="`TTL: ${row.ttls[index] || 'N/A'}`">
                                <el-tag size="small" style="margin-right: 5px; margin-bottom: 5px;">
                                    {{ answer }}
                                </el-tag>
                            </el-tooltip>
                        </div>
                        <span v-else>无结果</span>
                    </template>
                </el-table-column>
                <el-table-column prop="rtt" label="响应时间(ms)" width="120">
                    <template #default="{ row }">
                        {{ formatRtt(row.rtt) }}
                    </template>
                </el-table-column>
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
        <el-dialog v-model="dialogVisible" title="DNS查询详情" width="60%">
            <el-tabs v-model="activeTab">
                <el-tab-pane label="基本信息" name="basic">
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="ID">{{ currentRow.id }}</el-descriptions-item>
                        <el-descriptions-item label="时间">{{ formatTime(currentRow.timestamp) }}</el-descriptions-item>
                        <el-descriptions-item label="源IP">{{ currentRow.src }}</el-descriptions-item>
                        <el-descriptions-item label="DNS服务器">{{ currentRow.dst }}</el-descriptions-item>
                        <el-descriptions-item label="源端口">{{ currentRow.spt }}</el-descriptions-item>
                        <el-descriptions-item label="目标端口">{{ currentRow.dpt }}</el-descriptions-item>
                        <el-descriptions-item label="协议">
                            <el-tag :type="currentRow.proto === 'udp' ? '' : 'info'">
                                {{ currentRow.proto.toUpperCase() }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="查询域名">{{ currentRow.destinationDnsDomain }}</el-descriptions-item>
                        <el-descriptions-item label="响应码">
                            <el-tag :type="getRcodeTagType(currentRow.rcodeName)">
                                {{ currentRow.rcodeName }} ({{ currentRow.rcode }})
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="查询类型">{{ getQtypeName(currentRow.qtype) }} ({{ currentRow.qtype }})</el-descriptions-item>
                        <el-descriptions-item label="查询类别">{{ getQclassName(currentRow.qclass) }} ({{ currentRow.qclass }})</el-descriptions-item>
                        <el-descriptions-item label="响应时间">{{ formatRtt(currentRow.rtt) }} ms</el-descriptions-item>
                        <el-descriptions-item label="递归可用">{{ currentRow.ra === '1' ? '是' : '否' }}</el-descriptions-item>
                        <el-descriptions-item label="递归请求">{{ currentRow.rd === '1' ? '是' : '否' }}</el-descriptions-item>
                        <el-descriptions-item label="权威回答">{{ currentRow.aa === '1' ? '是' : '否' }}</el-descriptions-item>
                        <el-descriptions-item label="截断标志">{{ currentRow.tc === '1' ? '是' : '否' }}</el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>

                <el-tab-pane label="解析结果" name="answers">
                    <el-table :data="answerData" border style="width: 100%">
                        <el-table-column prop="answer" label="IP地址" width="180" />
                        <el-table-column prop="ttl" label="TTL" width="120" />
                    </el-table>
                </el-tab-pane>

                <el-tab-pane label="附加信息" name="additional">
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="主机">{{ currentRow.host }}</el-descriptions-item>
                        <el-descriptions-item label="工厂ID">{{ currentRow.factoryId }}</el-descriptions-item>
                        <el-descriptions-item label="工厂名称">{{ currentRow.factoryName }}</el-descriptions-item>
                        <el-descriptions-item label="组ID">{{ currentRow.groupId }}</el-descriptions-item>
                        <el-descriptions-item label="分类">{{ currentRow.cat }}</el-descriptions-item>
                        <el-descriptions-item label="日志文件路径">{{ currentRow.logFilePath || 'N/A' }}</el-descriptions-item>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { getRcodeName } from '../../api/apiForOriginLog/originLogApi.js'
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
    proto: '',
    rcodeName: '',
    domain: '',
    startTime: '',
    endTime: '',
    sortField: '',
    sortOrder: ''
})

// 解析结果数据
const answerData = computed(() => {
    if (!currentRow.value.answers) return []
    return currentRow.value.answers.map((answer, index) => ({
        answer,
        ttl: currentRow.value.ttls?.[index] || 'N/A'
    }))
})

// DNS查询类型映射
const qtypeMap = {
    '1': 'A (IPv4地址)',
    '2': 'NS (域名服务器)',
    '5': 'CNAME (规范名称)',
    '6': 'SOA (授权起始)',
    '12': 'PTR (指针)',
    '15': 'MX (邮件交换)',
    '16': 'TXT (文本字符串)',
    '28': 'AAAA (IPv6地址)',
    '33': 'SRV (服务定位)'
}

// DNS查询类别映射
const qclassMap = {
    '1': 'IN (Internet)',
    '3': 'CH (Chaos)',
    '4': 'HS (Hesiod)'
}

// 获取数据
const fetchData = async () => {
    try {
        loading.value = true
        const response = await getRcodeName(
            queryParams.page,
            queryParams.size,
            queryParams.startTime,
            queryParams.endTime,
            queryParams.proto
        )
        // 前端过滤
        let filteredList = response.list
        if (queryParams.rcodeName) {
            filteredList = filteredList.filter(item => item.rcodeName === queryParams.rcodeName)
        }
        if (queryParams.domain) {
            const domainLower = queryParams.domain.toLowerCase()
            filteredList = filteredList.filter(item =>
                item.destinationDnsDomain && item.destinationDnsDomain.toLowerCase().includes(domainLower)
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

// 格式化响应时间
const formatRtt = (rtt) => {
    if (!rtt) return '0'
    const num = parseFloat(rtt) * 1000
    return num.toFixed(2)
}

// 获取响应码对应的标签类型
const getRcodeTagType = (rcodeName) => {
    switch (rcodeName) {
        case 'NOERROR':
            return 'success'
        case 'NXDOMAIN':
        case 'SERVFAIL':
            return 'warning'
        case 'REFUSED':
        case 'FORMERR':
            return 'danger'
        default:
            return 'info'
    }
}

// 获取查询类型名称
const getQtypeName = (qtype) => {
    return qtypeMap[qtype] || `未知类型 (${qtype})`
}

// 获取查询类别名称
const getQclassName = (qclass) => {
    return qclassMap[qclass] || `未知类别 (${qclass})`
}

// 查询
const handleQuery = () => {
    queryParams.page = 1
    fetchData()
}

// 重置查询
const resetQuery = () => {
    queryParams.page = 1
    queryParams.proto = ''
    queryParams.rcodeName = ''
    queryParams.domain = ''
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
.dns-query-container {
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
