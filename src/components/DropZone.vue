<template>
  <div 
    class="drop-zone" 
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="isDragOver = true"
    @dragleave.prevent="isDragOver = false"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
    v-if="!hasModels"
  >
    <div class="upload-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    </div>
    
    <div class="upload-content">
      <h3>拖拽模型文件到此处</h3>
      <p>或点击选择文件</p>
      <div class="supported-formats">
        支持格式: GLTF, GLB, OBJ, FBX
      </div>
    </div>
    
    <input 
      ref="fileInput" 
      type="file" 
      multiple 
      accept="*" 
      @change="handleFileSelect"
      class="file-input"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  hasModels: boolean
}>()

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement>()

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length > 0) {
    emit('filesSelected', files)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  if (files.length > 0) {
    emit('filesSelected', files)
  }
}
</script>

<style scoped>
.drop-zone {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 300;
  font-size: 12px;
  text-align: center;
  gap: 16px;
}

.drop-zone:hover {
  border-color: #40a9ff;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  transform: translate(-50%, -50%) scale(1.02);
}

.drop-zone.drag-over {
  border-color: #40a9ff;
  background: rgba(64, 169, 255, 0.1);
  color: #40a9ff;
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 0 30px rgba(64, 169, 255, 0.3);
}

.upload-icon {
  color: #40a9ff;
  opacity: 0.8;
}

.upload-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: inherit;
}

.upload-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  opacity: 0.8;
}

.supported-formats {
  font-size: 11px;
  color: #888;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.file-input {
  display: none;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .drop-zone {
    width: 320px;
    height: 180px;
    font-size: 11px;
  }
  
  .upload-icon svg {
    width: 40px;
    height: 40px;
  }
  
  .upload-content h3 {
    font-size: 16px;
  }
  
  .upload-content p {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .drop-zone {
    width: 280px;
    height: 160px;
    font-size: 10px;
  }
  
  .upload-icon svg {
    width: 36px;
    height: 36px;
  }
  
  .upload-content h3 {
    font-size: 14px;
  }
  
  .upload-content p {
    font-size: 12px;
  }
}
</style> 