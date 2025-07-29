import type { Object3D, Group, Mesh } from 'three'

export interface ModelInfo {
  id: string
  name: string
  object: Object3D | Group
  originalSize: number
  boundingBox: {
    min: { x: number; y: number; z: number }
    max: { x: number; y: number; z: number }
  }
  loadTime: number
  visible: boolean
  // 新增：支持子节点层级结构
  children: ModelInfo[]
  parent?: ModelInfo
  nodeType: 'root' | 'mesh' | 'group' | 'object'
  depth: number
  perfInfo?: { vertices: number; edges: number; faces: number }
}

export interface LoaderProgress {
  loaded: number
  total: number
  percentage: number
}

export interface SceneConfig {
  enableShadows: boolean
  backgroundColor: number
  fogEnabled: boolean
  fogColor: number
  fogNear: number
  fogFar: number
}

export interface CameraConfig {
  fov: number
  near: number
  far: number
  position: { x: number; y: number; z: number }
}

export interface LightConfig {
  directionalLight: {
    color: number
    intensity: number
    position: { x: number; y: number; z: number }
  }
  ambientLight: {
    color: number
    intensity: number
  }
}

// 导出配置接口
export interface ExportOptions {
  format: 'glb' | 'gltf'
  includeAnimations: boolean
  includeCustomMaterials: boolean
  onlyVisible: boolean
  preserveTransforms: boolean
  binary: boolean
}

// 导出结果接口
export interface ExportResult {
  success: boolean
  fileName: string
  data?: ArrayBuffer | object
  error?: string
} 