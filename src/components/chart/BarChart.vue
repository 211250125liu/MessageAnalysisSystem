<template>
    <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
    chartData: {
        type: Array,
        required: true
    },
    xKey: {
        type: String,
        required: true
    },
    yKey: {
        type: String,
        required: true
    }
})

const chartRef = ref(null)
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
    if (!chartRef.value) return

    chartInstance = echarts.init(chartRef.value)
    updateChart()
}

const updateChart = () => {
    if (!chartInstance || !props.chartData.length) return

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'category',
            data: props.chartData.map(item => (item as {[key: string]: number})[props.xKey]),
            axisLabel: {
                rotate: 30
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: props.yKey === 'messageCount' ? '消息数量' : '流量(字节)',
                type: 'bar',
                data: props.chartData.map(item => (item as {[key: string]: number})[props.yKey]),
                itemStyle: {
                    color: '#409EFF'
                }
            }
        ]
    }

    chartInstance.setOption(option)
}

onMounted(() => {
    initChart()
    window.addEventListener('resize', () => {
        chartInstance?.resize()
    })
})

watch(() => props.chartData, () => {
    updateChart()
}, { deep: true })
</script>
