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
                <el-option label="仅异常报文" value='true' />
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
    <el-pagination
        style="margin-top: 1rem"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 40]"
        size="default"
        layout="<-,total, sizes, prev, pager, next, jumper "
        :total="total"
        @size-change="getData"
        @current-change="getData"
    />

    <PacketDetail
        v-model="drawerVisible"
        :item-data="currentRawItem"
        :has-raw-data="true"
    />

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
import {computed, onBeforeMount, ref,} from 'vue'
import {getAnomaly, getMessageByConditions} from "../../api/apiForMessage/messageApi.ts";
import PacketDetail from "../../components/PacketDetail.vue";
import {ElMessage}  from "element-plus";

const drawerVisible2 = ref(false)
interface anomaly{
    score : number,
    anomalyMsg : string,
    anomalyDetails : object
}
const anomalyData = ref<anomaly>()
const showAnomalyInfo = async (messageId : number) => {
    try {
        anomalyData.value = await getAnomaly(messageId) as any
        drawerVisible2.value = true
    } catch (error) {
        ElMessage.error('获取异常信息失败')
        console.error(error)
    }
}

const getScoreTagType = (score : number) => {
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
    timeRange: [],
    protocol: '',
    onlyAnomaly : ''
});

// 数据格式化
const formattedData = computed(() => {
    return list.value.map((data : any) => ({
        No: data.message.messageId, // 序号
        time: data.message.time, // 提取 message.time
        srcIp: data.message.srcIp, // 提取 message.srcIp
        dstIp: data.message.dstIp, // 提取 message.dstIp
        srcMAC: data.messageDetail.ethernet.src,
        dstMAC: data.messageDetail.ethernet.dst,
        protocol: data.message.protocol, // 提取 message.protocol
        length: data.message.length, // 提取 message.length
        information: data.information, // 提取 information
        _raw: data
    }));
});

onBeforeMount(()=>{
    getData()
})

const loading = ref(false)
const getData = async () =>{
    loading.value = true
    let startTime = "",endTime = ""
    if(filters.value.timeRange){
        startTime = filters.value.timeRange[0]
        endTime = filters.value.timeRange[1]
    }
    let data = await getMessageByConditions(filters.value.sourceIp,filters.value.destIp, filters.value.sourceMac,filters.value.destMac, filters.value.protocol, startTime,endTime,currentPage.value,pageSize.value,filters.value.onlyAnomaly) as any
    loading.value = false
    total.value = data.total
    list.value = data.list
}
// 重置筛选
const resetFilter = () => {
    filters.value.sourceIp = '';
    filters.value.destIp = '';
    filters.value.sourceMac = '';
    filters.value.destMac = '';
    filters.value.timeRange = []
    filters.value.protocol = ''
};

const drawerVisible = ref(false);
const currentRawItem = ref(null); // 存储原始数据

// 点击行时触发
const handleRowClick = (row : any) => {
    currentRawItem.value = row._raw;
    drawerVisible.value = true;
};

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
</style>
