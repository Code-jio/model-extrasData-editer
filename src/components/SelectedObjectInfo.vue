<template>
  <div class="object-info" v-if="selectedObjectInfo">
    <div class="section-header">
      <h4>选中对象</h4>
    </div>

    <div class="info-content">
      <div class="info-item">
        <span class="info-label">名称</span>
        <span class="info-value">{{ selectedObjectInfo.name }}</span>
      </div>

      <div class="info-item">
        <span class="info-label">类型</span>
        <span class="info-value">{{ selectedObjectInfo.type }}</span>
      </div>

      <!-- 用户数据编辑区域 -->
      <div class="user-data-section" v-if="selectedObjectInfo.modelId">
        <div class="section-divider"></div>
        <UserDataEditor :model-id="selectedObjectInfo.modelId" :user-data="currentUserData"
          @save="handleUserDataSave" />
      </div>
    </div>
  </div>

  <div class="object-info no-selection" v-else>
    <div class="section-header">
      <h4>选中对象</h4>
    </div>
    <div class="empty-message">
      点击场景中的对象或模型列表来选择
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'

import UserDataEditor from '@/components/UserDataEditor.vue'

interface SelectedObjectInfo {
  name: string
  type: string
  modelId?: string
}

const props = defineProps<{
  selectedObjectInfo: SelectedObjectInfo | null
  currentUserData: Record<string, any>
}>()

const emit = defineEmits<{
  saveUserData: [modelId: string, userData: Record<string, any>]
}>()

const currentUserData = computed(() => {
  console.log('SelectedObjectInfo收到userData:', props.currentUserData)
  return props.currentUserData || {}
})

const handleUserDataSave = (modelId: string, userData: Record<string, any>) => {
  emit('saveUserData', modelId, userData)
}
</script>

<style scoped>
.object-info {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
}

.section-header {
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header h4 {
  margin: 0;
  font-size: 13px;
  color: #40a9ff;
  font-weight: 600;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.info-label {
  font-size: 11px;
  color: #888;
  min-width: 40px;
}

.info-value {
  font-size: 11px;
  color: #e0e0e0;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  max-width: 180px;
}

.user-data-section {
  margin-top: 12px;
}

.section-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
}

.no-selection .empty-message {
  text-align: center;
  color: #666;
  font-style: italic;
  font-size: 11px;
  padding: 12px 0;
}
</style>