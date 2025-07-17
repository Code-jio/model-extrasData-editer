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
      <!-- 选中对象信息 -->
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

      <!-- 变换控制 -->
      <div class="transform-section" v-if="selectedModel || selectedObjectInfo">
        <div class="section-header">
          <span class="section-icon">🛠️</span>
          <span class="section-title">变换工具</span>
        </div>
        <div class="transform-modes">
          <button 
            @click="setTransformMode('translate')"
            :class="{ active: transformMode === 'translate' }"
            class="mode-btn translate"
            title="移动模式"
          >
            <span class="mode-icon">📐</span>
            <span class="mode-text">移动</span>
          </button>
          <button 
            @click="setTransformMode('rotate')"
            :class="{ active: transformMode === 'rotate' }"
            class="mode-btn rotate"
            title="旋转模式"
          >
            <span class="mode-icon">🔄</span>
            <span class="mode-text">旋转</span>
          </button>
          <button 
            @click="setTransformMode('scale')"
            :class="{ active: transformMode === 'scale' }"
            class="mode-btn scale"
            title="缩放模式"
          >
            <span class="mode-icon">🔍</span>
            <span class="mode-text">缩放</span>
          </button>
        </div>
        <button @click="hideTransformControls" class="hide-controls-btn">
          <span>❌</span> 隐藏控制器
        </button>
      </div>

      <!-- 场景控制 -->
      <div class="scene-section">
        <div class="section-header">
          <span class="section-icon">🎬</span>
          <span class="section-title">场景控制</span>
        </div>
        <div class="scene-controls">
          <button @click="resetCamera" class="scene-btn" title="重置相机位置">
            <span class="btn-icon">📷</span>
            <span class="btn-text">重置相机</span>
          </button>
          <button @click="clearScene" class="scene-btn danger" title="清空所有模型">
            <span class="btn-icon">🗑️</span>
            <span class="btn-text">清空场景</span>
          </button>
        </div>
      </div>

      <!-- 模型控制 -->
      <div class="model-section" v-if="hasModels">
        <div class="section-header">
          <span class="section-icon">📦</span>
          <span class="section-title">模型控制</span>
        </div>
        <div class="model-controls">
          <button @click="showDropZone" class="model-btn" title="添加更多3D模型">
            <span class="btn-icon">➕</span>
            <span class="btn-text">添加模型</span>
          </button>
          <button @click="showAllModels" class="model-btn" title="显示所有模型">
            <span class="btn-icon">👁️</span>
            <span class="btn-text">全部显示</span>
          </button>
          <button @click="hideAllModels" class="model-btn" title="隐藏所有模型">
            <span class="btn-icon">🙈</span>
            <span class="btn-text">全部隐藏</span>
          </button>
        </div>
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
// 添加变换控制模式
const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate')
// 添加选中对象信息
const selectedObjectInfo = ref<{ name: string, type: string, modelId?: string } | null>(null)

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
    
    // 定时检查选中对象信息
    setInterval(() => {
      if (threeScene) {
        selectedObjectInfo.value = threeScene.getSelectedObjectInfo()
      }
    }, 100) // 每100ms检查一次
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

// TransformControls 相关方法
const setTransformMode = (mode: 'translate' | 'rotate' | 'scale') => {
  transformMode.value = mode
  if (threeScene) {
    threeScene.setTransformMode(mode)
  }
}

const hideTransformControls = () => {
  if (threeScene) {
    threeScene.detachTransformControls()
  }
  selectedObjectInfo.value = null
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

/* 控制面板样式 */
.controls {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  padding: 15px;
  border-radius: 10px;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 260px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

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

.transform-section,
.scene-section,
.model-section {
  background: linear-gradient(135deg, #333 0%, #404040 100%);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #555;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.transform-section:hover,
.scene-section:hover,
.model-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-icon {
  font-size: 16px;
  margin-right: 6px;
}

.section-title {
  font-size: 13px;
  font-weight: bold;
  color: #007acc;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.transform-modes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}

.mode-btn {
  background: linear-gradient(135deg, #444 0%, #555 100%);
  border: 1px solid #666;
  color: white;
  padding: 6px 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.mode-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.mode-btn:hover::before {
  left: 100%;
}

.mode-btn:hover {
  background: linear-gradient(135deg, #555 0%, #666 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.mode-btn.active {
  background: linear-gradient(135deg, #007acc 0%, #0088dd 100%);
  border-color: #007acc;
  box-shadow: 0 0 10px rgba(0, 122, 204, 0.3);
}

.mode-btn.active:hover {
  background: linear-gradient(135deg, #0066aa 0%, #0077cc 100%);
}

.mode-icon {
  font-size: 14px;
}

.mode-text {
  font-weight: bold;
  text-align: center;
}

.hide-controls-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  border: 1px solid #ff4444;
  color: white;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: bold;
}

.hide-controls-btn:hover {
  background: linear-gradient(135deg, #ff4444 0%, #ff3333 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 68, 68, 0.3);
}

.scene-controls,
.model-controls {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.scene-btn,
.model-btn {
  background: linear-gradient(135deg, #444 0%, #555 100%);
  border: 1px solid #666;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.scene-btn:hover,
.model-btn:hover {
  background: linear-gradient(135deg, #555 0%, #666 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.scene-btn.danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  border-color: #ff4444;
}

.scene-btn.danger:hover {
  background: linear-gradient(135deg, #ff4444 0%, #ff3333 100%);
  box-shadow: 0 4px 8px rgba(255, 68, 68, 0.3);
}

.btn-icon {
  font-size: 12px;
}

.btn-text {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .controls {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .controls {
    width: 220px;
    font-size: 10px;
    left: 10px;
    top: 10px;
    gap: 10px;
    padding: 12px;
  }
  
  .model-list {
    width: 300px;
    right: 10px;
    top: 10px;
  }
  
  .transform-modes {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .mode-btn {
    flex-direction: row;
    justify-content: center;
    padding: 8px;
    gap: 4px;
  }
  
  .scene-controls,
  .model-controls {
    flex-direction: column;
    gap: 4px;
  }
  
  .scene-btn,
  .model-btn {
    justify-content: center;
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .controls {
    position: relative;
    width: calc(100vw - 20px);
    left: 10px;
    top: 10px;
    margin-bottom: 10px;
  }
  
  .model-list {
    position: relative;
    width: calc(100vw - 20px);
    right: auto;
    left: 10px;
    top: auto;
    margin-top: 10px;
  }
}

/* 深色主题优化 */
@media (prefers-color-scheme: dark) {
  .controls {
    background: rgba(20, 20, 20, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
}
</style> 