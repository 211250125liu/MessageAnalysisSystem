<template>
    <el-row :gutter="20">
        <el-col :span="4">
            <el-input
                v-model="filters.sourceIp"
                placeholder="输入源 IP"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="4">
            <el-input
                v-model="filters.destIp"
                placeholder="输入目的 IP"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="4">
            <el-input
                v-model="filters.sourceMac"
                placeholder="输入源 MAC 地址"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="4">
            <el-input
                v-model="filters.destMac"
                placeholder="输入目的 MAC 地址"
                prefix-icon="el-icon-search"
                clearable
            />
        </el-col>
        <el-col :span="6" class="mt-4">
            <el-button type="primary" @click="getData">筛选</el-button>
            <el-button @click="resetFilter">重置筛选</el-button>
        </el-col>
    </el-row>

    <el-table :data="formattedData" stripe style="width: 100%"
              @row-click="handleRowClick" >
        <el-table-column prop="No" label="No" width="80" />
        <el-table-column prop="time" label="Time" width="250" />
        <el-table-column prop="srcIp" label="SrcIp" width="180" />
        <el-table-column prop="dstIp" label="DstIp" width="180" />
        <el-table-column prop="srcMAC" label="SrcMAC" width="180" />
        <el-table-column prop="dstMAC" label="DstMAC" width="180" />
        <el-table-column prop="protocol" label="Protocol" width="100" />
        <el-table-column prop="length" label="Length" width="80" />
        <el-table-column prop="information" label="Info" width="180" />
    </el-table>
    <el-pagination
        style="margin-top: 1rem"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 40]"
        size="default"
        :disabled="disabled"
        :background="background"
        layout="->,total, sizes, prev, pager, next, jumper "
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />
    <div v-if="showData" style="display: flex">
        <span> rawData </span>
        <div style="width: 30rem;height: 15rem;white-space: pre-line; margin:0 2rem;letter-spacing:0.1em;text-align: start " >
            {{rawData}}
        </div>
        <div  style="width: 20rem;height: 15rem;white-space: pre-line;letter-spacing:0.2rem" >
            {{rawAsciiData}}
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeMount, ref} from 'vue'
import {getMessageByMacAndIp} from "../api/messageApi.ts";

const currentPage = ref(1)
const pageSize = ref(10)
const background = ref(false)
const disabled = ref(false)
const total = ref(0)
const list = ref([])
const showData = ref(false)
const rawData = ref<string>("")
const rawAsciiData = ref("")

// rawData转换
const handleRowClick = (row: any) => {
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
}

const filters = ref({
    sourceIp: '',
    destIp: '',
    sourceMac: '',
    destMac: ''
});


//数据格式化
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
        information: data.information // 提取 information
    }));
});

onBeforeMount(()=>{
    getData()
})

let getData = async () =>{
    let data  = await getMessageByMacAndIp(filters.value.sourceMac,filters.value.destMac,
    filters.value.sourceIp,filters.value.destIp,currentPage.value,pageSize.value) as any
    console.log("data")
    console.log(data)
    total.value = data.total
    list.value = data.list
    // console.log(total.value)
    // console.log(list.value)
}
// 重置筛选
const resetFilter = () => {
    filters.value.sourceIp = '';
    filters.value.destIp = '';
    filters.value.sourceMac = '';
    filters.value.destMac = '';
};

const handleSizeChange = () => {
    getData()
}
const handleCurrentChange = () => {
    getData()
}

</script>
