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
.transform-section {
  background: linear-gradient(135deg, #333 0%, #404040 100%);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #555;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.transform-section:hover {
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
  width: 100%;
}

.hide-controls-btn:hover {
  background: linear-gradient(135deg, #ff4444 0%, #ff3333 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 68, 68, 0.3);
}
</style> 