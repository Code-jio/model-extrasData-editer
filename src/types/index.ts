import type { Object3D, Group } from 'three'

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