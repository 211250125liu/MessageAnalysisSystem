<template>
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
                        <el-col :span="12">
                                <el-card class="chart-card">
                                        <div class="chart-title">消息数量 Top {{ topN }}</div>
                                        <div class="chart-container">
                                                <bar-chart
                                                    v-if="showChart && messageChartData.length > 0"
                                                    :chart-data="messageChartData"
                                                    :x-key="ipType === 'src' ? 'srcIp' : 'dstIp'"
                                                    y-key="messageCount"
                                                />
                                                <el-empty v-else :description="showChart ? '暂无数据' : '请点击查询按钮获取数据'" />
                                        </div>
                                </el-card>
                        </el-col>
                        <el-col :span="12">
                                <el-card class="chart-card">
                                        <div class="chart-title">流量大小 Top {{ topN }} (字节)</div>
                                        <div class="chart-container">
                                                <bar-chart
                                                    v-if="showChart && trafficChartData.length > 0"
                                                    :chart-data="trafficChartData"
                                                    :x-key="ipType === 'src' ? 'srcIp' : 'dstIp'"
                                                    y-key="totalBytes"
                                                />
                                                <el-empty v-else :description="showChart ? '暂无数据' : '请点击查询按钮获取数据'" />
                                        </div>
                                </el-card>
                        </el-col>
                </el-row>
        </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getTopSrcIp, getTopDstIp } from '../../api/apiForMessage/FlowAnalysisApi.ts'
import BarChart from '../../components/chart/BarChart.vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

// 时间范围选择
const timeRange = ref([
        dayjs('2024-01-15 10:00:00').format('YYYY-MM-DD HH:mm:ss'),
        dayjs('2024-01-16 10:00:00').format('YYYY-MM-DD HH:mm:ss')
]);

// 其他参数
const ipType = ref('src') // src或dst
const topN = ref(5)
const loading = ref(false)
const rawData = ref([])
const showChart = ref(false) // 新增：控制图表显示状态

// 处理日期变化
const handleDateChange = (val: string[]) => {
        if (!val || val.length !== 2) return
        timeRange.value = val
        showChart.value = false // 时间变化时隐藏图表
}

// 获取数据
const fetchData = async () => {
        if (!timeRange.value || timeRange.value.length !== 2) {
                ElMessage.warning('请选择时间范围')
                return
        }

        try {
                loading.value = true
                showChart.value = false // 查询开始时隐藏图表

                const [start, end] = timeRange.value

                if (ipType.value === 'src') {
                        rawData.value = await getTopSrcIp(start, end, topN.value)
                } else {
                        rawData.value = await getTopDstIp(start, end, topN.value)
                }

                if (!rawData.value || rawData.value.length === 0) {
                        ElMessage.warning('没有查询到数据')
                }

                showChart.value = true // 数据获取成功后显示图表
        } catch (error) {
                ElMessage.error('获取数据失败')
                console.error(error)
                showChart.value = false
        } finally {
                loading.value = false
        }
}

// 处理消息数量图表数据
const messageChartData = computed(() => {
        return [...rawData.value]
            .sort((a, b) => b.messageCount - a.messageCount)
            .slice(0, topN.value)
})

// 处理流量图表数据
const trafficChartData = computed(() => {
        return [...rawData.value]
            .sort((a, b) => b.totalBytes - a.totalBytes)
            .slice(0, topN.value)
})
</script>

<style scoped>
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
        height: 400px;
}
</style>
