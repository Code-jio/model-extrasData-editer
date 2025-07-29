<template>
  <div class="position-controls" v-if="selectedModelId">
    <div class="section-header">
      <h3>精确位置控制</h3>
    </div>
    
    <div class="object-info">
      <span class="object-name">{{ selectedModelName }}</span>
    </div>
    
    <div class="coordinate-inputs">
      <div class="input-row">
        <label>X:</label>
        <input 
          type="number" 
          v-model.number="position.x"
          @input="onPositionChange"
        />
      </div>
      
      <div class="input-row">
        <label>Y:</label>
        <input 
          type="number" 
          v-model.number="position.y"
          @input="onPositionChange"
        />
      </div>
      
      <div class="input-row">
        <label>Z:</label>
        <input 
          type="number" 
          v-model.number="position.z"
          @input="onPositionChange"
        />
      </div>
    </div>
    
    <div class="control-buttons">
      <button @click="resetPosition" class="reset-btn">重置位置 (0,0,0)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  selectedModelId?: string
  selectedModelName?: string
  initialPosition?: { x: number; y: number; z: number } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  setPosition: [modelId: string, x: number, y: number, z: number]
}>()

const position = ref({ x: 0, y: 0, z: 0 })

// 监听初始位置变化，仅在切换模型时更新
watch(() => props.initialPosition, (newPos) => {
  if (newPos) {
    position.value = { ...newPos }
  }
}, { immediate: true })

// 监听选中模型变化，重置位置
watch(() => props.selectedModelId, () => {
  if (props.initialPosition) {
    position.value = { ...props.initialPosition }
  }
})

// 实时位置变化处理
const onPositionChange = () => {
  if (props.selectedModelId) {
    emit('setPosition', props.selectedModelId, position.value.x, position.value.y, position.value.z)
  }
}

// 重置位置到原点
const resetPosition = () => {
  position.value = { x: 0, y: 0, z: 0 }
  if (props.selectedModelId) {
    emit('setPosition', props.selectedModelId, 0, 0, 0)
  }
}
</script>

<style scoped>
.position-controls {
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

.object-info {
  margin-bottom: 8px;
}

.object-name {
  font-size: 10px;
  color: #aaa;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.coordinate-inputs {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-row label {
  font-size: 10px;
  font-weight: bold;
  width: 16px;
  color: #ccc;
}

.input-row input {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 10px;
}

.input-row input:focus {
  outline: none;
  border-color: #40a9ff;
  background: rgba(255, 255, 255, 0.15);
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reset-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}
</style> 