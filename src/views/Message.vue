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
        :page-sizes="[100, 200, 300, 400]"
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
import { ref } from 'vue'
import {computed} from "vue";

const currentPage = ref(4)
const pageSize = ref(100)
const background = ref(false)
const disabled = ref(false)
const total = ref(3)
const list = ref([])
const formattedData = computed(() => {
    return list.value.map((data, index) => ({
        No: data.message.messageId, // 序号
        time: data.message.time, // 提取 message.time
        srcIp: data.message.srcIp, // 提取 message.srcIp
        dstIp: data.message.dstIp, // 提取 message.dstIp
        protocol: data.message.protocol, // 提取 message.protocol
        length: data.message.length, // 提取 message.length
        information: data.information // 提取 information
    }));
});
list.value = [
    {
        "message": {
            "messageId": 2240,
            "factoryName": "ssl",
            "time": "2024-01-15 09:55:06.579459",
            "length": "74",
            "srcIp": "10.193.20.185",
            "dstIp": "10.193.21.200",
            "protocol": "UDP"
        },
        "information": "6666 -> 6666 Len:28",
        "messageDetail": {
            "ethernet": {
                "src": "56:5b:00:00:65:cf",
                "dst": "56:5b:00:00:65:cf",
                "type": "Virtual LAN(0x8100)"
            },
            "vlan": {
                "priority": "0",
                "dei": "0",
                "type": "IPv4",
                "id": "15"
            },
            "ip": {
                "version": "4",
                "hdrLen": "20",
                "len": "56",
                "flags": "0x02",
                "ttl": "255",
                "protocol": "17",
                "checksum": "0xb7dc",
                "srcIp": "10.193.20.185",
                "dstIp": "10.193.21.200"
            },
            "udp": {
                "srcPort": "6666",
                "dstPort": "6666",
                "length": "36",
                "checksum": "0x0000",
                "payload": "55:06:00:00:ff:00:00:00:00:e8:07:01:00:01:00:0f:00:0a:00:00:00:1f:00:20:03:5c:b0:aa"
            },
            "tcp": null
        },
        "rawData": "ffffffffffff565b000065cf8100000f08004500003883d54000ff11b7dc0ac114b90ac115c81a0a1a0a0024000055060000ff00000000e807010001000f000a0000001f0020035cb0aa"
    },
    {
        "message": {
            "messageId": 2241,
            "factoryName": "ssl",
            "time": "2024-01-15 09:55:06.579464",
            "length": "74",
            "srcIp": "10.193.20.185",
            "dstIp": "10.193.21.200",
            "protocol": "UDP"
        },
        "information": "6666 -> 6666 Len:28",
        "messageDetail": {
            "ethernet": {
                "src": "56:5b:00:00:65:cf",
                "dst": "56:5b:00:00:65:cf",
                "type": "Virtual LAN(0x8100)"
            },
            "vlan": {
                "priority": "0",
                "dei": "0",
                "type": "IPv4",
                "id": "15"
            },
            "ip": {
                "version": "4",
                "hdrLen": "20",
                "len": "56",
                "flags": "0x02",
                "ttl": "255",
                "protocol": "17",
                "checksum": "0xb7dc",
                "srcIp": "10.193.20.185",
                "dstIp": "10.193.21.200"
            },
            "udp": {
                "srcPort": "6666",
                "dstPort": "6666",
                "length": "36",
                "checksum": "0x0000",
                "payload": "55:06:00:00:ff:00:00:00:00:e8:07:01:00:01:00:0f:00:0a:00:00:00:1f:00:20:03:5c:b0:aa"
            },
            "tcp": null
        },
        "rawData": "ffffffffffff565b000065cf8100000f08004500003883d54000ff11b7dc0ac114b90ac115c81a0a1a0a0024000055060000ff00000000e807010001000f000a0000001f0020035cb0aa"
    },
    {
        "message": {
            "messageId": 2242,
            "factoryName": "ssl",
            "time": "2024-01-15 09:55:06.579485",
            "length": "74",
            "srcIp": "10.193.20.185",
            "dstIp": "10.193.21.200",
            "protocol": "UDP"
        },
        "information": "6666 -> 6666 Len:28",
        "messageDetail": {
            "ethernet": {
                "src": "56:5b:00:00:65:cf",
                "dst": "56:5b:00:00:65:cf",
                "type": "Virtual LAN(0x8100)"
            },
            "vlan": {
                "priority": "0",
                "dei": "0",
                "type": "IPv4",
                "id": "15"
            },
            "ip": {
                "version": "4",
                "hdrLen": "20",
                "len": "56",
                "flags": "0x02",
                "ttl": "255",
                "protocol": "17",
                "checksum": "0xb7dc",
                "srcIp": "10.193.20.185",
                "dstIp": "10.193.21.200"
            },
            "udp": {
                "srcPort": "6666",
                "dstPort": "6666",
                "length": "36",
                "checksum": "0x0000",
                "payload": "55:06:00:00:ff:00:00:00:00:e8:07:01:00:01:00:0f:00:0a:00:00:00:1f:00:20:03:5c:b0:aa"
            },
            "tcp": null
        },
        "rawData": "ffffffffffff565b000065cf8100000f08004500003883d54000ff11b7dc0ac114b90ac115c81a0a1a0a0024000055060000ff00000000e807010001000f000a0000001f0020035cb0aa"
    }
]
const handleSizeChange = (val: number) => {
    console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
    console.log(`current page: ${val}`)
}

</script>
