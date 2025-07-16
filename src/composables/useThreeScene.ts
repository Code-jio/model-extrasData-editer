import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import type { ModelInfo, SceneConfig, CameraConfig, LightConfig } from '@/types'

export class ThreeScene {
  private container: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls!: OrbitControls
  private directionalLight!: THREE.DirectionalLight
  private ambientLight!: THREE.AmbientLight
  
  // 加载器
  private gltfLoader!: GLTFLoader
  private dracoLoader!: DRACOLoader
  private objLoader!: OBJLoader
  private fbxLoader!: FBXLoader
  
  // 模型管理
  private models = new Map<string, ModelInfo>()
  private modelGroup!: THREE.Group
  
  // 配置
  private sceneConfig: SceneConfig = {
    enableShadows: true,
    backgroundColor: 0x1a1a1a,
    fogEnabled: true,
    fogColor: 0x1a1a1a,
    fogNear: 10,
    fogFar: 1000
  }
  
  private cameraConfig: CameraConfig = {
    fov: 75,
    near: 0.1,
    far: 2000,
    position: { x: 5, y: 5, z: 5 }
  }
  
  private lightConfig: LightConfig = {
    directionalLight: {
      color: 0xffffff,
      intensity: 1,
      position: { x: 10, y: 10, z: 5 }
    },
    ambientLight: {
      color: 0x404040,
      intensity: 0.4
    }
  }

  constructor(container: HTMLElement) {
    this.container = container
  }

  init() {
    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.createLights()
    this.createControls()
    this.setupLoaders()
    this.setupEventListeners()
    this.animate()
  }

  private createScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.sceneConfig.backgroundColor)
    
    if (this.sceneConfig.fogEnabled) {
      this.scene.fog = new THREE.Fog(
        this.sceneConfig.fogColor,
        this.sceneConfig.fogNear,
        this.sceneConfig.fogFar
      )
    }
    
    // 创建模型组
    this.modelGroup = new THREE.Group()
    this.scene.add(this.modelGroup)
    
    // 添加网格地面
    this.createGrid()
  }

  private createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight
    this.camera = new THREE.PerspectiveCamera(
      this.cameraConfig.fov,
      aspect,
      this.cameraConfig.near,
      this.cameraConfig.far
    )
    
    this.camera.position.set(
      this.cameraConfig.position.x,
      this.cameraConfig.position.y,
      this.cameraConfig.position.z
    )
  }

  private createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    })
    
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    if (this.sceneConfig.enableShadows) {
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    }
    
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1
    
    this.container.appendChild(this.renderer.domElement)
  }

  private createLights() {
    // 方向光
    this.directionalLight = new THREE.DirectionalLight(
      this.lightConfig.directionalLight.color,
      this.lightConfig.directionalLight.intensity
    )
    
    this.directionalLight.position.set(
      this.lightConfig.directionalLight.position.x,
      this.lightConfig.directionalLight.position.y,
      this.lightConfig.directionalLight.position.z
    )
    
    if (this.sceneConfig.enableShadows) {
      this.directionalLight.castShadow = true
      this.directionalLight.shadow.mapSize.width = 2048
      this.directionalLight.shadow.mapSize.height = 2048
      this.directionalLight.shadow.camera.near = 0.5
      this.directionalLight.shadow.camera.far = 500
      this.directionalLight.shadow.camera.left = -50
      this.directionalLight.shadow.camera.right = 50
      this.directionalLight.shadow.camera.top = 50
      this.directionalLight.shadow.camera.bottom = -50
    }
    
    this.scene.add(this.directionalLight)
    
    // 环境光
    this.ambientLight = new THREE.AmbientLight(
      this.lightConfig.ambientLight.color,
      this.lightConfig.ambientLight.intensity
    )
    
    this.scene.add(this.ambientLight)
  }

  private createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 1
    this.controls.maxDistance = 100
    this.controls.autoRotate = false
    this.controls.autoRotateSpeed = 1
  }

  private createGrid() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
    this.scene.add(gridHelper)
  }

  private setupLoaders() {
    // DRACO加载器 (用于压缩模型)
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    this.dracoLoader.setDecoderConfig({ type: 'js' })
    
    // GLTF加载器
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
    
    // OBJ加载器
    this.objLoader = new OBJLoader()
    
    // FBX加载器
    this.fbxLoader = new FBXLoader()
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  private handleResize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    
    this.renderer.setSize(width, height)
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this))
    
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  // 模型加载方法
  async loadModel(file: File): Promise<ModelInfo> {
    const startTime = Date.now()
    const fileName = file.name.toLowerCase()
    const fileUrl = URL.createObjectURL(file)
    
    let object: THREE.Object3D | THREE.Group
    
    try {
      if (fileName.endsWith('.gltf') || fileName.endsWith('.glb')) {
        const gltf = await this.loadGLTF(fileUrl)
        object = gltf.scene
      } else if (fileName.endsWith('.obj')) {
        object = await this.loadOBJ(fileUrl)
      } else if (fileName.endsWith('.fbx')) {
        object = await this.loadFBX(fileUrl)
      } else {
        throw new Error('不支持的文件格式')
      }
      
      // 处理模型
      this.processModel(object)
      
      // 计算边界盒
      const box = new THREE.Box3().setFromObject(object)
      const size = box.getSize(new THREE.Vector3()).length()
      
      // 创建模型信息
      const modelInfo: ModelInfo = {
        id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        object,
        originalSize: size,
        boundingBox: {
          min: { x: box.min.x, y: box.min.y, z: box.min.z },
          max: { x: box.max.x, y: box.max.y, z: box.max.z }
        },
        loadTime: Date.now() - startTime
      }
      
      // 添加到场景
      this.modelGroup.add(object)
      this.models.set(modelInfo.id, modelInfo)
      
      // 自动适配相机
      this.fitCameraToModels()
      
      return modelInfo
      
    } finally {
      URL.revokeObjectURL(fileUrl)
    }
  }

  private loadGLTF(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        resolve,
        (progress) => {
          console.log('GLTF加载进度:', (progress.loaded / progress.total) * 100 + '%')
        },
        reject
      )
    })
  }

  private loadOBJ(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.objLoader.load(url, resolve, undefined, reject)
    })
  }

  private loadFBX(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(url, resolve, undefined, reject)
    })
  }

  private processModel(object: THREE.Object3D) {
    // 启用阴影
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        
        // 确保材质正确
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.needsUpdate = true
              }
            })
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.needsUpdate = true
          }
        }
      }
    })
  }

  private fitCameraToModels() {
    if (this.models.size === 0) return
    
    const box = new THREE.Box3()
    this.models.forEach(model => {
      const modelBox = new THREE.Box3().setFromObject(model.object)
      box.union(modelBox)
    })
    
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxSize = Math.max(size.x, size.y, size.z)
    const distance = maxSize / (2 * Math.tan(Math.PI * this.camera.fov / 360))
    
    this.camera.position.copy(center)
    this.camera.position.y += distance * 0.5
    this.camera.position.z += distance * 1.5
    this.camera.lookAt(center)
    
    this.controls.target.copy(center)
    this.controls.update()
  }

  // 控制方法
  updateLightIntensity(intensity: number) {
    this.directionalLight.intensity = intensity
  }

  updateAmbientLight(intensity: number) {
    this.ambientLight.intensity = intensity
  }

  resetCamera() {
    this.camera.position.set(
      this.cameraConfig.position.x,
      this.cameraConfig.position.y,
      this.cameraConfig.position.z
    )
    this.controls.target.set(0, 0, 0)
    this.controls.update()
  }

  clearModels() {
    this.models.forEach(model => {
      this.modelGroup.remove(model.object)
    })
    this.models.clear()
  }

  removeModel(modelId: string) {
    const model = this.models.get(modelId)
    if (model) {
      this.modelGroup.remove(model.object)
      this.models.delete(modelId)
    }
  }

  focusOnModel(modelId: string) {
    const model = this.models.get(modelId)
    if (model) {
      const box = new THREE.Box3().setFromObject(model.object)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      const distance = maxSize / (2 * Math.tan(Math.PI * this.camera.fov / 360))
      
      this.camera.position.copy(center)
      this.camera.position.y += distance * 0.5
      this.camera.position.z += distance * 1.5
      this.camera.lookAt(center)
      
      this.controls.target.copy(center)
      this.controls.update()
    }
  }

  dispose() {
    this.renderer.dispose()
    this.dracoLoader.dispose()
    window.removeEventListener('resize', this.handleResize.bind(this))
  }
} 