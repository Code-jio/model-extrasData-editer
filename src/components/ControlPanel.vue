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

    <!-- UserData 编辑面板 -->
    <UserDataPanel
      :selected-object-info="selectedObjectInfo"
      :show-user-data-panel="showUserDataPanel"
      :selected-user-data="selectedUserData"
      @update-user-data="emit('updateUserData', $event[0], $event[1])"
      @remove-user-data="emit('removeUserData', $event)"
      @clear-all-user-data="emit('clearAllUserData')"
      @export-user-data="emit('exportUserData')"
    />
  </div>
</template>

<script setup lang="ts">
import SelectedObjectInfo from './SelectedObjectInfo.vue'
import TransformControls from './TransformControls.vue'
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
}>()
</script>

<style scoped>
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
  width: 360px;
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
}

@media (max-width: 480px) {
  .controls {
    position: relative;
    width: calc(100vw - 20px);
    left: 10px;
    top: 10px;
    margin-bottom: 10px;
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