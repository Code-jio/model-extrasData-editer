<template>
  <div class="selected-info" v-if="selectedObjectInfo">
    <div class="info-header">
      <span class="info-icon">🎯</span>
      <span class="info-title">选中对象</span>
    </div>
    <div class="info-content">
      <div class="object-name">{{ selectedObjectInfo.name }}</div>
      <div class="object-type">{{ selectedObjectInfo.type }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedObjectInfo: { name: string, type: string, modelId?: string } | null
}>()
</script>

<style scoped>
.selected-info {
  background: linear-gradient(135deg, #333 0%, #404040 100%);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 122, 204, 0.3);
  box-shadow: 0 2px 4px rgba(0, 122, 204, 0.2);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.info-icon {
  font-size: 16px;
  margin-right: 6px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.info-title {
  font-size: 13px;
  font-weight: bold;
  color: #007acc;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.info-content {
  font-size: 11px;
  color: #ccc;
  background: rgba(0, 0, 0, 0.2);
  padding: 6px;
  border-radius: 3px;
  border-left: 3px solid #007acc;
}

.object-name {
  font-weight: bold;
  color: #007acc;
  font-size: 13px;
  margin-bottom: 2px;
}

.object-type {
  font-style: italic;
  color: #888;
  font-size: 10px;
}
</style> 