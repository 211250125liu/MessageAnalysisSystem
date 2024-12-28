<template>
    <el-table :data="formattedData" stripe style="width: 100%">
        <el-table-column prop="No" label="No" width="60" />
        <el-table-column prop="time" label="Time" width="230" />
        <el-table-column prop="srcIp" label="Source" width="180" />
        <el-table-column prop="dstIp" label="Destination" width="180" />
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
</template>

<script lang="ts" setup>
import {onBeforeMount, ref} from 'vue'
import {computed} from "vue";
import {getMessage } from "../api/messageApi.ts"

const currentPage = ref(1)
const pageSize = ref(10)
const background = ref(false)
const disabled = ref(false)
const total = ref(0)
const list = ref([])

//数据格式化
const formattedData = computed(() => {
    return list.value.map((data) => ({
        No: data.message.messageId, // 序号
        time: data.message.time, // 提取 message.time
        srcIp: data.message.srcIp, // 提取 message.srcIp
        dstIp: data.message.dstIp, // 提取 message.dstIp
        protocol: data.message.protocol, // 提取 message.protocol
        length: data.message.length, // 提取 message.length
        information: data.information // 提取 information
    }));
});

onBeforeMount(()=>{
    getData()
})

let getData = async () =>{
    let data  = await getMessage(currentPage.value,pageSize.value)
    total.value = data.total
    list.value = data.list
    console.log(total.value)
    console.log(list.value)
}
const handleSizeChange = () => {
    getData()
}
const handleCurrentChange = () => {
    getData()
}

</script>
