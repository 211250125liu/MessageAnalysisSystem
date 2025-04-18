<template>
    <el-drawer
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :title="title"
        direction="rtl"
        size="50%"
    >
        <div v-if="itemData" class="drawer-content">
            <!-- 原始数据展示 -->
            <el-card v-if="hasRawData" class="raw-data-card">
                <template #header>
                    <div class="card-header">
                        <span>原始数据 (rawData)</span>
                    </div>
                </template>
                <pre>{{ itemData.rawData }}</pre>
            </el-card>

            <!-- 消息详情展示 -->
            <el-card class="message-detail-card">
                <template #header>
                    <div class="card-header">
                        <span>消息详情 (messageDetail)</span>
                    </div>
                </template>
                <pre v-if="itemData">
                    {{ JSON.stringify(hasRawData ? itemData.messageDetail : itemData, null, 2) }}
                </pre>
            </el-card>
        </div>
        <div v-else class="empty-state">
            <el-empty description="数据加载中..." />
        </div>
    </el-drawer>
</template>

<script setup>
import {computed} from "vue";

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    itemData: {
        type: Object,
        default: null
    },
    hasRawData: {
        type: Boolean,
        default: false
    }
});

const title = computed(() => {
    return props.hasRawData ? '报文详情' : '日志详情';
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.drawer-content {
    padding: 20px;
    height: calc(100% - 40px);
    overflow-y: auto;
}

.raw-data-card,
.message-detail-card {
    margin-bottom: 20px;
}

pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    background: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
}

.card-header {
    font-weight: bold;
    font-size: 16px;
}

.empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
