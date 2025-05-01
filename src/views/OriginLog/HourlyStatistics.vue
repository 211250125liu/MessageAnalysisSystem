<template>
    <div class="log-statistics-container">
        <div class="filter-container">
            <el-form :inline="true" :model="filterForm" class="demo-form-inline">
                <el-form-item label="日志类型">
                    <el-select v-model="filterForm.logType" placeholder="请选择日志类型" style="width: 8rem">
                        <el-option label="fields" value="fields" />
                        <el-option label="eventData" value="eventData" />
                        <el-option label="flowStart" value="flowStart" />
                        <el-option label="filePath" value="filePath" />
                        <el-option label="id" value="id" />
                        <el-option label="productFamily" value="productFamily" />
                        <el-option label="rcode" value="rcode" />
                    </el-select>
                </el-form-item>
                <el-form-item label="开始时间">
                    <el-date-picker
                            v-model="filterForm.startTime"
                            type="datetime"
                            placeholder="选择开始时间"
                            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                    />
                </el-form-item>
                <el-form-item label="结束时间">
                    <el-date-picker
                            v-model="filterForm.endTime"
                            type="datetime"
                            placeholder="选择结束时间"
                            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchData" :loading="loading">查询</el-button>
                </el-form-item>
            </el-form>
        </div>

        <div ref="chartRef" class="chart-container" ></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { getStatistics } from '../../api/apiForOriginLog/originLogApi.js'; // 请根据你的实际路径调整
import dayjs from 'dayjs'; // 推荐使用dayjs处理日期

const filterForm = ref({
    logType: 'fields',
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-02T00:00:00.000Z'
});

const chartRef = ref(null);
let chartInstance = null;

// 窗口大小改变时的处理函数
const resizeHandler = () => {
    if (chartInstance) {
        chartInstance.resize();
    }
};

// 格式化小时数据为更简洁的显示
const formatHour = (hourStr) => {
    return dayjs(hourStr).format('MM-DD HH:mm');
};

// 初始化图表
const initChart = (data) => {
    if (!chartRef.value) return;

    // 如果图表实例已存在，先销毁
    if (chartInstance) {
        chartInstance.dispose();
        window.removeEventListener('resize', resizeHandler);
    }

    chartInstance = echarts.init(chartRef.value);

    // 准备图表数据
    const hours = data.map(item => formatHour(item.hour));
    const counts = data.map(item => item.count);

    const option = {
        title: {
            text: `${filterForm.value.logType} 日志统计`,
            subtext: `${filterForm.value.startTime} 至 ${filterForm.value.endTime}`,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const date = params[0].axisValue;
                const count = params[0].data;
                return `${date}<br/>数量: ${count}`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: hours,
            axisLabel: {
                rotate: 45,
                formatter: (value) => {
                    // 如果数据点多，可以间隔显示
                    return value;
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '日志数量'
        },
        series: [
            {
                name: '日志数量',
                type: 'line',
                data: counts,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#409EFF'
                },
                lineStyle: {
                    width: 3
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                        { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
                    ])
                }
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            },
            {
                start: 0,
                end: 100
            }
        ]
    };

    chartInstance.setOption(option);

    // 添加窗口大小改变事件监听
    window.addEventListener('resize', resizeHandler);
};

const loading = ref(false)
// 获取数据并更新图表
const fetchData = async () => {
    try {
        loading.value = true
        const { startTime, endTime, logType } = filterForm.value;
        const response = await getStatistics(startTime, endTime, logType);
        console.log(response)
        initChart(response);
    } catch (error) {
        console.error('Error fetching log statistics:', error);
        // 这里可以添加错误提示，例如使用Element Plus的ElMessage
        // ElMessage.error('获取日志数据失败');
    } finally {
        loading.value = false
    }
};

// 组件挂载时获取数据
onMounted(() => {
    fetchData();
});

// 组件卸载时清理
onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
    window.removeEventListener('resize', resizeHandler);
});
</script>

<style scoped>
.log-statistics-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.filter-container {
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-container {
    flex: 1;
    width: 100%;
    min-height: 400px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 10px;
}
</style>
