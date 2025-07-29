<template>
  <div class="model-list">
    <div class="list-header">
      <h3>模型列表</h3>
      <div class="header-actions">
        <button 
          v-if="visibleModelsCount > 0"
          class="batch-export-btn"
          @click="emit('batchExport')"
          title="批量导出所有可见模型"
        >
          ↓ 全部导出
        </button>
        <div class="model-stats">
          <span class="stat-item">
            <span class="stat-label">总数:</span>
            <span class="stat-value">{{ rootModelsCount }}</span>
          </span>
          <span class="stat-item">
            <span class="stat-label">可见:</span>
            <span class="stat-value">{{ visibleModelsCount }}/{{ allModelsCount }}</span>
          </span>
        </div>
      </div>
    </div>
    
    <!-- 树形结构 -->
    <div class="model-tree">
      <ModelTreeNode
        v-for="model in rootModels" 
        :key="model.id"
        :model="model"
        :selected-model-id="selectedModelId"
        :expanded-nodes="expandedNodes"
        :is-root="true"
        @focus-model="emit('focusModel', $event)"
        @toggle-expand="emit('toggleExpand', $event)"
        @toggle-visibility="emit('toggleVisibility', $event)"
        @remove-model="emit('removeModel', $event)"
        @export-model="emit('exportModel', $event)"
      />
      
      <div v-if="rootModels.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />
          </svg>
        </div>
        <div class="empty-text">暂无模型</div>
        <div class="empty-hint">拖拽文件到此处加载模型</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModelInfo } from '@/types'
import ModelTreeNode from './ModelTreeNode.vue'

defineProps<{
  rootModels: ModelInfo[]
  rootModelsCount: number
  visibleModelsCount: number
  allModelsCount: number
  selectedModelId?: string
  expandedNodes: Set<string>
}>()

const emit = defineEmits<{
  focusModel: [model: ModelInfo]
  toggleExpand: [nodeId: string]
  toggleVisibility: [model: ModelInfo]
  removeModel: [modelId: string]
  exportModel: [modelId: string]
  batchExport: []
}>()
</script>

<style scoped>
.model-list {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 280px;
  max-width: calc(50vw - 24px);
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 6px;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-height: 420px;
  overflow: hidden;
  font-size: 11px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.list-header h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.batch-export-btn {
  background-color: #1890ff;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
  white-space: nowrap;
}

.batch-export-btn:hover {
  background-color: #40a9ff;
}

.batch-export-btn:active {
  background-color: #096dd9;
}

.batch-export-btn:focus {
  outline: none;
}

.model-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #888;
}

.stat-value {
  font-size: 12px;
  color: #40a9ff;
  font-weight: 500;
}

.model-tree {
  max-height: 350px;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  color: #888;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-text {
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 11px;
  color: #666;
}

/* 滚动条样式 */
.model-tree::-webkit-scrollbar {
  width: 6px;
}

.model-tree::-webkit-scrollbar-track {
  background: transparent;
}

.model-tree::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.model-tree::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .model-list {
    width: 260px;
    max-width: calc(45vw - 16px);
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .model-list {
    width: 240px;
    max-width: calc(100vw - 16px);
    left: 8px;
    top: 8px;
  }
}

@media (max-width: 480px) {
  .model-list {
    position: relative;
    width: calc(100vw - 16px);
    max-width: none;
    left: 8px;
    top: 8px;
    margin-bottom: 8px;
  }
}
</style> 