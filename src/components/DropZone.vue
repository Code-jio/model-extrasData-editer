<template>
  <div 
    v-show="!hasModels"
    :class="['drop-zone', { 'drag-over': isDragOver }]"
    @drop="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragenter.prevent="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <div class="drop-content">
      <h2>拖拽3D模型文件到这里</h2>
      <p>支持格式: .gltf, .glb, .obj, .fbx</p>
      <p>支持draco压缩模型</p>
      <input 
        ref="fileInput"
        type="file" 
        multiple 
        accept="*"
        style="display: none;"
        @change="handleFileSelect"
      >
      <button class="browse-btn" @click="triggerFileSelect">浏览文件</button>
    </div>
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

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

// 拖拽处理
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  emit('filesSelected', files)
}

// 文件选择处理
const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  emit('filesSelected', files)
}
</script>

<style scoped>
.drop-zone {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  max-width: 90vw;
  height: 280px;
  background: rgba(30, 30, 30, 0.95);
  border: 3px dashed #555;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: all 0.3s ease;
  z-index: 100;
}

.drop-zone.drag-over {
  border-color: #007acc;
  background: linear-gradient(135deg, #1a2a3a 0%, #2a3a4a 100%);
  box-shadow: 0 0 30px rgba(0, 122, 204, 0.3);
  transform: translate(-50%, -50%) scale(1.02);
}

.drop-content {
  text-align: center;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.drop-content h2 {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #007acc;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.drop-content p {
  font-size: 1.2em;
  margin: 10px 0;
  color: #ccc;
}

.browse-btn {
  background: linear-gradient(135deg, #007acc 0%, #0088dd 100%);
  border: none;
  color: white;
  padding: 15px 30px;
  font-size: 1.1em;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 122, 204, 0.3);
}

.browse-btn:hover {
  background: linear-gradient(135deg, #0066aa 0%, #0077cc 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 204, 0.4);
}

.browse-btn:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .drop-zone {
    width: 90vw;
    height: auto;
    padding: 20px 10px;
  }

  .drop-content h2 {
    font-size: 1.6em;
  }

  .drop-content p {
    font-size: 0.9em;
  }
}
</style> 