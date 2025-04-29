<template>
    <div class="page-container">
        <el-card>
            <el-row :gutter="20">
                <el-col :span="10">
                    <el-date-picker
                            v-model="timeRange"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            style="width: 100%"
                    />
                </el-col>
                <el-col :span="6">
                    <el-button type="primary" @click="getData" :loading="loading">查询</el-button>
                    <el-button @click="resetFilter">重置条件</el-button>
                </el-col>
            </el-row>
        </el-card>

        <el-card style="margin-top: 20px;">
            <div ref="chartRef" style="width: 100%; height: 500px;"></div>
        </el-card>
    </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { getLogStatistics } from "../../api/apiForLog/logApi.js";
import dayjs from "dayjs";

const timeRange = ref([
    dayjs('2024-01-15 10:00:00').format('YYYY-MM-DD HH:mm:ss'),
    dayjs('2024-01-16 10:00:00').format('YYYY-MM-DD HH:mm:ss')
])
const loading = ref(false)
const data = ref()
const chartRef = ref(null)
let chartInstance = null;

// 初始化图表
const initChart = () => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
}

// 获取数据
const getData = async () => {
    loading.value = true
    try {
        let startTime = "", endTime = ""
        if(timeRange.value) {
            startTime = timeRange.value[0]
            endTime = timeRange.value[1]
        }
        data.value = await getLogStatistics(startTime, endTime)
        drawChart()
    } finally {
        loading.value = false
    }
}

// 重置筛选条件
const resetFilter = () => {
    timeRange.value = []
}

// 绘制图表
const drawChart = () => {
    if(!data.value || !chartInstance) return

    const allItems = {
        "total-log": data.value.totalCount,
        ...data.value.typeCounts
    };

    const logTypes = Object.keys(allItems);
    const counts = logTypes.map(type => allItems[type]);

    const sortedIndices = counts
        .map((count, index) => ({ index, count }))
        .sort((a, b) => {
            // 总日志数始终排第一
            if (logTypes[a.index] === "total-log") return -1;
            if (logTypes[b.index] === "total-log") return 1;
            return b.count - a.count;
        })
        .map(item => item.index);

    const sortedLogTypes = sortedIndices.map(i => logTypes[i]);
    const sortedCounts = sortedIndices.map(i => counts[i]);

    const option = {
        title: {
            text: '各类型日志数量统计',
            left: 'center',
            textStyle: {
                fontSize: 16
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: params => {
                const data = params[0];
                return `${data.name.replace('-log', '')}: ${data.value.toLocaleString()} 条日志`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '日志数量',
            axisLabel: {
                formatter: function(value) {
                    if (value >= 1000) {
                        return (value / 1000) + 'k';
                    }
                    return value;
                }
            }
        },
        yAxis: {
            type: 'category',
            data: sortedLogTypes,
            axisLabel: {
                formatter: function(value) {
                    return value.replace('-log', '');
                }
            }
        },
        series: [{
            name: '日志数量',
            type: 'bar',
            data: sortedCounts,
            itemStyle: {
                color: function(params) {
                    // 总日志数使用特殊颜色
                    if (sortedLogTypes[params.dataIndex] === 'total-log') {
                        return '#c23531';
                    }
                    // 其他项使用渐变色
                    const colorList = [
                        '#2f4554', '#61a0a8', '#d48265', '#91c7ae',
                        '#749f83', '#ca8622', '#bda29a', '#6e7074',
                        '#546570', '#c4ccd3'
                    ];
                    return colorList[params.dataIndex % colorList.length];
                }
            },
            label: {
                show: true,
                position: 'right',
                formatter: function(params) {
                    return params.value.toLocaleString();
                }
            }
        }]
    };

    chartInstance.setOption(option);
}

// 生命周期钩子
onMounted(() => {
    initChart()
    window.addEventListener('resize', handleResize)
    getData()
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    if (chartInstance) {
        chartInstance.dispose()
    }
})

// 窗口大小变化处理
const handleResize = () => {
    chartInstance?.resize()
}
</script>

<style scoped>
.page-container {
    padding: 20px;
}

.el-card {
    margin-bottom: 20px;
}
</style>
