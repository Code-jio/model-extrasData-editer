<template>
  <div class="user-data-editor">
    <div class="editor-header">
      <h3>自定义属性</h3>
      <button @click="addCustomField" class="add-btn">
        <span class="icon">+</span>
        添加字段
      </button>
    </div>

    <div class="user-data-form">
      <div v-for="(value, key) in localUserData" :key="key" class="field-group">
        <div class="field-input">
          <input
            v-model="tempKeys[key]"
            type="text"
            placeholder="字段名"
            class="key-input"
            @blur="finalizeKeyName(key, tempKeys[key])"
          />
          <input
            v-model="localUserData[key]"
            type="text"
            placeholder="字段值"
            class="value-input"
          />
          <button @click="removeField(key)" class="remove-btn">
            <span class="icon">×</span>
          </button>
        </div>
      </div>

      <div v-if="Object.keys(localUserData).length === 0" class="empty-state">
        <p>暂无自定义属性</p>
        <p class="hint">点击上方按钮添加自定义属性</p>
      </div>
    </div>

    <div class="actions">
      <button @click="saveUserData" class="save-btn" :disabled="!hasChanges">
        保存更改
      </button>
      <button @click="resetUserData" class="reset-btn">
        重置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelId: string
  userData: Record<string, any>
}>()

const emit = defineEmits<{
  save: [modelId: string, userData: Record<string, any>]
}>()

const originalUserData = ref<Record<string, any>>({})
const localUserData = ref<Record<string, any>>({})
const tempKeys = ref<Record<string, string>>({})

// 初始化数据
const initializeData = () => {
  const userData = props.userData || {}
  originalUserData.value = { ...userData }
  localUserData.value = { ...userData }
  
  // 初始化临时键名
  tempKeys.value = {}
  Object.keys(userData).forEach(key => {
    tempKeys.value[key] = key
  })
}

// 监听属性变化
watch(() => props.userData, initializeData, { immediate: true })

// 检查是否有更改
const hasChanges = computed(() => {
  return JSON.stringify(localUserData.value) !== JSON.stringify(originalUserData.value)
})

// 添加自定义字段
const addCustomField = () => {
  const newKey = `custom_${Date.now()}`
  localUserData.value[newKey] = ''
  tempKeys.value[newKey] = newKey
  console.log('添加新字段:', newKey)
}

// 移除字段
const removeField = (key: string) => {
  delete localUserData.value[key]
  delete tempKeys.value[key]
}

// 最终确定键名
const finalizeKeyName = (oldKey: string, newKey: string) => {
  if (newKey !== oldKey && newKey.trim() !== '') {
    const value = localUserData.value[oldKey]
    if (value !== undefined) {
      // 删除旧键
      delete localUserData.value[oldKey]
      
      // 添加新键
      localUserData.value[newKey] = value
      
      // 更新tempKeys
      delete tempKeys.value[oldKey]
      tempKeys.value[newKey] = newKey
      
      console.log('键名更新:', oldKey, '->', newKey)
    }
  } else if (newKey.trim() === '') {
    // 如果新键名为空，恢复原始键名
    tempKeys.value[oldKey] = oldKey
  }
}

// 保存用户数据
const saveUserData = () => {
  try {
    console.log('开始保存用户数据...')
    console.log('原始数据:', localUserData.value)

    // 清理空值
    const cleanUserData: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(localUserData.value)) {
      // 跳过空值
      if (value === '' || value === null || value === undefined) {
        console.log(`跳过空值: ${key}=${value}`)
        continue
      }
      
      // 类型转换
      let processedValue = value
      
      // 字符串转数字
      if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        // 确保不是空字符串后再转换为数字
        processedValue = Number(value)
      }
      
      // 字符串转布尔值
      if (typeof value === 'string') {
        if (value === 'true') {
          processedValue = true
        } else if (value === 'false') {
          processedValue = false
        }
        // 其他字符串值保持原样
      }
      
      cleanUserData[key] = processedValue
    }

    console.log('清理后的数据:', cleanUserData)

    // 发送保存事件
    emit('save', props.modelId, cleanUserData)
    
    // 更新原始数据
    originalUserData.value = { ...cleanUserData }
    
  } catch (error) {
    console.error('保存用户数据时出错:', error)
  }
}

// 重置数据
const resetUserData = () => {
  localUserData.value = { ...originalUserData.value }
  
  // 重置tempKeys
  tempKeys.value = {}
  Object.keys(originalUserData.value).forEach(key => {
    tempKeys.value[key] = key
  })
  
  console.log('数据已重置')
}
</script>

<style scoped>
.user-data-editor {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background: #40a9ff;
}

.add-btn .icon {
  font-size: 14px;
}

.user-data-form {
  margin-bottom: 16px;
}

.field-group {
  margin-bottom: 12px;
}

.field-input {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
  min-width: 0;
}

.key-input,
.value-input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.key-input:focus,
.value-input:focus {
  outline: none;
  border-color: #1890ff;
}

.key-input {
  flex: 0 1 30%;
  max-width: 120px;
}

.value-input {
  flex: 1 1 60%;
  min-width: 80px;
}

.remove-btn {
  flex: 0 0 auto;
  padding: 4px 8px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #ff7875;
}

.remove-btn .icon {
  font-size: 12px;
  line-height: 1;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: #666;
}

.empty-state p {
  margin: 4px 0;
}

.empty-state .hint {
  font-size: 12px;
  color: #999;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* 响应式样式 */
@media (max-width: 480px) {
  .field-input {
    gap: 6px;
  }
  
  .key-input {
    max-width: 100px;
    font-size: 13px;
    padding: 6px 8px;
  }
  
  .value-input {
    min-width: 60px;
    font-size: 13px;
    padding: 6px 8px;
  }
  
  .remove-btn {
    padding: 3px 6px;
    font-size: 12px;
  }
  
  .editor-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .add-btn {
    justify-content: center;
  }
}

/* 防止文本溢出 */
.key-input,
.value-input {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.value-input {
  white-space: pre-wrap;
  word-break: break-word;
}

.save-btn,
.reset-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: #52c41a;
  color: white;
  border-color: #52c41a;
}

.save-btn:hover:not(:disabled) {
  background: #73d13d;
  border-color: #73d13d;
}

.save-btn:disabled {
  background: #d9d9d9;
  border-color: #d9d9d9;
  cursor: not-allowed;
}

.reset-btn {
  background: white;
  color: #666;
}

.reset-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}
</style>