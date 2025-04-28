<template>
    <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
    chartData: {
        type: Array,
        default: () => []
    }
})

const chartRef = ref()
let chart: echarts.ECharts | null = null

onMounted(() => {
    initChart()
})

watch(() => props.chartData, () => {
    initChart()
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
})

const resizeChart = () => {
    chart?.resize()
}

const initChart = () => {
    if (!chartRef.value || props.chartData.length === 0) return

    if (chart) {
        chart.dispose()
    }

    chart = echarts.init(chartRef.value)

    const option = {
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '5%',
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>异常数量: {c}'
        },
        xAxis: {
            type: 'category',
            data: props.chartData.map(item => (item as { time: string }).time),
            axisLabel: {
                rotate: 45,
                margin: 15,
            },
            axisTick: {
                alignWithLabel: true
            }
        },
        yAxis: {
            type: 'value',
            name: '异常数量',
            nameGap: 25,
            nameLocation: 'end',
            axisLabel: {
                margin: 15,
                inside: false
            },
            splitLine: {
                show: true
            }
        },
        series: [
            {
                name: '异常数量',
                type: 'bar',
                data: props.chartData.map(item => (item as {anomaly: number}).anomaly),
                itemStyle: {
                    color: '#F56C6C'
                },
                barWidth: '60%'
            }
        ]
    }

    chart.setOption(option)
    window.addEventListener('resize', resizeChart)
}
</script>
