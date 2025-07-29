<template>
  <div class="status-bar">
    <div class="status-message">
      <span class="status-text">{{ status }}</span>
    </div>
    
    <div class="performance-info" v-if="selectedPerfInfo || globalPerfInfo">
      <div v-if="selectedPerfInfo" class="perf-section selected">
        <span class="perf-label">选中对象</span>
        <div class="perf-stats">
          <span class="stat">顶点: {{ selectedPerfInfo.vertices.toLocaleString() }}</span>
          <span class="stat">边: {{ selectedPerfInfo.edges.toLocaleString() }}</span>
          <span class="stat">面: {{ selectedPerfInfo.faces.toLocaleString() }}</span>
        </div>
      </div>
      
      <div v-if="globalPerfInfo" class="perf-section global">
        <span class="perf-label">场景总计</span>
        <div class="perf-stats">
          <span class="stat">顶点: {{ globalPerfInfo.vertices.toLocaleString() }}</span>
          <span class="stat">边: {{ globalPerfInfo.edges.toLocaleString() }}</span>
          <span class="stat">面: {{ globalPerfInfo.faces.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: string
  selectedPerfInfo?: { vertices: number; edges: number; faces: number } | null
  globalPerfInfo?: { vertices: number; edges: number; faces: number }
}>()
</script>

<style scoped>
.status-bar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  color: white;
  border-radius: 8px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  pointer-events: none;
  z-index: 200;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  max-width: 80vw;
}

.status-message {
  padding: 8px 16px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.status-text {
  font-size: 12px;
  color: #e0e0e0;
}

.performance-info {
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.perf-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.perf-label {
  font-size: 10px;
  color: #888;
  font-weight: 500;
}

.perf-stats {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.stat {
  font-size: 10px;
  color: #40a9ff;
  font-weight: 500;
}

.selected .stat {
  color: #52c41a;
}

.global .stat {
  color: #faad14;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-bar {
    bottom: 15px;
    font-size: 11px;
  }
  
  .status-text {
    font-size: 11px;
  }
  
  .perf-stats {
    flex-direction: column;
    gap: 2px;
  }
  
  .stat {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .status-bar {
    bottom: 10px;
    max-width: 90vw;
  }
  
  .status-message,
  .performance-info {
    padding: 6px 12px;
  }
}
</style> 