<template>
    <div class="log-statistics-container">
        <div class="filter-container">
            <el-form :inline="true" :model="filterForm" class="demo-form-inline">
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
                <el-form-item label="显示数量">
                    <el-input-number
                        v-model="filterForm.topN"
                        :min="1"
                        :max="20"
                        controls-position="right"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchData" :loading="loading">查询</el-button>
                </el-form-item>
            </el-form>
        </div>

        <div ref="chartRef" class="chart-container"></div>

    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { getTopLogs } from '../../api/apiForOriginLog/originLogApi.js';

const loading = ref(false)
const filterForm = ref({
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-02T00:00:00.000Z',
    topN: 3
});

const chartRef = ref(null);
let chartInstance = null;

// 窗口大小改变时的处理函数
const resizeHandler = () => {
    if (chartInstance) {
        chartInstance.resize();
    }
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

    const option = {
        title: {
            text: `Top ${filterForm.value.topN} Logs Statistics`,
            subtext: `${filterForm.value.startTime} 至 ${filterForm.value.endTime}`,
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: data.map(item => item.logType)
        },
        series: [
            {
                name: 'Log Count',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.map(item => ({
                    value: item.count,
                    name: item.logType
                }))
            }
        ]
    };

    chartInstance.setOption(option);

    // 添加窗口大小改变事件监听
    window.addEventListener('resize', resizeHandler);
};

// 获取数据并更新图表
const fetchData = async () => {
    try {
        loading.value = true
        const { startTime, endTime, topN } = filterForm.value;
        const response = await getTopLogs(startTime, endTime, topN);
        initChart(response);
    } catch (error) {
        console.error('Error fetching top logs:', error);
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
