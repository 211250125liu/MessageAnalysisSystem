<template>
    <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
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
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                const value = params[0].value
                return `${params[0].axisValue}<br/>流量: ${formatBytes(value)}`
            }
        },
        grid: {
            right: '5%', // 或者具体像素值如 '80px'
            left: '5%',  // 如果需要也可以调整左边距
            containLabel: true // 确保轴标签也在grid内
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
            name: '流量',
            axisLabel: {
                formatter: (value: number) => formatBytes(value)
            }
        },
        series: [
            {
                name: '网络流量',
                type: 'line',
                stack: 'total',
                data: props.chartData.map(item => (item as {traffic : number}).traffic),
                smooth: true,
                itemStyle: {
                    color: '#67C23A'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(103, 194, 58, 0.5)' },
                        { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
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

// 格式化字节显示
const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}
</script>
