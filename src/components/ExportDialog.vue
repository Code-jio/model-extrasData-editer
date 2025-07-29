<template>
  <div v-if="visible" class="export-dialog-overlay" @click="close">
    <div class="export-dialog" @click.stop>
      <div class="dialog-header">
        <h3>模型导出设置</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <div class="dialog-content">
        <div class="export-info">
          <div class="info-item">
            <span class="label">导出对象:</span>
            <span class="value">{{ exportInfo }}</span>
          </div>
        </div>

        <div class="option-group">
          <label class="option-label">
            <span>导出格式:</span>
            <select v-model="options.format" class="format-select">
              <option value="glb">GLB (二进制)</option>
              <option value="gltf">GLTF (JSON)</option>
            </select>
          </label>
        </div>

        <div class="option-group">
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="options.includeAnimations"
            />
            <span class="checkmark"></span>
            <span>包含动画</span>
          </label>
        </div>

        <div class="option-group">
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="options.includeCustomMaterials"
            />
            <span class="checkmark"></span>
            <span>包含自定义材质</span>
          </label>
        </div>

        <div class="option-group">
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="options.onlyVisible"
            />
            <span class="checkmark"></span>
            <span>仅导出可见模型</span>
          </label>
        </div>

        <div class="option-group">
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="options.preserveTransforms"
            />
            <span class="checkmark"></span>
            <span>保留变换属性</span>
          </label>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="export-btn" @click="handleExport" :disabled="exporting">
          {{ exporting ? '导出中...' : '开始导出' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ExportOptions } from '@/types'

interface Props {
  visible: boolean
  modelName?: string
  modelCount?: number
  isBatchExport?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelName: '',
  modelCount: 0,
  isBatchExport: false
})

const emit = defineEmits<{
  close: []
  export: [options: ExportOptions]
}>()

const exporting = ref(false)

const options = ref<ExportOptions>({
  format: 'glb',
  includeAnimations: true,
  includeCustomMaterials: true,
  onlyVisible: true,
  preserveTransforms: true,
  binary: true
})

const exportInfo = computed(() => {
  if (props.isBatchExport) {
    return `批量导出 (${props.modelCount} 个模型)`
  }
  return `单个模型: ${props.modelName}`
})

// 监听格式变化，自动设置binary选项
watch(() => options.value.format, (format) => {
  options.value.binary = format === 'glb'
})

const close = () => {
  if (!exporting.value) {
    emit('close')
  }
}

const handleExport = async () => {
  exporting.value = true
  try {
    emit('export', { ...options.value })
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.export-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.export-dialog {
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #40a9ff;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dialog-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.export-info {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.info-item .value {
  color: #40a9ff;
  font-weight: 500;
  font-size: 13px;
}

.option-group {
  margin-bottom: 16px;
}

.option-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.format-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  padding: 6px 8px;
  font-size: 12px;
  min-width: 120px;
}

.format-select:focus {
  outline: none;
  border-color: #40a9ff;
  background: rgba(255, 255, 255, 0.15);
}

.checkbox-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  user-select: none;
}

.checkbox-option input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  margin-right: 10px;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox-option input[type="checkbox"]:checked + .checkmark {
  background: #40a9ff;
  border-color: #40a9ff;
}

.checkbox-option input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  left: 2px;
  top: -1px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-option:hover .checkmark {
  border-color: #40a9ff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.cancel-btn, .export-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.export-btn {
  background: #40a9ff;
  color: white;
  border: 1px solid #40a9ff;
}

.export-btn:hover:not(:disabled) {
  background: #1890ff;
  border-color: #1890ff;
}

.export-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
}

/* 滚动条样式 */
.dialog-content::-webkit-scrollbar {
  width: 4px;
}

.dialog-content::-webkit-scrollbar-track {
  background: transparent;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style> 