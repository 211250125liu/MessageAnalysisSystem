<template>
    <el-row :gutter="20">
        <el-col :span="4">
            <el-select
                    v-model="filters.cat"
                    placeholder="cat"
                    clearable
                    style="width: 100%"
            >
                <el-option
                        v-for="item in catOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                />
            </el-select>
        </el-col>
        <el-col :span="4">
            <el-select
                v-model="filters.factoryName"
                placeholder="工厂名称"
                clearable
                style="width: 100%"
            >
                <el-option
                    v-for="item in factoryNameOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
        </el-col>
        <el-col :span="4">
            <el-select
                v-model="filters.proto"
                placeholder="proto"
                clearable
                style="width: 100%"
            >
                <el-option
                    v-for="item in protoOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
        </el-col>
        <el-col :span="6">
            <el-date-picker
                    v-model="filters.timeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
            />
        </el-col>
        <el-col :span="6" class="mt-4">
            <el-button type="primary" @click="getData" :loading="loading">查询</el-button>
            <el-button @click="resetFilter">重置条件</el-button>
        </el-col>
    </el-row>

    <el-table :data="list" stripe style="width: 100%"
              @row-click="handleRowClick" >
        <el-table-column prop="cat" label="cat" width="100" />
        <el-table-column prop="catId" label="catId" width="100" />
        <el-table-column prop="factoryName" label="factoryName" width="110" />
        <el-table-column prop="timestamp" label="timestamp" width="180" />
        <el-table-column prop="host" label="host" width="150" />
        <el-table-column prop="proto" label="proto" width="100" />
        <el-table-column prop="src" label="src" width="180" />
        <el-table-column prop="dst" label="dst" width="180" />
        <el-table-column prop="dpt" label="dpt" width="80" />
        <el-table-column prop="spt" label="spt" width="80" />
        <el-table-column prop="smac" label="smac" width="180" />
        <el-table-column prop="dmac" label="dmac" width="180" />
        <el-table-column fixed="right" label="操作" width="120">
            <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleRowClick(row)">
                    详情
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
        layout="->,total, sizes, prev, pager, next, jumper "
        :total="total"
        @size-change="getData"
        @current-change="getData"
    />
    <el-dialog
        v-model="drawerVisible"
        title="日志详情"
        width="70%"
        :close-on-click-modal="false"
    >
        <template v-if="currentRawItem">
            <el-descriptions
                title="基础信息"
                :column="2"
                border
                size="small"
            >
                <el-descriptions-item label="cat">{{ currentRawItem.cat }}</el-descriptions-item>
                <el-descriptions-item label="catId">{{ currentRawItem.catId }}</el-descriptions-item>
                <el-descriptions-item label="factoryName">{{ currentRawItem.factoryName }}</el-descriptions-item>
                <el-descriptions-item label="groupId">{{ currentRawItem.groupId }}</el-descriptions-item>
                <el-descriptions-item label="timestamp">{{ currentRawItem.timestamp }}</el-descriptions-item>
                <el-descriptions-item label="timestampAggr">{{ currentRawItem.timestampAggr }}</el-descriptions-item>
                <el-descriptions-item label="src">{{ currentRawItem.src }}</el-descriptions-item>
                <el-descriptions-item label="dst">{{ currentRawItem.dst }}</el-descriptions-item>
                <el-descriptions-item label="spt">{{ currentRawItem.spt }}</el-descriptions-item>
                <el-descriptions-item label="dpt">{{ currentRawItem.dpt }}</el-descriptions-item>
                <el-descriptions-item label="smac">{{ currentRawItem.smac }}</el-descriptions-item>
                <el-descriptions-item label="dmac">{{ currentRawItem.dmac }}</el-descriptions-item>
                <el-descriptions-item label="proto">{{ currentRawItem.proto }}</el-descriptions-item>
                <el-descriptions-item label="app">{{ currentRawItem.app }}</el-descriptions-item>
                <el-descriptions-item label="host">{{ currentRawItem.host }}</el-descriptions-item>
                <el-descriptions-item label="logfile">{{ currentRawItem.logfile }}</el-descriptions-item>
                <el-descriptions-item label="lineId">{{ currentRawItem.lineId }}</el-descriptions-item>
                <el-descriptions-item label="uidRaw">{{ currentRawItem.uidRaw }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="嵌套字段（已解析）" :column="1" border size="small" class="mt-4">
                <el-descriptions-item label="log">
                    <pre>{{ tryParseJson(currentRawItem.log) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="fields">
                    <pre>{{ tryParseJson(currentRawItem.fields) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="prospector">
                    <pre>{{ tryParseJson(currentRawItem.prospector) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="input">
                    <pre>{{ tryParseJson(currentRawItem.input) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="tags">
                    <pre>{{ tryParseJson(currentRawItem.tags) }}</pre>
                </el-descriptions-item>
            </el-descriptions>
        </template>

        <template #footer>
            <el-button type="primary" @click="copyToClipboard(currentRawItem)">复制全部数据（JSON）</el-button>
            <el-button @click="drawerVisible = false">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import {onBeforeMount, ref} from "vue";
import {searchWithConditions,getLogDetail} from "../../api/apiForLog/logApi.js"
import {ElMessage} from "element-plus";

const filters = ref({
    cat: '',
    factoryName: '',
    proto: '',
    timeRange: [],
});
const catOptions = [
    {value: 'conn', label: 'conn',},
    {value: 'dns', label: 'dns',},
    {value: 'smb_files', label: 'smb_files',},
    {value: 'http', label: 'http',},
    {value: 'weird', label: 'weird',},
    {value: 'mitm', label: 'mitm',},
    {value: 'winEvent', label: 'winEvent',},
    {value: 's7_plc_func', label: 's7_plc_func',},
    {value: 'rdp', label: 'rdp',},
    {value: 'ssh', label: 'ssh',},
    {value: 'syslog', label: 'syslog',},
]
const factoryNameOptions = [
    {value: 'SEAL', label: 'SEAL',},
    {value: 'SMVS', label: 'SMVS',},
    {value: 'SSLS', label: 'SSLS',},
]
const protoOptions = [
    {value: 'icmp', label: 'icmp',},
    {value: 'udp', label: 'udp',},
    {value: 'tcp', label: 'tcp',},
    {value: 'profinet', label: 'profinet',},
]

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const list = ref([])

onBeforeMount(()=>{
    getData()
})

const loading = ref(false)

const getData = async () => {
    loading.value = true
    let startTime = "",endTime = ""
    if(filters.value.timeRange){
        startTime = filters.value.timeRange[0]
        endTime = filters.value.timeRange[1]
    }
    let data = await searchWithConditions(pageSize.value,filters.value.cat,filters.value.factoryName,filters.value.proto,currentPage.value,startTime,endTime)
    loading.value = false
    total.value = data.total
    list.value = data.list
}

const resetFilter = () => {
    filters.value.proto = '';
    filters.value.cat = '';
    filters.value.factoryName = '';
    filters.value.timeRange = []
};

const drawerVisible = ref(false);
const currentRawItem = ref(null); // 存储原始数据
// 点击行时触发
const handleRowClick = async (row) => {
    drawerVisible.value = true;
    currentRawItem.value = await getLogDetail(row.id)
};
//解析嵌套数据
const tryParseJson = (val) => {
    if (!val) return '无数据';
    try {
        return JSON.stringify(JSON.parse(val), null, 2);
    } catch (e) {
        return val; // 如果不是 JSON 字符串，直接返回原值
    }
};

const copyToClipboard = (value) => {
    const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    navigator.clipboard.writeText(text).then(() => {
        ElMessage.success('已复制到剪贴板')
    }).catch(() => {
        ElMessage.error('复制失败')
    })
}

</script>

<style scoped>
pre {
    font-family: monospace;
    background-color: #f8f8f8;
    padding: 10px;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
