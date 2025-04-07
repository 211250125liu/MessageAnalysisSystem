<template>
    <el-row :gutter="20">
        <el-col :span="3">
            <el-input
                v-model="filters.sourceIp"
                placeholder="源 IP"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="3">
            <el-input
                v-model="filters.destIp"
                placeholder="目的 IP"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="3">
            <el-input
                v-model="filters.sourceMac"
                placeholder="源 MAC 地址"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="3">
            <el-input
                v-model="filters.destMac"
                placeholder="目的 MAC 地址"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="4">
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
        <el-col :span="3">
            <el-select
                v-model="filters.protocol"
                placeholder="选择协议类型"
                clearable
                style="width: 100%"
            >
                <el-option label="TCP" value="TCP" />
                <el-option label="UDP" value="UDP" />
            </el-select>
        </el-col>
        <el-col :span="5" class="mt-4">
            <el-button type="primary" @click="getData" :loading="loading">查询</el-button>
            <el-button @click="resetFilter">重置条件</el-button>
        </el-col>
    </el-row>

    <el-table :data="formattedData" stripe style="width: 100%"
              @row-click="handleRowClick" >
        <el-table-column prop="No" label="No" width="80" />
        <el-table-column prop="time" label="Time" width="230" />
        <el-table-column prop="srcIp" label="SrcIp" width="130" />
        <el-table-column prop="dstIp" label="DstIp" width="130" />
        <el-table-column prop="srcMAC" label="SrcMAC" width="150" />
        <el-table-column prop="dstMAC" label="DstMAC" width="150" />
        <el-table-column prop="protocol" label="Protocol" width="90" />
        <el-table-column prop="length" label="Length" width="80" />
        <el-table-column prop="information" label="Info" width="320" />
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
        :has-raw-data="true"
    />
</template>

<script lang="ts" setup>
import {computed, onBeforeMount, ref} from 'vue'
import {getMessageByConditions} from "../../api/apiForMessage/messageApi.ts";
import PacketDetail from "../../components/PacketDetail.vue";

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const list = ref<any[]>([])

// rawData转换
/*const handleRowClick = (row: any) => {
    for(let item of list.value){
        if(row.messageId === (item as any).messageId){
            rawData.value = (item as any).rawData
            showData.value = true
            break
        }
    }
    //转换为可读字符串
    const hexArray = rawData.value.match(/.{2}/g) || [];  // 每两个字符为一组，转为数组
    // 将16进制码和对应的字符一起组合起来
    const formattedHex = hexArray.map(hex => {
        const code = parseInt(hex, 16);
        // 如果字符是可打印字符，则返回对应字符；否则返回 "."
        return (code >= 32 && code <= 126) ? String.fromCharCode(code) : '.';
    });
    // 每行 16 个字符, 每 8 个字符之间插入两个空格
    const rows = [];
    for (let i = 0; i < formattedHex.length; i += 16) {
        const line = formattedHex.slice(i, i + 16);
        const spacedLine = line.slice(0, 8).join(' ') + '  ' + line.slice(8).join(' '); // 每 8 个字符之间加两个空格
        rows.push(spacedLine);
    }
    rawAsciiData.value = rows.join('\n') || '';
    // 两个之间加一个空格
    if (rawData.value) {
        rawData.value = (rawData.value as string).match(/.{1,2}/g)?.join(' ') || '';
    }
    if(rawData.value) {
        // 2. 每16个字符后添加两个空格
        let chunks16: string[];
        chunks16 = ((rawData.value! as string).match(/.{1,48}/g) as any).map((chunk : any) => {
            // 在每16个字符之间添加两个空格
            return chunk.slice(0, 23) + '  ' + chunk.slice(23);
        }) || [];
        // 3. 每32个字符后换行
        rawData.value = chunks16.join('\n');
    }
}*/

const filters = ref({
    sourceIp: '',
    destIp: '',
    sourceMac: '',
    destMac: '',
    timeRange: [],
    protocol: ''
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
    let data = await getMessageByConditions(filters.value.sourceIp,filters.value.destIp, filters.value.sourceMac,filters.value.destMac, filters.value.protocol, startTime,endTime,currentPage.value,pageSize.value) as any
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
