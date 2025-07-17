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
        <span v-if="hasChildren">
          {{ isExpanded ? '▼' : '▶' }}
        </span>
        <span v-else class="no-children">{{ getNodeTypeIcon() }}</span>
      </span>
      
      <!-- 节点名称 -->
      <span class="node-name">{{ model.name }}</span>
      
      <!-- 操作按钮 -->
      <div class="node-actions">
        <button 
          class="visibility-btn" 
          @click.stop="emit('toggleVisibility', model)"
          :title="getVisibilityTitle()"
        >
          {{ getVisibilityIcon() }}
        </button>
        <button 
          class="remove-btn" 
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
  border-bottom: 1px solid #333;
}

.tree-node:last-child {
  border-bottom: none;
}

.node-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  background: #2a2a2a;
  border-radius: 4px;
  transition: background-color 0.2s;
  position: relative;
}

.node-row:hover {
  background: #3a3a3a;
}

.node-row.active {
  background: #4a4a4a;
  border-left: 3px solid #007acc;
}

.node-row.hidden {
  opacity: 0.5;
}

.expand-icon {
  display: inline-block;
  width: 20px;
  text-align: center;
  margin-right: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  color: #007acc;
  font-weight: bold;
}

.expand-icon.has-children:hover {
  transform: scale(1.2);
  color: #40a9ff;
}

.expand-icon .no-children {
  font-size: 10px;
  opacity: 0.6;
  color: #888;
}

.child-node .node-row {
  padding-left: 32px;
  background: #252525;
}

.child-node .child-node .node-row {
  padding-left: 52px;
  background: #202020;
}

.child-node .child-node .child-node .node-row {
  padding-left: 72px;
  background: #1a1a1a;
}

.node-name {
  flex: 1;
  margin-right: 8px;
  font-size: 14px;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.node-row:hover .node-actions {
  opacity: 1;
}

.visibility-btn,
.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.visibility-btn:hover {
  background: #4a4a4a;
}

.remove-btn {
  color: #ff6b6b;
  font-weight: bold;
}

.remove-btn:hover {
  background: #ff6b6b;
  color: white;
}

.children-container {
  border-left: 1px solid #333;
  margin-left: 10px;
  overflow: visible;
}

.root-node > .children-container {
  border-left: 2px solid #555;
  margin-left: 15px;
}
</style> 