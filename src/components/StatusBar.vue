<template>
  <div class="status">
    <div class="status-message">{{ status }}</div>
    <div 
      v-if="selectedPerfInfo" 
      class="perf-info"
    >
      当前选择 - 顶点: {{ selectedPerfInfo.vertices }} | 边: {{ selectedPerfInfo.edges }} | 面: {{ selectedPerfInfo.faces }}
    </div>
    <div 
      v-if="globalPerfInfo" 
      class="perf-info"
    >
      场景总计 - 顶点: {{ globalPerfInfo.vertices }} | 边: {{ globalPerfInfo.edges }} | 面: {{ globalPerfInfo.faces }}
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
.status {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  text-align: center;
  line-height: 1.4;
}

.perf-info {
  margin-top: 2px;
  font-size: 11px;
  opacity: 0.85;
}
</style> 