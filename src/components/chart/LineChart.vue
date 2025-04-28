<template>
    <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
    chartData: {
        type: Array,
        default: () => []
    }
})
const chartRef = ref()

onMounted(() => {
    initChart()
})

watch(() => props.chartData, () => {
    initChart()
})

const initChart = () => {
    if (!chartRef.value || props.chartData.length === 0) return

    const chart = echarts.init(chartRef.value)
    const option = {
        grid: {
            left: '3%',    // 左边距
            right: '4%',   // 右边距
            bottom: '15%', // 下边距（为X轴标签留空间）
            containLabel: true // 确保坐标轴标签显示在grid内
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>消息数量: {c}'
        },
        xAxis: {
            type: 'category',
            data: props.chartData.map(item => (item as { time: string }).time),
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '消息数量'
        },
        series: [
            {
                name: '消息数量',
                type: 'line',
                data: props.chartData.map(item => (item as {count : number}).count),
                smooth: true,
                itemStyle: {
                    color: '#409EFF'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                        { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
                    ])
                }
            }
        ]
    }

    chart.setOption(option)

    // 响应式调整
    window.addEventListener('resize', () => {
        chart.resize()
    })
}
</script>
