<template>
  <div class="transform-section" v-if="showTransformControls">
    <div class="section-header">
      <span class="section-icon">🛠️</span>
      <span class="section-title">变换工具</span>
    </div>
    <div class="transform-modes">
      <button 
        @click="emit('setTransformMode', 'translate')"
        :class="{ active: transformMode === 'translate' }"
        class="mode-btn translate"
        title="移动模式"
      >
        <span class="mode-icon">📐</span>
        <span class="mode-text">移动</span>
      </button>
      <button 
        @click="emit('setTransformMode', 'rotate')"
        :class="{ active: transformMode === 'rotate' }"
        class="mode-btn rotate"
        title="旋转模式"
      >
        <span class="mode-icon">🔄</span>
        <span class="mode-text">旋转</span>
      </button>
      <button 
        @click="emit('setTransformMode', 'scale')"
        :class="{ active: transformMode === 'scale' }"
        class="mode-btn scale"
        title="缩放模式"
      >
        <span class="mode-icon">🔍</span>
        <span class="mode-text">缩放</span>
      </button>
    </div>
    <button @click="emit('hideTransformControls')" class="hide-controls-btn">
      <span>❌</span> 隐藏控制器
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  transformMode: 'translate' | 'rotate' | 'scale'
  showTransformControls: boolean
}>()

const emit = defineEmits<{
  setTransformMode: [mode: 'translate' | 'rotate' | 'scale']
  hideTransformControls: []
}>()
</script>

<style scoped>
.transform-controls {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px;
}

.section-header {
  margin-bottom: 6px;
}

.section-header h3 {
  margin: 0;
  font-size: 12px;
  color: #40a9ff;
  font-weight: 600;
}

.transform-modes {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.mode-btn {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 10px;
  text-align: center;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.mode-btn.active {
  background: #40a9ff;
  border-color: #40a9ff;
  color: white;
}

.hide-btn {
  width: 100%;
  padding: 6px;
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 3px;
  background: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 10px;
}

.hide-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.5);
}
</style> 