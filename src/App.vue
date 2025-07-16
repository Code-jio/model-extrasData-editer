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
        <button @click="showAllModels" v-if="hasModels && displayMode === 'single'">显示所有模型</button>
      </div>
    </div>

    <!-- 模型列表 -->
    <div class="model-list">
      <h3>已加载模型 ({{ models.length }})</h3>
      <div v-if="displayMode === 'single'" class="display-mode-info">
        当前单独显示: {{ selectedModel?.name }}
      </div>
      <ul>
        <li 
          v-for="model in models" 
          :key="model.id"
          @click="focusOnModel(model)"
          :class="{ active: selectedModel?.id === model.id }"
        >
          <span class="model-name">{{ model.name }}</span>
          <div class="model-actions">
            <button 
              class="action-btn" 
              @click.stop="showOnlyModel(model)"
              :disabled="displayMode === 'single' && selectedModel?.id === model.id"
              title="单独显示此模型"
            >
              📱
            </button>
            <button class="remove-btn" @click.stop="removeModel(model.id)">×</button>
          </div>
        </li>
      </ul>
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
const models = ref<ModelInfo[]>([])
const selectedModel = ref<ModelInfo | null>(null)
const status = ref('准备就绪')
const displayMode = ref<'single' | 'all'>('all') // 新增：控制模型显示模式

// 计算属性
const hasModels = computed(() => models.value.length > 0)

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
    
    // 使用新的批量加载方法
    const loadedModels = await threeScene?.loadModels(Array.from(files))
    
    if (loadedModels && loadedModels.length > 0) {
      models.value.push(...loadedModels)
      status.value = `成功加载 ${loadedModels.length} 个模型`
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
  models.value = []
  selectedModel.value = null
  status.value = '场景已清空'
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
  threeScene?.removeModel(modelId)
  models.value = models.value.filter(m => m.id !== modelId)
  if (selectedModel.value?.id === modelId) {
    selectedModel.value = null
  }
  status.value = '模型已移除'
  setTimeout(() => status.value = '准备就绪', 2000)
}

const showOnlyModel = (model: ModelInfo) => {
  selectedModel.value = model
  threeScene?.showOnlyModel(model.id)
  displayMode.value = 'single'
  status.value = `已单独显示: ${model.name}`
  setTimeout(() => status.value = '准备就绪', 2000)
}

const showAllModels = () => {
  selectedModel.value = null
  threeScene?.showAllModels() // 显示所有模型
  displayMode.value = 'all'
  status.value = '已显示所有模型'
  setTimeout(() => status.value = '准备就绪', 2000)
}
</script> 