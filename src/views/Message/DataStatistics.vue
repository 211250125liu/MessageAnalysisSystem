<template>
    <div class="stats-container">
        <el-card class="filter-card">
            <div class="filter-row">
                <el-date-picker
                    v-model="timeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    :value-format="'YYYY-MM-DD HH:mm:ss'"
                    :disabled-date="disabledDate"
                    @change="handleDateChange"
                />
                <el-button
                    type="primary"
                    @click="getData"
                    :loading="loading"
                    style="margin-left: 20px"
                >
                    查询
                </el-button>
            </div>
        </el-card>

        <el-row :gutter="20" class="chart-row">
            <el-col :span="8">
                <el-card class="chart-card">
                    <div class="chart-title">每小时消息数量变化</div>
                    <div class="chart-container">
                        <line-chart
                            v-if="showChart && messageChartData.length > 0"
                            :chart-data="messageChartData"
                        />
                        <el-empty v-else :description="showChart ? '暂无数据' : '请点击查询按钮获取数据'" />
                    </div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card class="chart-card">
                    <div class="chart-title">网络流量变化 (字节)</div>
                    <div class="chart-container">
                        <area-chart
                            v-if="showChart && trafficChartData.length > 0"
                            :chart-data="trafficChartData"
                        />
                        <el-empty v-else :description="showChart ? '暂无数据' : '请点击查询按钮获取数据'" />
                    </div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card class="chart-card">
                    <div class="chart-title">异常数量变化</div>
                    <div class="chart-container">
                        <anomaly-chart
                            v-if="showChart && anomalyChartData.length > 0"
                            :chart-data="anomalyChartData"
                        />
                        <el-empty v-else :description="showChart ? '暂无数据' : '请点击查询按钮获取数据'" />
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {getStatsHourly} from "../../api/apiForMessage/DataStatisticsApi.ts";
import AreaChart from '../../components/chart/AreaChart.vue'
import LineChart from '../../components/chart/LineChart.vue'
import AnomalyChart from '../../components/chart/AnomalyChart.vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

// 时间范围选择
const timeRange = ref<[string,string]>([
    dayjs('2024-01-15 00:00:00').format('YYYY-MM-DD HH:mm:ss'),
    dayjs('2024-01-15 24:00:00').format('YYYY-MM-DD HH:mm:ss')
]);

// 图表数据
const rawData = ref([])
const loading = ref(false)
const showChart = ref(false) // 新增：控制是否显示图表

// 禁用日期规则（最大选择1天）
const disabledDate = (time: Date) => {
    // 1. 限制只能选择 2024-01-15
    const startDate = new Date(2024, 0, 15); // 2024-01-15 00:00:00
    const endDate = new Date(2024, 0, 16);   // 2024-01-16 00:00:00（不包含）

    // 如果不在 2024-01-15 范围内，直接禁用
    if (time.getTime() < startDate.getTime() || time.getTime() >= endDate.getTime()) {
        return true;
    }

    // 2. 如果已选择开始时间，限制最大范围不超过 24 小时
    if (timeRange.value && timeRange.value[0]) {
        const startTime = new Date(timeRange.value[0]).getTime();
        const maxRange = 24 * 60 * 60 * 1000; // 24 小时
        return time.getTime() > startTime + maxRange;
    }

    return false;
};

// 处理日期变化
const handleDateChange = (val: any[]) => {
    if (!val || val.length !== 2) return

    const start = new Date(val[0]).getTime()
    const end = new Date(val[1]).getTime()
    const minRange = 2 * 60 * 60 * 1000 // 最小2小时
    const maxRange = 24 * 60 * 60 * 1000 // 最大24小时

    if (end - start < minRange) {
        ElMessage.warning('时间范围不能小于2小时')
        timeRange.value = [
            dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
            dayjs(start + minRange).format('YYYY-MM-DD HH:mm:ss')
        ]
    } else if (end - start > maxRange) {
        ElMessage.warning('时间范围不能超过24小时')
        timeRange.value = [
            dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
            dayjs(start + maxRange).format('YYYY-MM-DD HH:mm:ss')
        ]
    }
    // 移除自动获取数据的逻辑
}

// 获取数据
const getData = async () => {
    if (!timeRange.value || timeRange.value.length !== 2) {
        ElMessage.warning('请选择时间范围')
        return
    }

    try {
        loading.value = true
        showChart.value = false // 查询时先隐藏图表
        const res = await getStatsHourly(timeRange.value[0], timeRange.value[1])
        console.log(res)
        rawData.value = (res || []) as any
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
    return fillMissingHours(rawData.value, timeRange.value, 'messageCount', 'count');
})

// 处理流量图表数据
const trafficChartData = computed(() => {
    return fillMissingHours(rawData.value, timeRange.value, 'totalBytes', 'traffic');
})

const anomalyChartData = computed(() => {
    return fillMissingHours(rawData.value, timeRange.value, 'anomalyCount', 'anomaly');
})

interface HourDataItem {
    hourTime: string | Date;  // 原始数据中的时间字段
    [key: string]: any;      // 其他动态字段
}

interface FilledHourData {
    time: string;           // 格式化后的小时时间 "00:00" 格式
    [fieldName: string]: any; // 动态字段名对应的值
}

/**
 * 补齐缺失小时数据的通用函数
 * @param rawData 原始数据数组
 * @param timeRange 时间范围 [开始时间, 结束时间]
 * @param valueKey 原始数据中取值的关键字段
 * @param fieldName 结果中显示的字段名
 * @returns 补齐后的小时数据数组
 */
function fillMissingHours(
    rawData: HourDataItem[],
    timeRange: [Date | string, Date | string],
    valueKey: string,
    fieldName: string
): FilledHourData[] {
    // 解析时间范围
    const start = new Date(timeRange[0]);
    const end = new Date(timeRange[1]);

    // 计算总小时数（最大24小时）
    const totalHours = Math.min(24, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));

    // 创建按小时分组的数据映射
    const dataMap: Record<number, FilledHourData> = {};
    rawData.forEach(item => {
        const hourTime = new Date(item.hourTime);
        // 只处理时间范围内的数据
        if (hourTime >= start && hourTime <= end) {
            const hour = hourTime.getHours();
            dataMap[hour] = {
                time: `${hour.toString().padStart(2, '0')}:00`,
                [fieldName]: item[valueKey] || 0  // 确保异常数量为0时也能显示
            };
        }
    });

    // 生成完整的小时序列
    const result: FilledHourData[] = [];
    const current = new Date(start);

    for (let i = 0; i < totalHours; i++) {
        const hour = current.getHours();
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;

        result.push(dataMap[hour] || {
            time: hourStr,
            [fieldName]: 0
        });

        // 移动到下一小时
        current.setHours(current.getHours() + 1);
    }

    return result;
}
</script>

<style scoped>
.stats-container {
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
.chart-row {
    margin-top: 20px;
    flex-wrap: wrap;
}

.chart-card {
    height: 100%;
    margin-bottom: 20px;
}
</style>
