<template>
  <div class="scene-section">
    <div class="section-header">
      <span class="section-icon">🎬</span>
      <span class="section-title">场景控制</span>
    </div>
    <div class="scene-controls">
      <button @click="emit('resetCamera')" class="scene-btn" title="重置相机位置">
        <span class="btn-icon">📷</span>
        <span class="btn-text">重置相机</span>
      </button>
      <button @click="emit('clearScene')" class="scene-btn danger" title="清空所有模型">
        <span class="btn-icon">🗑️</span>
        <span class="btn-text">清空场景</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  resetCamera: []
  clearScene: []
}>()
</script>

<style scoped>
.scene-section {
  background: linear-gradient(135deg, #333 0%, #404040 100%);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #555;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.scene-section:hover {
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

.scene-controls {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.scene-btn {
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

.scene-btn:hover {
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
</style> 