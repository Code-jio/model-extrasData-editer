<template>
  <div class="userdata-section" v-if="selectedObjectInfo && showUserDataPanel">
    <div class="section-header">
      <span class="section-icon">🏷️</span>
      <span class="section-title">对象属性</span>
    </div>
    
    <!-- 分类选择 -->
    <div class="category-tabs">
      <button 
        v-for="category in userDataConfig" 
        :key="category.name"
        @click="activeCategory = category.name"
        :class="['category-tab', { active: activeCategory === category.name }]"
        :title="category.label"
      >
        <span class="tab-icon">{{ category.icon }}</span>
        <span class="tab-text">{{ category.label }}</span>
      </button>
    </div>
    
    <!-- 添加属性选择器 -->
    <div class="add-attribute-section">
      <select 
        class="add-attribute-select"
        @change="addNewAttribute($event)"
        v-model="selectedAttributeToAdd"
      >
        <option value="">+ 添加属性...</option>
        <template v-for="category in userDataConfig" :key="category.name">
          <optgroup :label="category.label">
            <option 
              v-for="attribute in category.attributes" 
              :key="attribute.key"
              :value="attribute.key"
              :disabled="selectedUserData[attribute.key] !== undefined"
            >
              {{ attribute.label }}
            </option>
          </optgroup>
        </template>
      </select>
    </div>

    <!-- 属性编辑区域 -->
    <div class="attributes-container">
      <template v-for="category in userDataConfig" :key="category.name">
        <div v-if="activeCategory === category.name" class="attributes-list">
          <div 
            v-for="attribute in getFilteredAttributesForCategory(category)" 
            :key="attribute.key"
            class="attribute-item"
          >
            <label class="attribute-label">
              {{ attribute.label }}
              <span v-if="attribute.description" class="attribute-desc" :title="attribute.description">?</span>
            </label>
            
            <!-- 字符串输入 -->
            <input 
              v-if="attribute.type === 'string'"
              type="text"
              class="attribute-input"
              :placeholder="attribute.placeholder || ''"
              :value="selectedUserData[attribute.key] || ''"
              @input="updateUserDataAttribute(attribute.key, ($event.target as HTMLInputElement).value)"
            />
            
            <!-- 数字输入 -->
            <input 
              v-else-if="attribute.type === 'number'"
              type="number"
              step="0.1"
              class="attribute-input"
              :value="selectedUserData[attribute.key] || attribute.defaultValue || 0"
              @input="updateUserDataAttribute(attribute.key, parseFloat(($event.target as HTMLInputElement).value))"
            />
            
            <!-- 布尔值选择 -->
            <div v-else-if="attribute.type === 'boolean'" class="boolean-input">
              <input 
                type="checkbox"
                :id="`attr-${attribute.key}`"
                :checked="selectedUserData[attribute.key] || attribute.defaultValue || false"
                @change="updateUserDataAttribute(attribute.key, ($event.target as HTMLInputElement).checked)"
              />
              <label :for="`attr-${attribute.key}`" class="checkbox-label">
                {{ selectedUserData[attribute.key] ? '是' : '否' }}
              </label>
            </div>
            
            <!-- 下拉选择 -->
            <select 
              v-else-if="attribute.type === 'select'"
              class="attribute-select"
              :value="selectedUserData[attribute.key] || attribute.defaultValue"
              @change="updateUserDataAttribute(attribute.key, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">请选择...</option>
              <option 
                v-for="option in attribute.options" 
                :key="option" 
                :value="option"
              >
                {{ option }}
              </option>
            </select>
            
            <!-- 颜色选择 -->
            <input 
              v-else-if="attribute.type === 'color'"
              type="color"
              class="attribute-color"
              :value="selectedUserData[attribute.key] || attribute.defaultValue || '#ffffff'"
              @input="updateUserDataAttribute(attribute.key, ($event.target as HTMLInputElement).value)"
            />
            
            <!-- 删除按钮 -->
            <button 
              v-if="selectedUserData[attribute.key] !== undefined"
              class="remove-attribute-btn"
              @click="removeUserDataAttribute(attribute.key)"
              title="删除此属性"
            >
              ×
            </button>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 操作按钮 -->
    <div class="userdata-actions">
      <button @click="emit('clearAllUserData')" class="action-btn danger">
        🗑️ 清空所有属性
      </button>
      <button @click="emit('exportUserData')" class="action-btn">
        📋 导出属性
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userDataConfig, type UserDataCategory } from '@/config/userDataConfig'

const props = defineProps<{
  selectedObjectInfo: { name: string, type: string, modelId?: string } | null
  showUserDataPanel: boolean
  selectedUserData: Record<string, any>
}>()

const emit = defineEmits<{
  updateUserData: [key: string, value: any]
  removeUserData: [key: string]
  clearAllUserData: []
  exportUserData: []
}>()

const activeCategory = ref<string>('basic')
const selectedAttributeToAdd = ref<string>('')

// 获取当前分类下已有的属性
const getFilteredAttributesForCategory = (category: UserDataCategory) => {
  return category.attributes.filter((attr: any) => 
    props.selectedUserData[attr.key] !== undefined
  )
}

// 添加新属性
const addNewAttribute = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const attributeKey = select.value
  
  if (!attributeKey) return
  
  // 找到对应的属性配置
  const attribute = userDataConfig.flatMap(cat => cat.attributes)
    .find(attr => attr.key === attributeKey)
  
  if (attribute && props.selectedUserData[attributeKey] === undefined) {
    const defaultValue = attribute.defaultValue !== undefined 
      ? attribute.defaultValue 
      : getDefaultValueByType(attribute.type)
    
    updateUserDataAttribute(attributeKey, defaultValue)
    
    // 切换到对应的分类
    const category = userDataConfig.find(cat => 
      cat.attributes.some(attr => attr.key === attributeKey)
    )
    if (category) {
      activeCategory.value = category.name
    }
  }
  
  // 重置选择器
  selectedAttributeToAdd.value = ''
}

// 根据类型获取默认值
const getDefaultValueByType = (type: string): any => {
  switch (type) {
    case 'string': return ''
    case 'number': return 0
    case 'boolean': return false
    case 'color': return '#ffffff'
    case 'select': return ''
    default: return ''
  }
}

const updateUserDataAttribute = (key: string, value: any) => {
  emit('updateUserData', key, value)
}

const removeUserDataAttribute = (key: string) => {
  emit('removeUserData', key)
}
</script>

<style scoped>
/* UserData 编辑面板样式 */
.userdata-section {
  background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #555;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  max-height: 400px;
  overflow-y: auto;
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

.category-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.category-tab {
  background: linear-gradient(135deg, #444 0%, #555 100%);
  border: 1px solid #666;
  color: white;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 9px;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;
}

.category-tab:hover {
  background: linear-gradient(135deg, #555 0%, #666 100%);
  transform: translateY(-1px);
}

.category-tab.active {
  background: linear-gradient(135deg, #007acc 0%, #0088dd 100%);
  border-color: #007acc;
  box-shadow: 0 0 8px rgba(0, 122, 204, 0.3);
}

.tab-icon {
  font-size: 12px;
  margin-bottom: 2px;
}

.tab-text {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-attribute-section {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.add-attribute-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #007acc;
  border-radius: 4px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-attribute-select:hover {
  border-color: #40a9ff;
  box-shadow: 0 0 6px rgba(0, 122, 204, 0.3);
}

.add-attribute-select:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 8px rgba(0, 122, 204, 0.4);
}

.add-attribute-select option:disabled {
  color: #666;
  font-style: italic;
}

.attributes-container {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 4px;
}

.attributes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attribute-item {
  background: rgba(0, 0, 0, 0.2);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: background-color 0.2s ease;
}

.attribute-item:hover {
  background: rgba(0, 0, 0, 0.3);
}

.attribute-label {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: bold;
  color: #007acc;
  margin-bottom: 4px;
  cursor: help;
}

.attribute-desc {
  display: inline-block;
  width: 14px;
  height: 14px;
  line-height: 14px;
  text-align: center;
  background: #007acc;
  color: white;
  border-radius: 50%;
  font-size: 8px;
  margin-left: 4px;
  cursor: help;
}

/* 输入样式 */
.attribute-input,
.attribute-select {
  width: 100%;
  max-width: 100%;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 10px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.attribute-input:focus,
.attribute-select:focus {
  outline: none;
  border-color: #40a9ff;
  background: rgba(255, 255, 255, 0.15);
}

.attribute-color {
  width: 100%;
  max-width: 100%;
  height: 24px;
  padding: 1px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  box-sizing: border-box;
}

.boolean-input {
  display: flex;
  align-items: center;
  gap: 4px;
}

.boolean-input input[type="checkbox"] {
  width: 12px;
  height: 12px;
  accent-color: #40a9ff;
}

.checkbox-label {
  font-size: 10px;
  color: #ccc;
  cursor: pointer;
}

.remove-attribute-btn {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  background: #ff6b6b;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.attribute-item:hover .remove-attribute-btn {
  opacity: 1;
}

.remove-attribute-btn:hover {
  background: #ff4444;
  transform: scale(1.1);
}

.userdata-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  background: linear-gradient(135deg, #444 0%, #555 100%);
  border: 1px solid #666;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.3s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn:hover {
  background: linear-gradient(135deg, #555 0%, #666 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.action-btn.danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  border-color: #ff4444;
}

.action-btn.danger:hover {
  background: linear-gradient(135deg, #ff4444 0%, #ff3333 100%);
  box-shadow: 0 2px 6px rgba(255, 68, 68, 0.3);
}

/* 滚动条样式 */
.attributes-container::-webkit-scrollbar,
.userdata-section::-webkit-scrollbar {
  width: 4px;
}

.attributes-container::-webkit-scrollbar-track,
.userdata-section::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.attributes-container::-webkit-scrollbar-thumb,
.userdata-section::-webkit-scrollbar-thumb {
  background: #40a9ff;
  border-radius: 2px;
}

.attributes-container::-webkit-scrollbar-thumb:hover,
.userdata-section::-webkit-scrollbar-thumb:hover {
  background: #1890ff;
}

/* 基础样式 */
.user-data-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 3px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 12px;
  color: #40a9ff;
  font-weight: 600;
  margin: 0;
}

.panel-actions {
  display: flex;
  gap: 3px;
}

.action-btn {
  padding: 3px 6px;
  border: none;
  border-radius: 3px;
  font-size: 9px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.export {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
  border: 1px solid rgba(82, 196, 26, 0.3);
}

.action-btn.export:hover {
  background: rgba(82, 196, 26, 0.3);
}

.action-btn.clear {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.action-btn.clear:hover {
  background: rgba(255, 107, 107, 0.3);
}
</style> 