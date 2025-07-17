<template>
  <div id="app">
    <!-- Three.js 场景容器 -->
    <div ref="sceneContainer" id="scene-container"></div>

    <!-- 拖拽区域 -->
    <div 
      v-show="!hasModels"
      :class="['drop-zone', { 'drag-over': isDragOver }]"
      @drop="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave="handleDragLeave"
    >
      <div class="drop-content">
        <h2>拖拽3D模型文件到这里</h2>
        <p>支持格式: .gltf, .glb, .obj, .fbx</p>
        <p>支持draco压缩模型</p>
        <input 
          ref="fileInput"
          type="file" 
          multiple 
          accept="*"
          style="display: none;"
          @change="handleFileSelect"
        >
        <button class="browse-btn" @click="triggerFileSelect">浏览文件</button>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="controls">
      <div class="control-group">
        <button @click="resetCamera">重置相机</button>
        <button @click="clearScene">清空场景</button>
      </div>
      <div class="control-group">
        <button @click="showDropZone" v-if="hasModels">添加更多模型</button>
        <button @click="showAllModels" v-if="hasModels">显示所有模型</button>
        <button @click="hideAllModels" v-if="hasModels">隐藏所有模型</button>
      </div>
    </div>

    <!-- 模型列表 -->
    <div class="model-list">
      <h3>已加载模型 ({{ rootModelsCount }})</h3>
      <div class="visibility-info">
        可见: {{ visibleModelsCount }} / {{ allModelsCount }}
      </div>
      
      <!-- 树形结构 -->
      <div class="model-tree">
        <!-- 递归模板：根节点 -->
        <template v-for="model in rootModels" :key="model.id">
          <div class="tree-node root-node">
            <!-- 根节点行 -->
            <div 
              class="node-row"
              @click="focusOnModel(model)"
              :class="{ 
                active: selectedModel?.id === model.id, 
                hidden: !model.visible
              }"
            >
              <!-- 展开/折叠图标 -->
              <span 
                class="expand-icon" 
                @click.stop="toggleNodeExpand(model.id)"
                :class="{ 'has-children': hasChildren(model) }"
              >
                <span v-if="hasChildren(model)">
                  {{ isNodeExpanded(model.id) ? '▼' : '▶' }}
                </span>
                <span v-else class="no-children">●</span>
              </span>
              
              <!-- 节点名称 -->
              <span class="node-name">{{ model.name }}</span>
              
              <!-- 操作按钮 -->
              <div class="node-actions">
                <button 
                  class="visibility-btn" 
                  @click.stop="toggleModelVisibility(model)"
                  :title="model.visible ? '隐藏模型及子节点' : '显示模型及子节点'"
                >
                  {{ model.visible ? '👁' : '👁‍🗨' }}
                </button>
                <button class="remove-btn" @click.stop="removeModel(model.id)">×</button>
              </div>
            </div>
            
            <!-- 子节点容器 -->
            <div 
              v-if="hasChildren(model) && isNodeExpanded(model.id)" 
              class="children-container"
            >
              <template v-for="child in model.children" :key="child.id">
                <div class="tree-node child-node">
                  <!-- 子节点行 -->
                  <div 
                    class="node-row"
                    @click="focusOnModel(child)"
                    :class="{ 
                      active: selectedModel?.id === child.id, 
                      hidden: !child.visible
                    }"
                  >
                    <!-- 展开图标 -->
                    <span 
                      class="expand-icon" 
                      @click.stop="toggleNodeExpand(child.id)"
                      :class="{ 'has-children': hasChildren(child) }"
                    >
                      <span v-if="hasChildren(child)">
                        {{ isNodeExpanded(child.id) ? '▼' : '▶' }}
                      </span>
                      <span v-else class="no-children">{{ getNodeTypeIcon(child.nodeType) }}</span>
                    </span>
                    
                    <!-- 节点名称 -->
                    <span class="node-name">{{ child.name }}</span>
                    
                    <!-- 操作按钮 -->
                    <div class="node-actions">
                      <button 
                        class="node-visibility-btn" 
                        @click.stop="toggleNodeVisibility(child)"
                        :title="child.visible ? '隐藏节点' : '显示节点'"
                      >
                        {{ child.visible ? '●' : '○' }}
                      </button>
                      <button class="remove-btn" @click.stop="removeModel(child.id)">×</button>
                    </div>
                  </div>
                  
                  <!-- 更深层的子节点 - 简化版，只显示两层 -->
                  <div 
                    v-if="hasChildren(child) && isNodeExpanded(child.id)" 
                    class="children-container"
                  >
                    <div 
                      v-for="grandChild in child.children" 
                      :key="grandChild.id"
                      class="tree-node child-node"
                    >
                      <div 
                        class="node-row"
                        @click="focusOnModel(grandChild)"
                        :class="{ 
                          active: selectedModel?.id === grandChild.id, 
                          hidden: !grandChild.visible
                        }"
                      >
                        <span class="expand-icon">
                          <span class="no-children">{{ getNodeTypeIcon(grandChild.nodeType) }}</span>
                        </span>
                        <span class="node-name">{{ grandChild.name }}</span>
                        <div class="node-actions">
                          <button 
                            class="node-visibility-btn" 
                            @click.stop="toggleNodeVisibility(grandChild)"
                            :title="grandChild.visible ? '隐藏节点' : '显示节点'"
                          >
                            {{ grandChild.visible ? '●' : '○' }}
                          </button>
                          <button class="remove-btn" @click.stop="removeModel(grandChild.id)">×</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 状态信息 -->
    <div class="status">{{ status }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { ThreeScene } from './composables/useThreeScene'
import type { ModelInfo } from './types'

// 响应式数据
const sceneContainer = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
// 移除本地 models 数组，完全依赖于 threeScene 的数据
const selectedModel = ref<ModelInfo | null>(null)
const status = ref('准备就绪')
// 添加响应式触发器来强制更新计算属性
const modelUpdateTrigger = ref(0)
// 添加展开节点的状态管理
const expandedNodes = ref<Set<string>>(new Set())

// 计算属性
const hasModels = computed(() => {
  // 依赖触发器来确保响应式更新
  modelUpdateTrigger.value
  return rootModels.value.length > 0
})
const visibleModelsCount = computed(() => {
  modelUpdateTrigger.value
  return allModelsFlattened.value.filter(m => m.visible).length
})
const allModelsFlattened = computed(() => {
  modelUpdateTrigger.value
  if (!threeScene) return []
  return threeScene.getAllModelsFlattened()
})
const rootModels = computed(() => {
  modelUpdateTrigger.value
  if (!threeScene) return []
  return threeScene.getRootModels()
})
const rootModelsCount = computed(() => {
  modelUpdateTrigger.value
  return rootModels.value.length
})
const allModelsCount = computed(() => {
  modelUpdateTrigger.value
  return allModelsFlattened.value.length
})

// Three.js 场景实例
let threeScene: ThreeScene | null = null

// 生命周期
onMounted(() => {
  if (sceneContainer.value) {
    threeScene = new ThreeScene(sceneContainer.value)
    threeScene.init()
  }
})

// 监听器已移除，使用固定的光源设置

// 拖拽处理
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  await loadFiles(files)
}

// 文件选择处理
const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  await loadFiles(files)
}

// 加载文件
const loadFiles = async (files: File[]) => {
  const modelFiles = files.filter(file => {
    const ext = file.name.toLowerCase()
    return ext.endsWith('.gltf') || ext.endsWith('.glb') || 
           ext.endsWith('.obj') || ext.endsWith('.fbx')
  })

  if (modelFiles.length === 0) {
    status.value = '请选择有效的3D模型文件'
    setTimeout(() => status.value = '准备就绪', 3000)
    return
  }

  try {
    status.value = `正在批量加载 ${modelFiles.length} 个模型文件...`
    
    // 使用批量加载方法
    const loadedModels = await threeScene?.loadModels(Array.from(files))
    
    if (loadedModels && loadedModels.length > 0) {
      status.value = `成功加载 ${loadedModels.length} 个模型`
      // 触发响应式更新
      modelUpdateTrigger.value++
    } else {
      status.value = '没有成功加载任何模型'
    }
    
  } catch (error) {
    console.error('批量加载模型失败:', error)
    status.value = '批量加载失败，请检查文件格式'
  }

  setTimeout(() => status.value = '准备就绪', 2000)
}

// 控制功能
const resetCamera = () => {
  threeScene?.resetCamera()
  status.value = '相机已重置'
  setTimeout(() => status.value = '准备就绪', 2000)
}

const clearScene = () => {
  threeScene?.clearModels()
  selectedModel.value = null
  status.value = '场景已清空'
  // 触发响应式更新
  modelUpdateTrigger.value++
  setTimeout(() => status.value = '准备就绪', 2000)
}

const showDropZone = () => {
  // 临时显示拖拽区域
  triggerFileSelect()
}

const focusOnModel = (model: ModelInfo) => {
  selectedModel.value = model
  threeScene?.focusOnModel(model.id)
  status.value = `聚焦到 ${model.name}`
  setTimeout(() => status.value = '准备就绪', 2000)
}

const removeModel = (modelId: string) => {
  const modelToRemove = allModelsFlattened.value.find(m => m.id === modelId)
  if (modelToRemove) {
    threeScene?.removeModel(modelId)
    
    if (selectedModel.value?.id === modelId) {
      selectedModel.value = null
    }
    status.value = `${modelToRemove.nodeType === 'root' ? '模型' : '节点'} "${modelToRemove.name}" 已移除`
    // 触发响应式更新
    modelUpdateTrigger.value++
    setTimeout(() => status.value = '准备就绪', 2000)
  }
}

const toggleModelVisibility = (model: ModelInfo) => {
  const newVisibleState = threeScene?.toggleModelVisibility(model.id)
  if (newVisibleState !== null && newVisibleState !== undefined) {
    model.visible = newVisibleState
    status.value = `模型 "${model.name}" 已${model.visible ? '显示' : '隐藏'}`
    // 触发响应式更新
    modelUpdateTrigger.value++
    setTimeout(() => status.value = '准备就绪', 2000)
  }
}

const showAllModels = () => {
  threeScene?.showAllModels()
  status.value = '已显示所有模型'
  // 触发响应式更新
  modelUpdateTrigger.value++
  setTimeout(() => status.value = '准备就绪', 2000)
}

const hideAllModels = () => {
  threeScene?.hideAllModels()
  status.value = '已隐藏所有模型'
  // 触发响应式更新
  modelUpdateTrigger.value++
  setTimeout(() => status.value = '准备就绪', 2000)
}

const getNodeTypeIcon = (nodeType: string): string => {
  switch (nodeType) {
    case 'mesh': return '◆'
    case 'group': return '◉'
    case 'object': return '○'
    default: return '●'
  }
}

const toggleNodeVisibility = (model: ModelInfo) => {
  const newVisibleState = threeScene?.toggleNodeVisibility(model.id)
  if (newVisibleState !== null && newVisibleState !== undefined) {
    model.visible = newVisibleState
    status.value = `节点 "${model.name}" 已${model.visible ? '显示' : '隐藏'}`
    // 触发响应式更新
    modelUpdateTrigger.value++
    setTimeout(() => status.value = '准备就绪', 2000)
  }
}

// 树形控件相关函数
const toggleNodeExpand = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

const isNodeExpanded = (nodeId: string): boolean => {
  return expandedNodes.value.has(nodeId)
}

const hasChildren = (model: ModelInfo): boolean => {
  return model.children && model.children.length > 0
}
</script> 

<style scoped>
/* 树形控件样式 */
.model-tree {
  max-height: none;
  overflow: visible;
  border: 1px solid #333;
  border-radius: 4px;
  background: #2a2a2a;
}

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

.node-indent {
  width: 20px;
  height: 1px;
  margin-right: 4px;
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
.node-visibility-btn,
.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.visibility-btn:hover,
.node-visibility-btn:hover {
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

/* 原有样式 */
.model-list {
  position: absolute;
  top: 20px;
  right: 20px;
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
</style> 