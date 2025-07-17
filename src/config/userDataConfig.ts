// userData 属性配置文件
export interface UserDataAttribute {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color'
  defaultValue?: any
  options?: string[] // 用于select类型
  placeholder?: string
  description?: string
  required?: boolean
}

export interface UserDataCategory {
  name: string
  label: string
  icon: string
  attributes: UserDataAttribute[]
}

// 预定义的userData属性配置
export const userDataConfig: UserDataCategory[] = [
  {
    name: 'basic',
    label: '基础属性',
    icon: '📝',
    attributes: [
      {
        key: 'description',
        label: '描述',
        type: 'string',
        placeholder: '输入对象描述...',
        description: '对象的详细描述信息'
      },
      {
        key: 'tag',
        label: '标签',
        type: 'string',
        placeholder: '输入标签...',
        description: '用于分类的标签'
      },
      {
        key: 'version',
        label: '版本',
        type: 'string',
        defaultValue: '1.0.0',
        placeholder: '1.0.0',
        description: '对象版本号'
      }
    ]
  },
  {
    name: 'display',
    label: '显示属性',
    icon: '🎨',
    attributes: [
      {
        key: 'displayColor',
        label: '显示颜色',
        type: 'color',
        defaultValue: '#ffffff',
        description: '对象的显示颜色'
      },
      {
        key: 'opacity',
        label: '透明度',
        type: 'number',
        defaultValue: 1.0,
        description: '对象透明度 (0-1)'
      },
      {
        key: 'wireframe',
        label: '线框模式',
        type: 'boolean',
        defaultValue: false,
        description: '是否显示为线框'
      },
      {
        key: 'renderOrder',
        label: '渲染顺序',
        type: 'number',
        defaultValue: 0,
        description: '渲染时的优先级'
      }
    ]
  },
  {
    name: 'physics',
    label: '物理属性',
    icon: '⚡',
    attributes: [
      {
        key: 'mass',
        label: '质量',
        type: 'number',
        defaultValue: 1.0,
        description: '对象质量 (kg)'
      },
      {
        key: 'friction',
        label: '摩擦力',
        type: 'number',
        defaultValue: 0.5,
        description: '摩擦系数 (0-1)'
      },
      {
        key: 'bounciness',
        label: '弹性',
        type: 'number',
        defaultValue: 0.0,
        description: '弹性系数 (0-1)'
      },
      {
        key: 'physicsType',
        label: '物理类型',
        type: 'select',
        options: ['static', 'dynamic', 'kinematic'],
        defaultValue: 'static',
        description: '物理体类型'
      }
    ]
  },
  {
    name: 'interaction',
    label: '交互属性',
    icon: '🎮',
    attributes: [
      {
        key: 'clickable',
        label: '可点击',
        type: 'boolean',
        defaultValue: true,
        description: '是否可以被点击选中'
      },
      {
        key: 'hoverable',
        label: '可悬停',
        type: 'boolean',
        defaultValue: true,
        description: '是否可以悬停高亮'
      },
      {
        key: 'draggable',
        label: '可拖拽',
        type: 'boolean',
        defaultValue: false,
        description: '是否可以拖拽移动'
      },
      {
        key: 'interactionLevel',
        label: '交互级别',
        type: 'select',
        options: ['none', 'low', 'medium', 'high'],
        defaultValue: 'medium',
        description: '交互响应级别'
      }
    ]
  },
  {
    name: 'custom',
    label: '自定义属性',
    icon: '🔧',
    attributes: [
      {
        key: 'customKey',
        label: '自定义键',
        type: 'string',
        placeholder: '输入自定义属性名...',
        description: '自定义属性键名'
      },
      {
        key: 'customValue',
        label: '自定义值',
        type: 'string',
        placeholder: '输入自定义属性值...',
        description: '自定义属性值'
      }
    ]
  }
]

// 获取所有属性的平铺列表
export function getAllAttributes(): UserDataAttribute[] {
  return userDataConfig.flatMap(category => category.attributes)
}

// 根据键名获取属性配置
export function getAttributeByKey(key: string): UserDataAttribute | undefined {
  return getAllAttributes().find(attr => attr.key === key)
}

// 获取默认值
export function getDefaultUserData(): Record<string, any> {
  const defaultData: Record<string, any> = {}
  getAllAttributes().forEach(attr => {
    if (attr.defaultValue !== undefined) {
      defaultData[attr.key] = attr.defaultValue
    }
  })
  return defaultData
} 