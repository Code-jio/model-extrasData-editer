<template>
  <div class="tree-node" :class="{ 'root-node': isRoot, 'child-node': !isRoot }">
    <!-- 节点行 -->
    <div 
      class="node-row"
      @click="emit('focusModel', model)"
      :class="{ 
        active: selectedModelId === model.id, 
        hidden: !model.visible
      }"
    >
      <!-- 展开/折叠图标 -->
      <span 
        class="expand-icon" 
        @click.stop="emit('toggleExpand', model.id)"
        :class="{ 'has-children': hasChildren }"
      >
        <span v-if="hasChildren" class="chevron" :class="{ expanded: isExpanded }">
          ›
        </span>
        <span v-else class="node-type-icon">
          <span v-if="model.nodeType === 'mesh'" class="icon-mesh">◆</span>
          <span v-else-if="model.nodeType === 'group'" class="icon-group">⊞</span>
          <span v-else class="icon-object">○</span>
        </span>
      </span>
      
      <!-- 节点名称 -->
      <span class="node-name">{{ model.name }}</span>
      
      <!-- 操作按钮 -->
      <div class="node-actions">
        <button 
          v-if="isRoot && model.visible"
          class="action-btn export-btn" 
          @click.stop="emit('exportModel', model.id)"
          title="导出模型"
        >
          ↓
        </button>
        <button 
          class="action-btn visibility-btn" 
          @click.stop="emit('toggleVisibility', model)"
          :title="getVisibilityTitle()"
        >
          <span v-if="model.visible" class="icon-visible">●</span>
          <span v-else class="icon-hidden">○</span>
        </button>
        <button 
          class="action-btn remove-btn" 
          @click.stop="emit('removeModel', model.id)"
          title="删除"
        >
          ×
        </button>
      </div>
    </div>
    
    <!-- 子节点容器 -->
    <div 
      v-if="hasChildren && isExpanded" 
      class="children-container"
    >
      <ModelTreeNode
        v-for="child in model.children" 
        :key="child.id"
        :model="child"
        :selected-model-id="selectedModelId"
        :expanded-nodes="expandedNodes"
        :is-root="false"
        @focus-model="emit('focusModel', $event)"
        @toggle-expand="emit('toggleExpand', $event)"
        @toggle-visibility="emit('toggleVisibility', $event)"
        @remove-model="emit('removeModel', $event)"
        @export-model="emit('exportModel', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModelInfo } from '@/types'

interface Props {
  model: ModelInfo
  selectedModelId?: string
  expandedNodes: Set<string>
  isRoot?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  focusModel: [model: ModelInfo]
  toggleExpand: [nodeId: string]
  toggleVisibility: [model: ModelInfo]
  removeModel: [modelId: string]
  exportModel: [modelId: string]
}>()

const hasChildren = computed(() => {
  return props.model.children && props.model.children.length > 0
})

const isExpanded = computed(() => {
  return props.expandedNodes.has(props.model.id)
})

const getNodeTypeIcon = (): string => {
  switch (props.model.nodeType) {
    case 'mesh': return '◆'
    case 'group': return '◉'
    case 'object': return '○'
    default: return '●'
  }
}

const getVisibilityIcon = (): string => {
  if (props.isRoot) {
    return props.model.visible ? '👁' : '👁‍🗨'
  } else {
    return props.model.visible ? '●' : '○'
  }
}

const getVisibilityTitle = (): string => {
  if (props.isRoot) {
    return props.model.visible ? '隐藏模型及子节点' : '显示模型及子节点'
  } else {
    return props.model.visible ? '隐藏节点' : '显示节点'
  }
}
</script>

<script lang="ts">
import { computed } from 'vue'

export default {
  name: 'ModelTreeNode' // 递归组件需要显式命名
}
</script>

<style scoped>
.tree-node {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tree-node:last-child {
  border-bottom: none;
}

.node-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  background: transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
  font-size: 12px;
  margin: 2px 0;
}

.node-row:hover {
  background: rgba(255, 255, 255, 0.08);
}

.node-row.active {
  background: rgba(64, 169, 255, 0.15);
  border-left: 3px solid #40a9ff;
  color: #40a9ff;
}

.node-row.hidden {
  opacity: 0.4;
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: #888;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.expand-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #40a9ff;
}

.chevron {
  font-weight: bold;
  transition: transform 0.2s ease;
  transform: rotate(0deg);
}

.chevron.expanded {
  transform: rotate(90deg);
}

.node-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  opacity: 0.6;
}

.icon-mesh {
  color: #52c41a;
}

.icon-group {
  color: #1890ff;
}

.icon-object {
  color: #faad14;
}

.child-node .node-row {
  padding-left: 32px;
  background: rgba(255, 255, 255, 0.02);
  margin-left: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
}

.child-node .child-node .node-row {
  padding-left: 48px;
  background: rgba(255, 255, 255, 0.01);
}

.child-node .child-node .child-node .node-row {
  padding-left: 64px;
}

.node-name {
  flex: 1;
  margin-right: 8px;
  font-size: 12px;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

.node-row.active .node-name {
  color: #40a9ff;
  font-weight: 500;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.node-row:hover .node-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 3px;
  font-size: 12px;
  transition: all 0.2s ease;
  color: #888;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.visibility-btn:hover {
  color: #52c41a;
}

.visibility-btn .icon-hidden {
  opacity: 0.5;
}

.export-btn {
  color: #1890ff;
  font-weight: bold;
  font-size: 14px;
}

.export-btn:hover {
  background: rgba(24, 144, 255, 0.2);
  color: #40a9ff;
}

.remove-btn {
  color: #ff4d4f;
  font-weight: bold;
  font-size: 16px;
}

.remove-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  color: #ff7875;
}

.children-container {
  overflow: visible;
}
</style> 