<template>
  <div id="app">
    <!-- Three.js 场景容器 -->
    <div ref="sceneContainer" id="scene-container"></div>

    <!-- 拖拽区域 -->
    <DropZone 
      :has-models="hasModels" 
      @files-selected="loadFiles" 
    />

    <!-- 控制面板 -->
    <ControlPanel
      :selected-object-info="selectedObjectInfo"
      :transform-mode="transformMode"
      :show-transform-controls="selectedModel !== null || selectedObjectInfo !== null"
      :has-models="hasModels"
      :show-user-data-panel="showUserDataPanel"
      :selected-user-data="selectedUserData"
      :selected-model-id="selectedModelForPosition?.id"
      :selected-model-name="selectedModelForPosition?.name"
      :initial-position="selectedModelPosition"
      @set-transform-mode="setTransformMode"
      @hide-transform-controls="hideTransformControls"
      @reset-camera="resetCamera"
      @clear-scene="clearScene"
      @add-model="showDropZone"
      @show-all-models="showAllModels"
      @hide-all-models="hideAllModels"
      @update-user-data="updateUserDataAttribute"
      @remove-user-data="removeUserDataAttribute"
      @clear-all-user-data="clearAllUserData"
      @export-user-data="exportUserData"
      @set-position="setModelPosition"
    />

    <!-- 模型列表 -->
    <ModelList
      :root-models="rootModels"
      :root-models-count="rootModelsCount"
      :visible-models-count="visibleModelsCount"
      :all-models-count="allModelsCount"
      :selected-model-id="selectedModel?.id"
      :expanded-nodes="expandedNodes"
      @focus-model="focusOnModel"
      @toggle-expand="toggleNodeExpand"
      @toggle-visibility="handleToggleVisibility"
      @remove-model="removeModel"
      @export-model="openExportDialog"
      @batch-export="() => openExportDialog()"
    />

    <!-- 状态信息 -->
    <StatusBar 
      :status="status" 
      :selected-perf-info="selectedPerfInfo" 
      :global-perf-info="globalPerfInfo" 
    />

    <!-- 导出对话框 -->
    <ExportDialog
      :visible="showExportDialog"
      :model-name="exportTargetModel?.name"
      :model-count="exportableModelsCount"
      :is-batch-export="isExportingBatch"
      @close="closeExportDialog"
      @export="handleExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ThreeScene } from './composables/useThreeScene'
import type { ModelInfo, ExportOptions } from './types'
import DropZone from './components/DropZone.vue'
import ControlPanel from './components/ControlPanel.vue'
import ModelList from './components/ModelList.vue'
import StatusBar from './components/StatusBar.vue'
import ExportDialog from './components/ExportDialog.vue'

// 响应式数据
const sceneContainer = ref<HTMLElement>()
const selectedModel = ref<ModelInfo | null>(null)
const status = ref('准备就绪')
const modelUpdateTrigger = ref(0)
const expandedNodes = ref<Set<string>>(new Set())
const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate')
const selectedObjectInfo = ref<{ name: string, type: string, modelId?: string } | null>(null)
const selectedUserData = ref<Record<string, any>>({})
const showUserDataPanel = ref(false)

// 性能信息（点/线/面数量）
const selectedPerfInfo = ref<{ vertices: number; edges: number; faces: number } | null>(null)

// 选中的模型信息（用于位置控制）
const selectedModelForPosition = ref<{ id: string; name: string } | null>(null)
const selectedModelPosition = ref<{ x: number; y: number; z: number } | null>(null)

// 导出相关状态
const showExportDialog = ref(false)
const exportTargetModel = ref<ModelInfo | null>(null)
const isExportingBatch = ref(false)

const globalPerfInfo = computed(() => {
  modelUpdateTrigger.value // 依赖模型更新触发重新计算
  if (!threeScene) {
    return { vertices: 0, edges: 0, faces: 0 }
  }
  return threeScene.getSceneGeometryInfo()
})

// 计算属性
const hasModels = computed(() => {
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

const exportableModelsCount = computed(() => {
  modelUpdateTrigger.value
  if (!threeScene) return 0
  return threeScene.getExportableModels().length
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
        // 同时更新userData
        const userData = threeScene.getSelectedObjectUserData()
        if (userData) {
          selectedUserData.value = userData
          showUserDataPanel.value = true
        } else {
          showUserDataPanel.value = false
        }
        // 移除位置信息的自动更新，避免覆盖用户输入
      }
    }, 100) // 每100ms检查一次
  }
})

// 文件加载
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
    
    const loadedModels = await threeScene?.loadModels(Array.from(files))
    
    if (loadedModels && loadedModels.length > 0) {
      status.value = `成功加载 ${loadedModels.length} 个模型`
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
  selectedPerfInfo.value = null
  selectedModelForPosition.value = null
  selectedModelPosition.value = null
  status.value = '场景已清空'
  modelUpdateTrigger.value++
  setTimeout(() => status.value = '准备就绪', 2000)
}

const showDropZone = () => {
  // 模拟文件选择，实际上DropZone组件内部处理
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = '*'
  input.onchange = (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || [])
    loadFiles(files)
  }
  input.click()
}

const focusOnModel = (model: ModelInfo) => {
  selectedModel.value = model
  threeScene?.focusOnModel(model.id)
  // (优化) 更新性能信息 - 直接从缓存读取
  selectedPerfInfo.value = model.perfInfo || null
  // 设置选中模型用于位置控制
  selectedModelForPosition.value = { id: model.id, name: model.name }
  // 获取当前位置
  const position = threeScene?.getModelPosition(model.id)
  selectedModelPosition.value = position || null
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
    modelUpdateTrigger.value++
    setTimeout(() => status.value = '准备就绪', 2000)
  }
}

const handleToggleVisibility = (model: ModelInfo) => {
  let newVisibleState: boolean | null = null
  
  if (model.nodeType === 'root') {
    newVisibleState = threeScene?.toggleModelVisibility(model.id) ?? null
  } else {
    newVisibleState = threeScene?.toggleNodeVisibility(model.id) ?? null
  }
  
  if (newVisibleState !== null && newVisibleState !== undefined) {
    model.visible = newVisibleState
    status.value = `${model.nodeType === 'root' ? '模型' : '节点'} "${model.name}" 已${model.visible ? '显示' : '隐藏'}`
    modelUpdateTrigger.value++
    setTimeout(() => status.value = '准备就绪', 2000)
  }
}

const showAllModels = () => {
  threeScene?.showAllModels()
  status.value = '已显示所有模型'
  modelUpdateTrigger.value++
  setTimeout(() => status.value = '准备就绪', 2000)
}

const hideAllModels = () => {
  threeScene?.hideAllModels()
  status.value = '已隐藏所有模型'
  modelUpdateTrigger.value++
  setTimeout(() => status.value = '准备就绪', 2000)
}

// 树形控件相关函数
const toggleNodeExpand = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
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

// UserData 相关方法
const updateUserDataAttribute = (key: string, value: any) => {
  if (threeScene && threeScene.updateSelectedObjectUserData(key, value)) {
    selectedUserData.value[key] = value
    status.value = `已更新属性 "${key}"`
    setTimeout(() => status.value = '准备就绪', 2000)
  }
}

const removeUserDataAttribute = (key: string) => {
  if (threeScene && threeScene.removeSelectedObjectUserData(key)) {
    delete selectedUserData.value[key]
    status.value = `已删除属性 "${key}"`
    setTimeout(() => status.value = '准备就绪', 2000)
  }
}

const clearAllUserData = () => {
  if (threeScene && threeScene.clearSelectedObjectUserData()) {
    selectedUserData.value = {}
    status.value = '已清空所有属性'
    setTimeout(() => status.value = '准备就绪', 2000)
  }
}

const exportUserData = () => {
  if (Object.keys(selectedUserData.value).length === 0) {
    status.value = '没有属性可导出'
    setTimeout(() => status.value = '准备就绪', 2000)
    return
  }
  
  const dataStr = JSON.stringify(selectedUserData.value, null, 2)
  navigator.clipboard.writeText(dataStr).then(() => {
    status.value = '属性已复制到剪贴板'
    setTimeout(() => status.value = '准备就绪', 2000)
  }).catch(() => {
    status.value = '复制失败'
    setTimeout(() => status.value = '准备就绪', 2000)
  })
}

// 位置控制相关方法
const setModelPosition = (modelId: string, x: number, y: number, z: number) => {
  if (threeScene && threeScene.setModelPosition(modelId, x, y, z)) {
    selectedModelPosition.value = { x, y, z }
    status.value = `位置已更新: (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`
    setTimeout(() => status.value = '准备就绪', 2000)
  }
}

// 导出相关方法
const openExportDialog = (modelId?: string) => {
  if (modelId) {
    // 单个模型导出
    const model = rootModels.value.find(m => m.id === modelId)
    if (model) {
      exportTargetModel.value = model
      isExportingBatch.value = false
      showExportDialog.value = true
    }
  } else {
    // 批量导出
    exportTargetModel.value = null
    isExportingBatch.value = true
    showExportDialog.value = true
  }
}

const closeExportDialog = () => {
  showExportDialog.value = false
  exportTargetModel.value = null
  isExportingBatch.value = false
}

const handleExport = async (options: ExportOptions) => {
  if (!threeScene) {
    status.value = '场景未初始化'
    setTimeout(() => status.value = '准备就绪', 2000)
    closeExportDialog()
    return
  }

  try {
    status.value = '正在导出模型...'
    
    let result
    if (isExportingBatch.value) {
      // 批量导出
      result = await threeScene.exportModels(undefined, options)
    } else if (exportTargetModel.value) {
      // 单个模型导出
      result = await threeScene.exportModel(exportTargetModel.value.id, options)
    } else {
      throw new Error('没有选择要导出的模型')
    }

    if (result.success) {
      status.value = `导出成功: ${result.fileName}`
      setTimeout(() => status.value = '准备就绪', 3000)
    } else {
      status.value = `导出失败: ${result.error}`
      setTimeout(() => status.value = '准备就绪', 3000)
    }
  } catch (error) {
    console.error('导出模型失败:', error)
    status.value = `导出失败: ${error instanceof Error ? error.message : '未知错误'}`
    setTimeout(() => status.value = '准备就绪', 3000)
  } finally {
    closeExportDialog()
  }
}
</script> 

<style scoped>
#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#scene-container {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  #app {
    flex-direction: column;
  }
}
</style> 