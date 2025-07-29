<template>
  <div class="controls">
    <!-- 选中对象信息 -->
    <SelectedObjectInfo :selected-object-info="selectedObjectInfo" />

    <!-- 变换控制 -->
    <TransformControls
      v-if="showTransformControls"
      :transform-mode="transformMode"
      :show-transform-controls="showTransformControls"
      @set-transform-mode="emit('setTransformMode', $event)"
      @hide-transform-controls="emit('hideTransformControls')"
    />

    <!-- 精确位置控制 -->
    <PositionControls
      v-if="selectedModelId"
      :selected-model-id="selectedModelId"
      :selected-model-name="selectedModelName"
      :initial-position="initialPosition"
      @set-position="(modelId, x, y, z) => emit('setPosition', modelId, x, y, z)"
    />

    <!-- 场景控制 -->
    <SceneControls
      @reset-camera="emit('resetCamera')"
      @clear-scene="emit('clearScene')"
    />

    <!-- 模型控制 -->
    <ModelControls
      :has-models="hasModels"
      @add-model="emit('addModel')"
      @show-all-models="emit('showAllModels')"
      @hide-all-models="emit('hideAllModels')"
    />

    <!-- UserData 编辑面板
    <UserDataPanel
      :selected-object-info="selectedObjectInfo"
      :show-user-data-panel="showUserDataPanel"
      :selected-user-data="selectedUserData"
      @update-user-data="emit('updateUserData', $event[0], $event[1])"
      @remove-user-data="emit('removeUserData', $event)"
      @clear-all-user-data="emit('clearAllUserData')"
      @export-user-data="emit('exportUserData')"
    /> -->
  </div>
</template>

<script setup lang="ts">
import SelectedObjectInfo from './SelectedObjectInfo.vue'
import TransformControls from './TransformControls.vue'
import PositionControls from './PositionControls.vue'
import SceneControls from './SceneControls.vue'
import ModelControls from './ModelControls.vue'
import UserDataPanel from './UserDataPanel.vue'

defineProps<{
  selectedObjectInfo: { name: string, type: string, modelId?: string } | null
  transformMode: 'translate' | 'rotate' | 'scale'
  showTransformControls: boolean
  hasModels: boolean
  showUserDataPanel: boolean
  selectedUserData: Record<string, any>
  selectedModelId?: string
  selectedModelName?: string
  initialPosition?: { x: number; y: number; z: number } | null
}>()

const emit = defineEmits<{
  setTransformMode: [mode: 'translate' | 'rotate' | 'scale']
  hideTransformControls: []
  resetCamera: []
  clearScene: []
  addModel: []
  showAllModels: []
  hideAllModels: []
  updateUserData: [key: string, value: any]
  removeUserData: [key: string]
  clearAllUserData: []
  exportUserData: []
  setPosition: [modelId: string, x: number, y: number, z: number]
}>()
</script>

<style scoped>
.controls {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  padding: 12px;
  border-radius: 6px;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 260px;
  max-width: calc(50vw - 24px);
  max-height: calc(100vh - 24px);
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  font-size: 11px;
  z-index: 100;
}

/* 子组件间距优化 */
.controls > * {
  margin: 0;
}

/* 子组件紧凑化 */
.controls :deep(.section-header) {
  margin-bottom: 6px;
  padding-bottom: 2px;
}

.controls :deep(.section-title) {
  font-size: 11px;
}

.controls :deep(.control-group) {
  gap: 6px;
}

.controls :deep(.btn-group) {
  gap: 4px;
}

.controls :deep(button) {
  padding: 4px 8px;
  font-size: 10px;
}

.controls :deep(input) {
  padding: 3px 6px;
  font-size: 10px;
}

/* 滚动条样式 */
.controls::-webkit-scrollbar {
  width: 4px;
}

.controls::-webkit-scrollbar-track {
  background: transparent;
}

.controls::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.controls::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .controls {
    width: 240px;
    max-width: calc(45vw - 16px);
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .controls {
    width: 220px;
    max-width: calc(100vw - 16px);
    font-size: 10px;
    right: 8px;
    top: 8px;
    gap: 6px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .controls {
    position: relative;
    width: calc(100vw - 16px);
    max-width: none;
    right: 8px;
    top: 8px;
    margin-bottom: 8px;
  }
}

/* 深色主题优化 */
@media (prefers-color-scheme: dark) {
  .controls {
    background: rgba(15, 15, 15, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
}
</style> 