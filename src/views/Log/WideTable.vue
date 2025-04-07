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
        <el-table-column prop="id" label="id" width="80" />
        <el-table-column prop="cat" label="cat" width="100" />
        <el-table-column prop="catId" label="catId" width="100" />
        <el-table-column prop="factoryName" label="factoryName" width="110" />
        <el-table-column prop="timestamp" label="timestamp" width="180" />
        <el-table-column prop="host" label="host" width="150" />
        <el-table-column prop="proto" label="proto" width="70" />
        <el-table-column prop="src" label="src" width="180" />
        <el-table-column prop="dst" label="dst" width="180" />
        <el-table-column prop="dpt" label="dpt" width="80" />
        <el-table-column prop="spt" label="spt" width="80" />
        <el-table-column prop="smac" label="smac" width="180" />
        <el-table-column prop="dmac" label="dmac" width="180" />
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

    <PacketDetail
        v-model="drawerVisible"
        :item-data="currentRawItem"
        :has-raw-data="false"
    />
</template>

<script setup>
import {onBeforeMount, ref} from "vue";
import {searchWithConditions,getLogDetail} from "../../api/apiForLog/logApi.js"
import PacketDetail from "../../components/PacketDetail.vue";

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

</script>

<style scoped>

</style>
