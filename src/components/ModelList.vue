<template>
  <div class="model-list">
    <h3>已加载模型 ({{ rootModelsCount }})</h3>
    <div class="visibility-info">
      可见: {{ visibleModelsCount }} / {{ allModelsCount }}
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
      />
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
}>()
</script>

<style scoped>
.model-list {
  position: absolute;
  top: 50px;
  left: 20px;
  width: 380px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 8px;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-height: 500px;
  overflow-y: auto;
}

.model-list h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.visibility-info {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 10px;
}

.model-tree {
  max-height: none;
  overflow: visible;
  border: 1px solid #333;
  border-radius: 4px;
  background: #2a2a2a;
}
</style> 