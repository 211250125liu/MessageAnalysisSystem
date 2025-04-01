<template>
    <el-card style="margin-top: 0">
        <el-row :gutter="20">
            <el-col :span="5">
                <el-select
                    v-model="isSource"
                    placeholder="Select"
                    size="default"
                    style="width: 240px"
                >
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-col>
            <el-col :span="5">
                <el-input
                    v-model="ip"
                    placeholder="输入Ip地址"
                    clearable
                />
            </el-col>
            <el-col :span="6">
                <el-button type="primary" @click="search">查询</el-button>
            </el-col>
        </el-row>
    </el-card>
    <el-card>
        <div ref="chartDom" style="height: 35rem;"></div>
    </el-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import { getFlowBySource, getFlowByTarget } from "../../api/apiForMessage/flowApi.ts";
import * as echarts from 'echarts';

// 获取 ip 和是否是源节点
const ip = ref('10.193.21.253');
const isSource = ref(true);
const options = [
    { value: true, label: '源Ip节点' },
    { value: false, label: '目标Ip节点' },
];

// 用于存储流量数据
const data = ref<any>([]);

// 初始化图表对象
const chartDom = ref<HTMLElement | null>(null); // 使用 ref 访问 DOM
let myChart: echarts.ECharts | null = null; // 确保初始化为 null

// 图表初始化
onMounted(() => {
    nextTick(() => { // 确保 DOM 完全加载
        if (chartDom.value) {
            myChart = echarts.init(chartDom.value);
        }
    });
});

// 查询流量数据并更新图表
const search = async () => {
    let flowData;
    if (isSource.value) {
        flowData = await getFlowBySource(ip.value);
    } else {
        flowData = await getFlowByTarget(ip.value);
    }
    data.value = flowData;
    console.log(flowData)
    updateChart(flowData); // 更新图表
};

// 更新图表
const updateChart = (flowData: any) => {
    if (myChart) {
        let positionData = getPosition(flowData)
        positionData.unshift({
            name: ip.value,
            x : 0,
            y : 0
        })
        let link = []
        if(isSource.value){
            for(let i = 1;i < positionData.length;i++){
                link.push({
                    source: 0,
                    target: i,
                    label: {
                        show : true,
                        formatter: "connectCnt : " + flowData[i-1].connectCnt + "\n" + "traffic : " + flowData[i-1].traffic
                    },
                })
            }
        }
        else{
            for(let i = 1;i < positionData.length;i++){
                link.push({
                    source: i,
                    target: 0,
                    label: {
                        show : true,
                        formatter: "connectCnt : " + flowData[i-1].connectCnt + "\n" + "traffic : " + flowData[i-1].traffic
                    },
                })
            }
        }
        let option : any =  {
            title: {
                text: 'Flow Graph'
            },
            tooltip: {},
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    type: 'graph',
                    layout: 'none',
                    symbolSize: 100,
                    roam: true,
                    label: {
                        show: true
                    },
                    edgeSymbol: ['circle', 'arrow'],
                    edgeSymbolSize: [4, 10],
                    edgeLabel: {
                        fontSize: 15
                    },
                    data: positionData,
                    links: link,
                    lineStyle: {
                        opacity: 0.9,
                        width: 2,
                    }
                }
            ]
        };
        myChart.setOption(option, true); // 更新图表数据
    }
};

// 生成节点的坐标，n为节点数，中心节点（默认0,0）,radius为半径默认100
function getPosition(flowData : any, radius=300) {
    const positionData = [];
    const angleStep = 2 * Math.PI / flowData.length;  // 每个节点的角度间隔

    for (let i = 0; i < flowData.length; i++) {
        const angle = i * angleStep;  // 当前节点的角度
        const x = radius * Math.cos(angle);  // 计算 x 坐标
        const y = radius * Math.sin(angle);  // 计算 y 坐标
        positionData.push({
            name : flowData[i].ip,
            x : x,
            y : y
        });
    }

    return positionData;
}

</script>

<style scoped>
</style>
