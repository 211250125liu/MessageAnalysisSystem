<template>
    <el-row :gutter="20">
        <el-col :span="2">
            <el-input
                v-model="filters.sourceIp"
                placeholder="源IP"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="2">
            <el-input
                v-model="filters.destIp"
                placeholder="目的IP"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="3">
            <el-input
                v-model="filters.sourceMac"
                placeholder="源MAC地址"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="3">
            <el-input
                v-model="filters.destMac"
                placeholder="目的MAC地址"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="4">
            <el-date-picker
                v-model="filters.timeRange"
                type="datetimerange"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :disabled-date="disabledDate"
            />
        </el-col>
        <el-col :span="2">
            <el-select
                v-model="filters.protocol"
                placeholder="协议"
                clearable
                style="width: 100%"
            >
                <el-option label="TCP" value="TCP" />
                <el-option label="UDP" value="UDP" />
            </el-select>
        </el-col>
        <el-col :span="4">
            <el-select
                v-model="filters.onlyAnomaly"
                placeholder="是否仅展示异常报文"
                clearable
                style="width: 100%"
            >
                <el-option label="仅异常报文" value="true" />
                <el-option label="所有报文" value="false" />
            </el-select>
        </el-col>
        <el-col :span="4" class="mt-4">
            <el-button type="primary" @click="getData" :loading="loading">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
        </el-col>
    </el-row>

    <el-table :data="formattedData" stripe style="width: 100%">
        <el-table-column prop="No" label="No" width="80" />
        <el-table-column prop="time" label="Time" width="230" />
        <el-table-column prop="srcIp" label="SrcIp" width="130" />
        <el-table-column prop="dstIp" label="DstIp" width="130" />
        <el-table-column prop="srcMAC" label="SrcMAC" width="150" />
        <el-table-column prop="dstMAC" label="DstMAC" width="150" />
        <el-table-column prop="protocol" label="Protocol" width="90" />
        <el-table-column prop="length" label="Length" width="80" />
        <el-table-column prop="information" label="Info" width="320" />
        <el-table-column fixed="right" label="操作" width="120">
            <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleRowClick(row)">
                    详情
                </el-button>
                <el-button
                    link
                    type="warning"
                    size="small"
                    @click="showAnomalyInfo(row.No)"
                >
                    异常信息
                </el-button>
            </template>
        </el-table-column>
    </el-table>
<!--    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem">-->
<!--        <el-pagination-->
<!--            v-model:current-page="currentPage"-->
<!--            v-model:page-size="pageSize"-->
<!--            :page-sizes="[10, 20, 30, 40]"-->
<!--            layout="total, sizes, prev, pager, next, jumper"-->
<!--            :total="total"-->
<!--            @size-change="getData"-->
<!--            @current-change="getData"-->
<!--        />-->
<!--        <el-button>-->
<!--            <el-link-->
<!--                type="primary"-->
<!--                :href="`http://172.29.7.168:65348/message/export?` + query"-->
<!--                download="data.json"-->
<!--            >-->
<!--                导出JSON文件-->
<!--            </el-link>-->
<!--        </el-button>-->
<!--    </div>-->
    <div style="display: flex; justify-content: flex-start; align-items: center; margin-top: 1rem; gap: 40rem">
        <el-pagination v-model:current-page="currentPage"
                       v-model:page-size="pageSize"
                       :page-sizes="[10, 20, 30, 40]"
                       layout="total, sizes, prev, pager, next, jumper" :total="total"
                       @size-change="getData"
                       @current-change="getData" />
            <el-button type="primary">
                <el-link :href="`http://172.29.7.168:65348/message/export?` + query" download="data.json"
                             style="color: white">
                    导出本页查询数据
            </el-link>
        </el-button>
    </div>


    <el-dialog v-model="dialogVisible" title="数据包详情" width="70%">
        <el-tabs v-model="activeTab">
            <el-tab-pane label="ethernet" name="ethernet">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="src">{{ packetData.messageDetail.ethernet?.src }}</el-descriptions-item>
                    <el-descriptions-item label="dst">{{ packetData.messageDetail.ethernet?.dst }}</el-descriptions-item>
                    <el-descriptions-item label="type">{{ packetData.messageDetail.ethernet?.type }}</el-descriptions-item>
                </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="vlan" name="vlan">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="priority">{{ packetData.messageDetail.vlan?.priority }}</el-descriptions-item>
                    <el-descriptions-item label="dei">{{ packetData.messageDetail.vlan?.dei }}</el-descriptions-item>
                    <el-descriptions-item label="type">{{ packetData.messageDetail.vlan?.type }}</el-descriptions-item>
                    <el-descriptions-item label="id">{{ packetData.messageDetail.vlan?.id }}</el-descriptions-item>
                </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="ip" name="ip">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="version">{{ packetData.messageDetail.ip?.version }}</el-descriptions-item>
                    <el-descriptions-item label="hdrLen">{{ packetData.messageDetail.ip?.hdrLen }}</el-descriptions-item>
                    <el-descriptions-item label="len">{{ packetData.messageDetail.ip?.len }}</el-descriptions-item>
                    <el-descriptions-item label="flags">{{ packetData.messageDetail.ip?.flags }}</el-descriptions-item>
                    <el-descriptions-item label="ttl">{{ packetData.messageDetail.ip?.ttl }}</el-descriptions-item>
                    <el-descriptions-item label="protocol">{{ packetData.messageDetail.ip?.protocol }}</el-descriptions-item>
                    <el-descriptions-item label="checksum">{{ packetData.messageDetail.ip?.checksum }}</el-descriptions-item>
                    <el-descriptions-item label="srcIp">{{ packetData.messageDetail.ip?.srcIp }}</el-descriptions-item>
                    <el-descriptions-item label="dstIp">{{ packetData.messageDetail.ip?.dstIp }}</el-descriptions-item>
                </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="udp" name="udp">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="checksum">{{ packetData.messageDetail.udp?.checksum}}</el-descriptions-item>
                    <el-descriptions-item label="dstPort">{{ packetData.messageDetail.udp?.dstPort}}</el-descriptions-item>
                    <el-descriptions-item label="length">{{ packetData.messageDetail.udp?.length}}</el-descriptions-item>
                    <el-descriptions-item label="payload">{{ packetData.messageDetail.udp?.payload}}</el-descriptions-item>
                    <el-descriptions-item label="srcPort">{{ packetData.messageDetail.udp?.srcPort}}</el-descriptions-item>
                </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="tcp" name="tcp">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="srcPort">{{ packetData.messageDetail.tcp?.srcPort}}</el-descriptions-item>
                    <el-descriptions-item label="dstPort">{{ packetData.messageDetail.tcp?.dstPort}}</el-descriptions-item>
                    <el-descriptions-item label="seq">{{ packetData.messageDetail.tcp?.seq}}</el-descriptions-item>
                    <el-descriptions-item label="ack">{{ packetData.messageDetail.tcp?.ack}}</el-descriptions-item>
                    <el-descriptions-item label="hdrLen">{{ packetData.messageDetail.tcp?.hdrLen}}</el-descriptions-item>
                    <el-descriptions-item label="flags">{{ packetData.messageDetail.tcp?.flags}}</el-descriptions-item>
                    <el-descriptions-item label="windowSize">{{ packetData.messageDetail.tcp?.windowSize}}</el-descriptions-item>
                    <el-descriptions-item label="checksum">{{ packetData.messageDetail.tcp?.checksum}}</el-descriptions-item>
                    <el-descriptions-item label="urgentPointer">{{ packetData.messageDetail.tcp?.urgentPointer}}</el-descriptions-item>
                    <el-descriptions-item label="options">{{ packetData.messageDetail.tcp?.options}}</el-descriptions-item>
                </el-descriptions>
            </el-tab-pane>
        </el-tabs>
        <template #footer>
            <el-button @click="dialogVisible = false">关闭</el-button>
        </template>
    </el-dialog>

    <el-drawer
        v-model="drawerVisible2"
        title="报文异常信息"
        direction="rtl"
        size="30%"
    >
        <div v-if="anomalyData">
            <el-descriptions :column="1" border>
                <el-descriptions-item label="综合评分">
                    <el-tag :type="getScoreTagType(anomalyData.score)">
                        {{ anomalyData.score }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="异常摘要">
                    {{ anomalyData.anomalyMsg }}
                </el-descriptions-item>
                <el-descriptions-item label="异常详情">
                    <ul>
                        <li v-for="(detail, index) in anomalyData.anomalyDetails" :key="index">
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
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue'
import { getAnomaly, getMessageByConditions } from "../../api/apiForMessage/messageApi.ts"
import {ElMessage}  from "element-plus";
import dayjs from 'dayjs'

const drawerVisible2 = ref(false)
interface Anomaly {
    score: number,
    anomalyMsg: string,
    anomalyDetails: string[]
}
const anomalyData = ref<Anomaly | null>(null)

const showAnomalyInfo = async (messageId: number) => {
    try {
        anomalyData.value = await getAnomaly(messageId) as any
        drawerVisible2.value = true
    } catch (error) {
        ElMessage.error('获取异常信息失败')
        console.error(error)
    }
}

const getScoreTagType = (score: number) => {
    if (score <= 60) return 'success'
    if (score <= 80) return 'warning'
    return 'danger'
}

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const list = ref<any[]>([])

const filters = ref({
    sourceIp: '',
    destIp: '',
    sourceMac: '',
    destMac: '',
    timeRange: [
        dayjs('2024-01-15 00:00:00').format('YYYY-MM-DD HH:mm:ss'),
        dayjs('2024-01-15 24:00:00').format('YYYY-MM-DD HH:mm:ss')
    ],
    protocol: '',
    onlyAnomaly: ''
})

const disabledDate = (time: Date) => {
    // 1. 限制只能选择 2024-01-15
    const startDate = new Date(2024, 0, 15); // 2024-01-15 00:00:00
    const endDate = new Date(2024, 0, 20);   // 2024-01-16 00:00:00（不包含）

    // 如果不在 2024-01-15 范围内，直接禁用
    if (time.getTime() < startDate.getTime() || time.getTime() >= endDate.getTime()) {
        return true;
    }

    // 2. 如果已选择开始时间，限制最大范围不超过 24 小时
    if (filters.value.timeRange && filters.value.timeRange[0]) {
        const startTime = new Date(filters.value.timeRange[0]).getTime();
        const maxRange = 24 * 60 * 60 * 1000 * 5; // 24 * 5 小时
        return time.getTime() > startTime + maxRange;
    }

    return false;
};

// 数据格式化
const formattedData = computed(() => {
    return list.value.map((data: any) => ({
        No: data.message.messageId,
        time: data.message.time,
        srcIp: data.message.srcIp,
        dstIp: data.message.dstIp,
        srcMAC: data.messageDetail.ethernet?.src || '',
        dstMAC: data.messageDetail.ethernet?.dst || '',
        protocol: data.message.protocol,
        length: data.message.length,
        information: data.information,
        _raw: data
    }))
})

onBeforeMount(() => {
    getData()
})

const query = computed(() => {
    let startTime = filters.value.timeRange[0]
    let pageNum = currentPage.value
    let onlyAnomaly = filters.value.onlyAnomaly
    let size = pageSize.value
    return `startTIme=${startTime}endTime=${filters.value.timeRange[1]}
    &srcIp=${filters.value.sourceIp}&dstIp=${filters.value.destIp}&srcMac=${filters.value.sourceMac}&
    dstMac=${filters.value.destMac}&protocol=${filters.value.protocol}&
    onlyAnomaly=${onlyAnomaly}&pageNum=${pageNum}&
    pageSize=${size}`
});

const loading = ref(false)
const getData = async () => {
    loading.value = true
    let startTime = "", endTime = ""
    if (filters.value.timeRange && filters.value.timeRange.length === 2) {
        startTime = filters.value.timeRange[0]
        endTime = filters.value.timeRange[1]
    }
    try {
        const data = await getMessageByConditions(
            filters.value.sourceIp,
            filters.value.destIp,
            filters.value.sourceMac,
            filters.value.destMac,
            filters.value.protocol,
            startTime,
            endTime,
            currentPage.value,
            pageSize.value,
            filters.value.onlyAnomaly
        ) as any
        console.log(data)
        total.value = data.total
        list.value = data.list
    } catch (error) {
        ElMessage.error('获取数据失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 重置筛选
const resetFilter = () => {
    filters.value = {
        sourceIp: '',
        destIp: '',
        sourceMac: '',
        destMac: '',
        timeRange: [],
        protocol: '',
        onlyAnomaly: ''
    }
    currentPage.value = 1
    getData()
}

const dialogVisible = ref(false)
const packetData = ref<any>({})

const handleRowClick = (row: any) => {
    packetData.value = row._raw
    dialogVisible.value = true
}

const getProtocolTagType = (protocol: string) => {
    const map: Record<string, string> = {
        'TCP': 'success',
        'UDP': 'warning',
        'ICMP': 'danger',
        'HTTP': '',
        'HTTPS': 'success'
    }
    return map[protocol] || 'info'
}

const parseTcpFlags = (flags: string) => {
    if (!flags) return []

    const flagMap: Record<string, string[]> = {
        '0x0002': ['SYN'],
        '0x0010': ['ACK'],
        '0x0018': ['ACK', 'PSH'],
        '0x0001': ['FIN'],
        '0x0004': ['RST']
    }

    return flagMap[flags] || [flags]
}

const copyData = () => {
    navigator.clipboard.writeText(JSON.stringify(packetData.value, null, 2))
        .then(() => {
            ElMessage.success('已复制到剪贴板')
        })
        .catch(err => {
            console.error('复制失败:', err)
            ElMessage.error('复制失败')
        })
}
const activeTab = ref("ethernet")

</script>

<style scoped>
:deep(.el-input__wrapper) {
    padding-left: 0;
}
/* 调整 placeholder 和输入文本的左侧对齐 */
:deep(.el-input__inner) {
    text-indent: 0;
}
/* 可选：调整前缀图标的位置（如果存在） */
:deep(.el-input__prefix) {
    left: 5px;
}

.el-tag {
    margin-right: 5px;
}
</style>
