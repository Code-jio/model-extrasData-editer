import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import Stats from 'stats.js'
import type { ModelInfo, SceneConfig, CameraConfig, LightConfig } from '@/types'

export class ThreeScene {
  private container: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls!: OrbitControls
  private directionalLight!: THREE.DirectionalLight
  private ambientLight!: THREE.AmbientLight
  private hemisphereLight!: THREE.HemisphereLight
  private pointLight1!: THREE.PointLight
  private pointLight2!: THREE.PointLight
  
  // 性能统计
  private stats!: Stats
  
  // 加载器
  private gltfLoader!: GLTFLoader
  private dracoLoader!: DRACOLoader
  private objLoader!: OBJLoader
  private fbxLoader!: FBXLoader
  
  // 模型管理
  private models = new Map<string, ModelInfo>()
  private modelGroup!: THREE.Group
  
  // 文件URL管理
  private blobUrls = new Set<string>()
  // 资源映射 - 文件名到blob URL的映射
  private resourceMap = new Map<string, string>()
  
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
      intensity: 2.0, // 进一步增强方向光
      position: { x: 10, y: 10, z: 5 }
    },
    ambientLight: {
      color: 0x404040,
      intensity: 1.0 // 显著增强环境光
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
    this.createStats()
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
    this.renderer.toneMappingExposure = 1.8 // 增加曝光值以提升整体亮度
    
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
    
    // 半球光 - 提供天空和地面的渐变光照
    this.hemisphereLight = new THREE.HemisphereLight(
      0x87CEEB, // 天空颜色 (天空蓝)
      0x444444, // 地面颜色 (深灰)
      0.8       // 强度
    )
    this.scene.add(this.hemisphereLight)
    
    // 补充点光源1 - 左侧照明
    this.pointLight1 = new THREE.PointLight(0xffffff, 1.5, 100)
    this.pointLight1.position.set(-15, 8, 10)
    this.scene.add(this.pointLight1)
    
    // 补充点光源2 - 右侧照明
    this.pointLight2 = new THREE.PointLight(0xffffff, 1.5, 100)
    this.pointLight2.position.set(15, 8, -10)
    this.scene.add(this.pointLight2)
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
    const gridHelper = new THREE.GridHelper(2000, 2000, 0x444444, 0x222222)
    this.scene.add(gridHelper)
  }

  private createStats() {
    this.stats = new Stats()
    this.stats.dom.style.position = 'absolute'
    this.stats.dom.style.top = '0px'
    this.stats.dom.style.left = '0px'
    this.stats.dom.style.zIndex = '100'
    this.container.appendChild(this.stats.dom)
  }

  private setupLoaders() {
    // DRACO加载器 (用于压缩模型)
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    this.dracoLoader.setDecoderConfig({ type: 'js' })
    
    // 创建自定义LoadingManager来处理资源映射
    const loadingManager = new THREE.LoadingManager()
    loadingManager.setURLModifier((url) => {
      // 如果URL是相对路径，尝试从资源映射中查找
      const fileName = url.split('/').pop() || url
      const mappedUrl = this.resourceMap.get(fileName)
      if (mappedUrl) {
        console.log(`资源映射: ${fileName} -> ${mappedUrl}`)
        return mappedUrl
      }
      return url
    })
    
    // GLTF加载器
    this.gltfLoader = new GLTFLoader(loadingManager)
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
    
    // OBJ加载器
    this.objLoader = new OBJLoader(loadingManager)
    
    // FBX加载器
    this.fbxLoader = new FBXLoader(loadingManager)
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
    
    this.stats.begin()
    
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    
    this.stats.end()
  }

  // 单个模型加载方法（推荐使用批量加载方法）
  async loadModel(file: File): Promise<ModelInfo> {
    console.log('注意：建议使用批量加载方法以获得更好的资源处理效果')
    return this.loadModels([file]).then(results => {
      if (results.length > 0) {
        return results[0]
      } else {
        throw new Error('模型加载失败')
      }
    })
  }

  // 批量模型加载方法 - 更好地处理相关文件
  async loadModels(files: File[]): Promise<ModelInfo[]> {
    const results: ModelInfo[] = []
    const fileUrls = new Map<string, string>()
    
    console.log(`开始批量加载 ${files.length} 个文件`)
    
    // 为所有文件创建blob URLs并建立映射
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      fileUrls.set(file.name, url)
      this.blobUrls.add(url)
      
      // 建立资源映射关系
      this.resourceMap.set(file.name, url)
      // 也尝试URL编码的文件名
      this.resourceMap.set(encodeURIComponent(file.name), url)
      
      console.log(`映射文件: ${file.name} -> ${url}`)
    })
    
    // 只处理主模型文件（.gltf, .glb, .obj, .fbx）
    const modelFiles = files.filter(file => {
      const fileName = file.name.toLowerCase()
      return fileName.endsWith('.gltf') || fileName.endsWith('.glb') || 
             fileName.endsWith('.obj') || fileName.endsWith('.fbx')
    })
    
    console.log(`找到 ${modelFiles.length} 个主模型文件`)
    
    try {
      for (const file of modelFiles) {
        try {
          const startTime = Date.now()
          const fileName = file.name.toLowerCase()
          const fileUrl = fileUrls.get(file.name)!
          
          console.log(`正在加载模型: ${file.name}`)
          
          let object: THREE.Object3D | THREE.Group
          
          if (fileName.endsWith('.gltf') || fileName.endsWith('.glb')) {
            const gltf = await this.loadGLTF(fileUrl)
            object = gltf.scene
          } else if (fileName.endsWith('.obj')) {
            object = await this.loadOBJ(fileUrl)
          } else if (fileName.endsWith('.fbx')) {
            object = await this.loadFBX(fileUrl)
          } else {
            continue
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
            loadTime: Date.now() - startTime,
            visible: true
          }
          
          // 添加到场景
          this.modelGroup.add(object)
          this.models.set(modelInfo.id, modelInfo)
          
          results.push(modelInfo)
          
          console.log(`成功加载模型: ${file.name}`)
          
        } catch (error) {
          console.error(`加载模型 ${file.name} 失败:`, error)
          // 不抛出错误，继续加载其他模型
        }
      }
      
      // 自动适配相机
      if (results.length > 0) {
        this.fitCameraToModels()
      }
      
      return results
      
    } finally {
      // 延迟释放所有URLs和清理资源映射
      setTimeout(() => {
        fileUrls.forEach((url, fileName) => {
          if (this.blobUrls.has(url)) {
            URL.revokeObjectURL(url)
            this.blobUrls.delete(url)
          }
          // 清理资源映射
          this.resourceMap.delete(fileName)
          this.resourceMap.delete(encodeURIComponent(fileName))
        })
        console.log('已清理所有blob URLs和资源映射')
      }, 5000) // 5秒延迟，给足够时间加载资源
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

  toggleModelVisibility(modelId: string): boolean | null {
    const model = this.models.get(modelId)
    if (model) {
      // 切换模型可见性
      model.visible = !model.visible
      model.object.visible = model.visible
      return model.visible
    }
    return null
  }

  showAllModels() {
    // 显示所有模型
    this.models.forEach(model => {
      model.visible = true
      model.object.visible = true
    })
  }

  hideAllModels() {
    // 隐藏所有模型
    this.models.forEach(model => {
      model.visible = false
      model.object.visible = false
    })
  }

  dispose() {
    // 清理所有blob URLs
    this.blobUrls.forEach(url => URL.revokeObjectURL(url))
    this.blobUrls.clear()
    
    // 清理资源映射
    this.resourceMap.clear()
    
    // 清理性能统计
    if (this.stats && this.stats.dom) {
      this.container.removeChild(this.stats.dom)
    }
    
    this.renderer.dispose()
    this.dracoLoader.dispose()
    window.removeEventListener('resize', this.handleResize.bind(this))
    
    console.log('ThreeScene已完全清理')
  }
} 