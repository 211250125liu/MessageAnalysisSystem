<template>
    <!-- 模板部分保持不变 -->
    <div class="top-ip-container">
        <el-card class="filter-card">
            <div class="filter-row">
                <el-date-picker
                    v-model="timeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    :value-format="'YYYY-MM-DD HH:mm:ss'"
                    @change="handleDateChange"
                />

                <el-select
                    v-model="ipType"
                    placeholder="选择IP类型"
                    style="margin-left: 20px; width: 120px"
                >
                    <el-option label="源IP" value="src" />
                    <el-option label="目的IP" value="dst" />
                </el-select>

                <el-input-number
                    v-model="topN"
                    :min="1"
                    :max="20"
                    label="显示数量"
                    style="margin-left: 20px; width: 120px"
                />

                <el-button
                    type="primary"
                    @click="fetchData"
                    :loading="loading"
                    style="margin-left: 20px"
                >
                    查询
                </el-button>
            </div>
        </el-card>

        <el-row :gutter="20" class="chart-row">
            <el-col :span="24">
                <el-card class="chart-card">
                    <div class="chart-container">
                        <div v-show="showChart" ref="chartRef" style="width: 100%; height: 100%"></div>
                        <el-empty v-show="!showChart" :description="rawData.length ? '暂无数据' : '请点击查询按钮获取数据'" />
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { getTopSourceIp, getTopDstIp } from "../../api/apiForLog/logApi.js";
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import * as echarts from "echarts";

// 时间范围选择
const timeRange = ref([
    dayjs('2024-01-15 10:00:00').format('YYYY-MM-DD HH:mm:ss'),
    dayjs('2024-01-16 10:00:00').format('YYYY-MM-DD HH:mm:ss')
]);

// 其他参数
const ipType = ref('src') // src或dst
const topN = ref(10)
const loading = ref(false)

const rawData = ref([]) // 明确指定数组类型
const showChart = ref(false)
const chartRef = ref(null)
let chartInstance = null;

// 处理日期变化
const handleDateChange = (val) => {
    if (!val || val.length !== 2) return
    timeRange.value = val
    showChart.value = false
}

// 准备图表数据
const prepareChartData = () => {
    if (!rawData.value || rawData.value.length === 0) {
        return {
            ips: [],
            messageCounts: [],
            totalPackets: []
        };
    }

    // 按messageCount排序
    const sortedData = [...rawData.value].sort((a, b) => b.messageCount - a.messageCount);

    return {
        ips: sortedData.map(item => item.ip),
        messageCounts: sortedData.map(item => item.messageCount),
        totalPackets: sortedData.map(item => item.totalPackets || 0)
    };
};

// 初始化图表
const initChart = () => {
    if (!chartRef.value) return;

    // 先销毁旧的图表实例
    if (chartInstance) {
        chartInstance.dispose();
    }

    chartInstance = echarts.init(chartRef.value);
    updateChart();
};

// 更新图表
const updateChart = () => {
    if (!chartInstance) return;

    const chartData = prepareChartData();

    const option = {
        toolbox: {
            feature: {
                saveAsImage: {
                    title: '保存图片', // 按钮文字
                    type: 'png',      // 可选 png/jpeg
                    pixelRatio: 2,     // 导出图片的分辨率倍数
                    backgroundColor: '#fff', // 背景色
                    excludeComponents: ['toolbox'], // 排除不导出的组件
                    name: 'chart_image' // 下载文件名（默认为图表标题）
                }
            }
        },
        title: {
            text: `IP流量统计 Top ${topN.value}`,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: (params) => {
                const messageData = params.find((p) => p.seriesName === '消息数');
                const packetData = params.find((p) => p.seriesName === '总包数');
                return `
                    IP: ${messageData.name}<br/>
                    消息数: ${messageData.value}<br/>
                    总包数: ${packetData?.value || 0}
                `;
            }
        },
        legend: {
            data: ['消息数', '总包数'],
            top: 30
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        yAxis: [
            {
                type: 'category',
                data: chartData.ips,
                axisLabel: {
                    interval: 0,
                    rotate: 30
                }
            }
        ],
        xAxis: [
            {
                type: 'value',
                name: '消息数',
                position: 'bottom',
                axisLine: {
                    lineStyle: {
                        color: '#5470C6'
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: '总包数',
                position: 'top',
                axisLine: {
                    lineStyle: {
                        color: '#91CC75'
                    }
                },
                axisLabel: {
                    formatter: '{value}'
                },
                splitLine: {
                    show: false
                }
            }
        ],
        series: [
            {
                name: '消息数',
                type: 'bar',
                data: chartData.messageCounts,
                itemStyle: {
                    color: '#5470C6'
                },
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{c}'
                },
                xAxisIndex: 0 // 使用第一个x轴
            },
            {
                name: '总包数',
                type: 'bar',
                data: chartData.totalPackets,
                itemStyle: {
                    color: '#91CC75'
                },
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{c}'
                },
                xAxisIndex: 1 // 使用第二个x轴
            }
        ]
    };

    chartInstance.setOption(option);
    chartInstance.resize();
};

// 获取数据
const fetchData = async () => {
    if (!timeRange.value || timeRange.value.length !== 2) {
        ElMessage.warning('请选择时间范围')
        return
    }

    try {
        loading.value = true
        showChart.value = false

        const [start, end] = timeRange.value

        // 清空旧数据
        rawData.value = [];

        // 获取新数据
        const response = ipType.value === 'src'
            ? await getTopSourceIp(start, end, topN.value)
            : await getTopDstIp(start, end, topN.value);

        // 确保数据是数组格式
        rawData.value = Array.isArray(response) ? response : [];

        if (rawData.value.length === 0) {
            ElMessage.warning('没有查询到数据')
            return
        }

        // 等待DOM更新
        await nextTick();

        showChart.value = true
        initChart(); // 重新初始化图表

    } catch (error) {
        ElMessage.error('获取数据失败')
        console.error('获取数据失败:', error)
    } finally {
        loading.value = false
    }
}

// 监听窗口大小变化
const handleResize = () => {
    chartInstance?.resize()
}

// 生命周期钩子
onMounted(() => {
    window.addEventListener('resize', handleResize)
    fetchData()
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    chartInstance?.dispose()
})

// 添加调试信息
watch(rawData, (newVal) => {
    console.log('rawData变化:', newVal);
    if (showChart.value && newVal.length > 0) {
        updateChart();
    }
}, { deep: true });

watch(showChart, (newVal) => {
    console.log('showChart变化:', newVal);
    if (newVal) {
        nextTick(() => {
            initChart();
        });
    }
});
</script>

<style scoped>
/* 样式部分保持不变 */
.top-ip-container {
    padding: 20px;
}

.filter-card {
    margin-bottom: 20px;
}

.filter-row {
    display: flex;
    align-items: center;
}

.chart-row {
    margin-top: 20px;
}

.chart-card {
    height: 100%;
}

.chart-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    text-align: center;
}

.chart-container {
    height: 500px;
}
</style>
