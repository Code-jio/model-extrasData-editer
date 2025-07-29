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
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header h3 {
  margin: 0;
  font-size: 12px;
  color: #40a9ff;
  font-weight: 600;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px;
}

.control-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-btn {
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 10px;
  text-align: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.control-btn.camera {
  background: rgba(64, 169, 255, 0.2);
  border-color: rgba(64, 169, 255, 0.4);
}

.control-btn.camera:hover {
  background: rgba(64, 169, 255, 0.3);
  border-color: rgba(64, 169, 255, 0.6);
}

.control-btn.clear {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.4);
}

.control-btn.clear:hover {
  background: rgba(255, 107, 107, 0.3);
  border-color: rgba(255, 107, 107, 0.6);
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