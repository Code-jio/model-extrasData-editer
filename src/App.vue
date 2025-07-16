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
          accept=".gltf,.glb,.obj,.fbx"
          style="display: none;"
          @change="handleFileSelect"
        >
        <button class="browse-btn" @click="triggerFileSelect">浏览文件</button>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="controls">
      <div class="control-group">
        <label>光源强度: {{ lightIntensity.toFixed(1) }}</label>
        <input 
          type="range" 
          v-model.number="lightIntensity"
          min="0" 
          max="2" 
          step="0.1"
        >
      </div>
      <div class="control-group">
        <label>环境光: {{ ambientLightIntensity.toFixed(1) }}</label>
        <input 
          type="range" 
          v-model.number="ambientLightIntensity"
          min="0" 
          max="1" 
          step="0.1"
        >
      </div>
      <div class="control-group">
        <button @click="resetCamera">重置相机</button>
        <button @click="clearScene">清空场景</button>
      </div>
      <div class="control-group">
        <button @click="showDropZone" v-if="hasModels">添加更多模型</button>
      </div>
    </div>

    <!-- 模型列表 -->
    <div class="model-list">
      <h3>已加载模型 ({{ models.length }})</h3>
      <ul>
        <li 
          v-for="model in models" 
          :key="model.id"
          @click="focusOnModel(model)"
          :class="{ active: selectedModel?.id === model.id }"
        >
          <span class="model-name">{{ model.name }}</span>
          <button class="remove-btn" @click.stop="removeModel(model.id)">×</button>
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
const lightIntensity = ref(1)
const ambientLightIntensity = ref(0.4)
const models = ref<ModelInfo[]>([])
const selectedModel = ref<ModelInfo | null>(null)
const status = ref('准备就绪')

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

// 监听器
watch(lightIntensity, (newValue) => {
  threeScene?.updateLightIntensity(newValue)
})

watch(ambientLightIntensity, (newValue) => {
  threeScene?.updateAmbientLight(newValue)
})

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
  const validFiles = files.filter(file => {
    const ext = file.name.toLowerCase()
    return ext.endsWith('.gltf') || ext.endsWith('.glb') || 
           ext.endsWith('.obj') || ext.endsWith('.fbx')
  })

  if (validFiles.length === 0) {
    status.value = '请选择有效的3D模型文件'
    setTimeout(() => status.value = '准备就绪', 3000)
    return
  }

  for (const file of validFiles) {
    try {
      status.value = `正在加载 ${file.name}...`
      
      const modelInfo = await threeScene?.loadModel(file)
      if (modelInfo) {
        models.value.push(modelInfo)
        status.value = `成功加载 ${file.name}`
      }
    } catch (error) {
      console.error('加载模型失败:', error)
      status.value = `加载 ${file.name} 失败`
    }
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
</script> 