import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import Stats from "stats.js";
import type {
  ModelInfo,
  SceneConfig,
  CameraConfig,
  LightConfig,
  ExportOptions,
  ExportResult,
} from "@/types";

window.THREE = THREE;
export class ThreeScene {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private transformControls!: TransformControls;
  private directionalLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private hemisphereLight!: THREE.HemisphereLight;
  private pointLight1!: THREE.PointLight;
  private pointLight2!: THREE.PointLight;

  // 鼠标交互
  private raycaster!: THREE.Raycaster;
  private mouse = new THREE.Vector2();
  private selectedObject: THREE.Object3D | null = null;

  // 相机动画
  private cameraAnimation = {
    isAnimating: false,
    startTime: 0,
    duration: 1000, // 动画时长(毫秒)
    startPosition: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    targetTarget: new THREE.Vector3(),
  };

  // 性能统计
  private stats!: Stats;

  // 加载器
  private gltfLoader!: GLTFLoader;
  private gltfExporter!: GLTFExporter;
  private dracoLoader!: DRACOLoader;
  private objLoader!: OBJLoader;
  private fbxLoader!: FBXLoader;

  // 模型管理
  private models = new Map<string, ModelInfo>();
  private modelGroup!: THREE.Group;

  // 文件URL管理
  private blobUrls = new Set<string>();
  // 资源映射 - 文件名到blob URL的映射
  private resourceMap = new Map<string, string>();

  // 配置
  private sceneConfig: SceneConfig = {
    enableShadows: false, // 关闭阴影以大幅提升性能
    backgroundColor: 0xf0f0f0,
    fogEnabled: true,
    fogColor: 0xf0f0f0,
    fogNear: 100,
    fogFar: 1000,
  };

  private cameraConfig: CameraConfig = {
    fov: 45,
    near: 0.1,
    far: 2000,
    position: { x: 5, y: 5, z: 5 },
  };

  private lightConfig: LightConfig = {
    directionalLight: {
      color: 0xffffff,
      intensity: 1.5, // 适度降低强度
      position: { x: 10, y: 10, z: 5 },
    },
    ambientLight: {
      color: 0x404040,
      intensity: 1.2, // 适度降低强度
    },
  };

  constructor(container: HTMLElement) {
    this.container = container;
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createControls();
    this.createStats();
    this.setupLoaders();
    this.setupRaycaster();
    this.setupEventListeners();
    this.animate();
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.sceneConfig.backgroundColor);
    console.log(this.scene, "scene");
    if (this.sceneConfig.fogEnabled) {
      this.scene.fog = new THREE.Fog(
        this.sceneConfig.fogColor,
        this.sceneConfig.fogNear,
        this.sceneConfig.fogFar
      );
    }

    // 创建模型组
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    // 添加网格地面
    this.createGrid();

    this.createAxes();
  }

  private createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      this.cameraConfig.fov,
      aspect,
      this.cameraConfig.near,
      this.cameraConfig.far
    );

    this.camera.position.set(
      this.cameraConfig.position.x,
      this.cameraConfig.position.y,
      this.cameraConfig.position.z
    );
  }

  private createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // 限制最大像素比

    if (this.sceneConfig.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2; // 降低曝光值以减少计算量

    this.container.appendChild(this.renderer.domElement);
  }

  private createLights() {
    // 方向光
    this.directionalLight = new THREE.DirectionalLight(
      this.lightConfig.directionalLight.color,
      this.lightConfig.directionalLight.intensity
    );

    this.directionalLight.position.set(
      this.lightConfig.directionalLight.position.x,
      this.lightConfig.directionalLight.position.y,
      this.lightConfig.directionalLight.position.z
    );

    // 移除阴影相关代码以提升性能

    this.scene.add(this.directionalLight);

    // 环境光
    this.ambientLight = new THREE.AmbientLight(
      this.lightConfig.ambientLight.color,
      this.lightConfig.ambientLight.intensity
    );

    this.scene.add(this.ambientLight);

    // 半球光 - 提供天空和地面的渐变光照
    this.hemisphereLight = new THREE.HemisphereLight(
      0x87ceeb, // 天空颜色 (天空蓝)
      0x444444, // 地面颜色 (深灰)
      0.5 // 降低强度以提升性能
    );
    this.scene.add(this.hemisphereLight);

    // 移除两个点光源以大幅提升性能
  }

  private createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false; // 关闭阻尼以减少计算
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 500; // 降低最大距离
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 1;

    // 创建变换控制器
    this.transformControls = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.transformControls.setMode("translate"); // 默认为平移模式
    this.transformControls.setSize(0.8); // 设置控制器大小
    this.scene.add(this.transformControls);

    // 当变换控制器被使用时，禁用轨道控制器
    this.transformControls.addEventListener("dragging-changed", (event) => {
      this.controls.enabled = !event.value;
    });

    // 默认隐藏变换控制器
    this.transformControls.visible = false;
  }

  private createGrid() {
    // 大幅减少网格尺寸和分割数以提升性能
    const gridHelper = new THREE.GridHelper(200, 50, 0x444444, 0x222222);
    this.scene.add(gridHelper);
  }

  private createAxes() {
    const axes = new THREE.AxesHelper(200);
    this.scene.add(axes);
  }

  private createStats() {
    this.stats = new Stats();
    this.stats.showPanel(0); // FPS
    // this.stats.showPanel(1); // MS
    // this.stats.showPanel(2); // MB
    this.stats.dom.style.position = "absolute";
    this.stats.dom.style.top = "0px";
    this.stats.dom.style.left = "0px";
    this.stats.dom.style.zIndex = "9999";
    this.container.appendChild(this.stats.dom);
  }

  private setupLoaders() {
    // DRACO加载器 (用于压缩模型)
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("./draco/");
    this.dracoLoader.setDecoderConfig({ type: "js" });

    // 创建自定义LoadingManager来处理资源映射
    const loadingManager = new THREE.LoadingManager();
    loadingManager.setURLModifier((url) => {
      // 如果URL是相对路径，尝试从资源映射中查找
      const fileName = url.split("/").pop() || url;
      const mappedUrl = this.resourceMap.get(fileName);
      if (mappedUrl) {
        console.log(`资源映射: ${fileName} -> ${mappedUrl}`);
        return mappedUrl;
      }
      return url;
    });

    // GLTF加载器
    this.gltfLoader = new GLTFLoader(loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // GLTF导出器
    this.gltfExporter = new GLTFExporter();

    // OBJ加载器
    this.objLoader = new OBJLoader(loadingManager);

    // FBX加载器
    this.fbxLoader = new FBXLoader(loadingManager);
  }

  private setupRaycaster() {
    this.raycaster = new THREE.Raycaster();
  }

  private setupEventListeners() {
    window.addEventListener("resize", this.handleResize.bind(this));
    this.renderer.domElement.addEventListener(
      "click",
      this.handleMouseClick.bind(this)
    );
  }

  private handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private handleMouseClick(event: MouseEvent) {
    // 计算鼠标位置（归一化设备坐标）
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 更新射线
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 获取所有可相交的对象（只检查模型组中的对象）
    const intersectables: THREE.Object3D[] = [];
    this.modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        intersectables.push(child);
      }
    });

    // 计算交点
    const intersects = this.raycaster.intersectObjects(intersectables, false);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;

      // 优先选择子节点：找到最深层的可选择对象
      let targetObject = this.findSelectableObject(clickedObject);

      if (targetObject) {
        this.selectObject(targetObject);
      }
    }
  }

  private findSelectableObject(
    clickedObject: THREE.Object3D
  ): THREE.Object3D | null {
    // 简化版本：直接返回点击的对象
    return clickedObject;
  }

  private getObjectDepthInModel(
    target: THREE.Object3D,
    current: THREE.Object3D,
    currentDepth: number
  ): number {
    if (current === target) {
      return currentDepth;
    }

    for (const child of current.children) {
      const depth = this.getObjectDepthInModel(target, child, currentDepth + 1);
      if (depth !== -1) {
        return depth;
      }
    }

    return -1;
  }

  private selectObject(object: THREE.Object3D) {
    this.selectedObject = object;

    // 将TransformControls附加到选中的对象
    this.transformControls.attach(object);
    this.transformControls.visible = true;

    // // 计算对象的边界和最佳观察位置
    // const box = new THREE.Box3().setFromObject(object)
    // const center = box.getCenter(new THREE.Vector3())
    // const size = box.getSize(new THREE.Vector3())
    // const maxSize = Math.max(size.x, size.y, size.z)

    // // 计算合适的观察距离
    // const distance = Math.max(maxSize * 2, 3) // 至少3个单位的距离

    // // 计算目标相机位置 - 相对于对象中心的偏移
    // const offset = new THREE.Vector3()
    // offset.copy(this.camera.position).sub(this.controls.target).normalize()

    // const targetPosition = new THREE.Vector3()
    // targetPosition.copy(center).add(offset.multiplyScalar(distance))

    // // 使用平滑动画移动相机到对象
    // this.animateCameraTo(targetPosition, center, 700) // 0.7秒动画

    console.log("选中对象:", object.name || "未命名对象", object);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.stats.begin();

    // 更新相机动画
    this.updateCameraAnimation();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }

  private updateCameraAnimation() {
    if (!this.cameraAnimation.isAnimating) return;

    const currentTime = Date.now();
    const elapsed = currentTime - this.cameraAnimation.startTime;
    const progress = Math.min(elapsed / this.cameraAnimation.duration, 1);

    // 使用easeInOutCubic缓动函数
    const easedProgress = this.easeInOutCubic(progress);

    // 插值相机位置
    this.camera.position.lerpVectors(
      this.cameraAnimation.startPosition,
      this.cameraAnimation.targetPosition,
      easedProgress
    );

    // 插值控制器目标
    this.controls.target.lerpVectors(
      this.cameraAnimation.startTarget,
      this.cameraAnimation.targetTarget,
      easedProgress
    );

    // 动画完成
    if (progress >= 1) {
      this.cameraAnimation.isAnimating = false;
      this.camera.position.copy(this.cameraAnimation.targetPosition);
      this.controls.target.copy(this.cameraAnimation.targetTarget);
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private animateCameraTo(
    targetPosition: THREE.Vector3,
    targetLookAt: THREE.Vector3,
    duration = 1000
  ) {
    // 保存当前状态
    this.cameraAnimation.startPosition.copy(this.camera.position);
    this.cameraAnimation.startTarget.copy(this.controls.target);

    // 设置目标状态
    this.cameraAnimation.targetPosition.copy(targetPosition);
    this.cameraAnimation.targetTarget.copy(targetLookAt);

    // 开始动画
    this.cameraAnimation.startTime = Date.now();
    this.cameraAnimation.duration = duration;
    this.cameraAnimation.isAnimating = true;
  }

  // 单个模型加载方法（推荐使用批量加载方法）
  async loadModel(file: File): Promise<ModelInfo> {
    console.log("注意：建议使用批量加载方法以获得更好的资源处理效果");
    return this.loadModels([file]).then((results) => {
      if (results.length > 0) {
        return results[0];
      } else {
        throw new Error("模型加载失败");
      }
    });
  }

  // 批量模型加载方法 - 更好地处理相关文件
  async loadModels(files: File[]): Promise<ModelInfo[]> {
    const results: ModelInfo[] = [];
    const fileUrls = new Map<string, string>();

    console.log(`开始批量加载 ${files.length} 个文件`);

    // 为所有文件创建blob URLs并建立映射
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      fileUrls.set(file.name, url);
      this.blobUrls.add(url);

      // 建立资源映射关系
      this.resourceMap.set(file.name, url);
      // 也尝试URL编码的文件名
      this.resourceMap.set(encodeURIComponent(file.name), url);

      console.log(`映射文件: ${file.name} -> ${url}`);
    });

    // 只处理主模型文件（.gltf, .glb, .obj, .fbx）
    const modelFiles = files.filter((file) => {
      const fileName = file.name.toLowerCase();
      return (
        fileName.endsWith(".gltf") ||
        fileName.endsWith(".glb") ||
        fileName.endsWith(".obj") ||
        fileName.endsWith(".fbx")
      );
    });

    console.log(`找到 ${modelFiles.length} 个主模型文件`);

    try {
      for (const file of modelFiles) {
        try {
          const startTime = Date.now();
          const fileName = file.name.toLowerCase();
          const fileUrl = fileUrls.get(file.name)!;

          console.log(`正在加载模型: ${file.name}`);

          let object: THREE.Object3D | THREE.Group;

          if (fileName.endsWith(".gltf") || fileName.endsWith(".glb")) {
            const gltf = await this.loadGLTF(fileUrl);
            console.log(gltf, "gltf");
            object = gltf.scene;
          } else if (fileName.endsWith(".obj")) {
            object = await this.loadOBJ(fileUrl);
          } else if (fileName.endsWith(".fbx")) {
            object = await this.loadFBX(fileUrl);
          } else {
            continue;
          }

          // 处理模型
          this.processModel(object);

          // 计算边界盒
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3()).length();

          // 创建模型信息
          const modelInfo: ModelInfo = {
            id: `model_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            name: file.name,
            object,
            originalSize: size,
            boundingBox: {
              min: { x: box.min.x, y: box.min.y, z: box.min.z },
              max: { x: box.max.x, y: box.max.y, z: box.max.z },
            },
            loadTime: Date.now() - startTime,
            visible: true,
            children: [],
            nodeType: "root",
            depth: 0,
          };

          // 解析子节点
          this.parseChildNodes(object, modelInfo);

          // 新增：计算并缓存性能信息
          this.calculateAndCachePerfInfo(modelInfo);

          // 添加到场景
          this.modelGroup.add(object);
          this.models.set(modelInfo.id, modelInfo);
          results.push(modelInfo);
        } catch (error) {
          console.error(`加载模型 ${file.name} 失败:`, error);
          // 不抛出错误，继续加载其他模型
        }
      }

      // 自动适配相机
      if (results.length > 0) {
        this.fitCameraToModels();
      }

      return results;
    } finally {
      // 延迟释放所有URLs和清理资源映射
      setTimeout(() => {
        fileUrls.forEach((url, fileName) => {
          if (this.blobUrls.has(url)) {
            URL.revokeObjectURL(url);
            this.blobUrls.delete(url);
          }
          // 清理资源映射
          this.resourceMap.delete(fileName);
          this.resourceMap.delete(encodeURIComponent(fileName));
        });
        console.log("已清理所有blob URLs和资源映射");
      }, 5000); // 5秒延迟，给足够时间加载资源
    }
  }

  // ===== 新增：性能信息计算与缓存方法 =====
  /**
   * 计算并缓存模型及其所有子节点的性能信息（点/线/面）
   * 采用后序遍历，确保每个节点的统计信息包含其所有子节点
   * @param modelInfo 目标模型信息节点
   * @returns 当前节点及其所有子节点的性能信息总和
   */
  private calculateAndCachePerfInfo(modelInfo: ModelInfo): {
    vertices: number;
    edges: number;
    faces: number;
  } {
    // 1. 计算当前节点自身的性能数据
    const ownPerf = this._calculateObjectPerf(modelInfo.object);

    // 2. 递归调用子节点并累加其性能数据
    modelInfo.children.forEach((childInfo) => {
      const childTotalPerf = this.calculateAndCachePerfInfo(childInfo);
      ownPerf.vertices += childTotalPerf.vertices;
      ownPerf.edges += childTotalPerf.edges;
      ownPerf.faces += childTotalPerf.faces;
    });

    // 3. 将最终结果缓存到当前节点
    modelInfo.perfInfo = ownPerf;

    // 4. 返回总和，供父节点使用
    return ownPerf;
  }

  /**
   * (内部辅助方法) 计算单个对象的性能数据（非递归）
   * @param object 目标3D对象
   */
  private _calculateObjectPerf(object: THREE.Object3D): {
    vertices: number;
    edges: number;
    faces: number;
  } {
    const result = { vertices: 0, edges: 0, faces: 0 };
    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry;
      if (geometry) {
        const positionAttr = geometry.attributes.position;
        if (positionAttr) {
          result.vertices = positionAttr.count;
        }

        const indexCount = geometry.index
          ? geometry.index.count
          : positionAttr
            ? positionAttr.count
            : 0;
        result.faces = Math.floor(indexCount / 3);

        // EdgesGeometry 计算相对耗时，这是缓存的必要性所在
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        if (edgesGeometry.attributes.position) {
          result.edges = Math.floor(
            edgesGeometry.attributes.position.count / 2
          );
        }
        edgesGeometry.dispose();
      }
    }
    return result;
  }

  private loadGLTF(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        resolve,
        (progress) => {
          console.log(
            "GLTF加载进度:",
            (progress.loaded / progress.total) * 100 + "%"
          );
        },
        reject
      );
    });
  }

  private loadOBJ(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.objLoader.load(url, resolve, undefined, reject);
    });
  }

  private loadFBX(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(url, resolve, undefined, reject);
    });
  }

  private processModel(object: THREE.Object3D) {
    // 优化：仅进行必要的材质处理，移除阴影设置
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 移除阴影设置以提升性能
        // child.castShadow = true
        // child.receiveShadow = true

        // 确保材质正确
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.needsUpdate = true;
              }
            });
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }

  private parseChildNodes(object: THREE.Object3D, parentInfo: ModelInfo) {
    object.children.forEach((child, index) => {
      if (child.children.length > 0 || child instanceof THREE.Mesh) {
        const childInfo: ModelInfo = {
          id: `${parentInfo.id}_child_${index}_${Date.now()}`,
          name: child.name || `${this.getNodeTypeName(child)} ${index + 1}`,
          object: child,
          originalSize: 0, // 子节点不计算大小
          boundingBox: {
            min: { x: 0, y: 0, z: 0 },
            max: { x: 0, y: 0, z: 0 },
          },
          loadTime: 0,
          visible: true,
          children: [],
          parent: parentInfo,
          nodeType: this.getNodeType(child),
          depth: parentInfo.depth + 1,
        };

        parentInfo.children.push(childInfo);
        this.models.set(childInfo.id, childInfo);

        // 递归解析子节点的子节点
        if (child.children.length > 0) {
          this.parseChildNodes(child, childInfo);
        }
      }
    });
  }

  private getNodeType(object: THREE.Object3D): "mesh" | "group" | "object" {
    if (object instanceof THREE.Mesh) {
      return "mesh";
    } else if (object instanceof THREE.Group) {
      return "group";
    } else {
      return "object";
    }
  }

  private getNodeTypeName(object: THREE.Object3D): string {
    if (object instanceof THREE.Mesh) {
      return "Mesh";
    } else if (object instanceof THREE.Group) {
      return "Group";
    } else {
      return "Object3D";
    }
  }

  private fitCameraToModels() {
    if (this.models.size === 0) return;

    const box = new THREE.Box3();
    this.models.forEach((model) => {
      const modelBox = new THREE.Box3().setFromObject(model.object);
      box.union(modelBox);
    });

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const distance =
      maxSize / (2 * Math.tan((Math.PI * this.camera.fov) / 360));

    // 计算目标相机位置
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(center);
    targetPosition.y += distance * 0.5;
    targetPosition.z += distance * 1.5;

    // 使用平滑动画移动相机
    this.animateCameraTo(targetPosition, center, 1200); // 1.2秒动画，稍长一些因为是全场景适配
  }

  // 控制方法
  updateLightIntensity(intensity: number) {
    this.directionalLight.intensity = intensity;
  }

  updateAmbientLight(intensity: number) {
    this.ambientLight.intensity = intensity;
  }

  resetCamera() {
    const targetPosition = new THREE.Vector3(
      this.cameraConfig.position.x,
      this.cameraConfig.position.y,
      this.cameraConfig.position.z
    );
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    // 使用平滑动画重置相机
    this.animateCameraTo(targetPosition, targetLookAt, 600); // 0.6秒动画
  }

  clearModels() {
    this.models.forEach((model) => {
      this.modelGroup.remove(model.object);
    });
    this.models.clear();
  }

  removeModel(modelId: string) {
    const model = this.models.get(modelId);
    if (model) {
      // 如果是根节点，需要递归移除所有子节点
      if (model.nodeType === "root") {
        this.removeModelAndChildren(model);
      } else {
        // 如果是子节点，需要从其父对象中移除
        if (model.object.parent) {
          model.object.parent.remove(model.object);
        }
        // 同时从models映射中删除
        this.models.delete(modelId);

        // 从父节点的children数组中移除
        if (model.parent) {
          const parentModel = this.models.get(model.parent.id);
          if (parentModel) {
            parentModel.children = parentModel.children.filter(
              (child) => child.id !== modelId
            );
          }
        }
      }
    }
  }

  private removeModelAndChildren(model: ModelInfo) {
    // 递归移除所有子节点
    model.children.forEach((child) => {
      this.removeModelAndChildren(child);
    });

    // 移除当前节点
    this.modelGroup.remove(model.object);
    this.models.delete(model.id);
  }

  focusOnModel(modelId: string) {
    const model = this.models.get(modelId);
    if (model) {
      const box = new THREE.Box3().setFromObject(model.object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      const distance =
        maxSize / (2 * Math.tan((Math.PI * this.camera.fov) / 360));

      // 计算目标相机位置
      const targetPosition = new THREE.Vector3();
      targetPosition.copy(center);
      targetPosition.y += distance * 0.5;
      targetPosition.z += distance * 1.5;

      // 使用平滑动画移动相机
      this.animateCameraTo(targetPosition, center, 800); // 0.8秒动画

      // 将TransformControls附加到选中的模型
      this.attachTransformControls(modelId);
    }
  }

  toggleModelVisibility(modelId: string): boolean | null {
    const model = this.models.get(modelId);
    if (model) {
      // 切换模型可见性
      model.visible = !model.visible;
      model.object.visible = model.visible;

      // 如果是根节点，同时影响所有子节点
      if (model.nodeType === "root") {
        this.setChildrenVisibility(model, model.visible);
      }

      return model.visible;
    }
    return null;
  }

  private setChildrenVisibility(parentModel: ModelInfo, visible: boolean) {
    parentModel.children.forEach((child) => {
      child.visible = visible;
      child.object.visible = visible;
      // 递归处理子节点的子节点
      if (child.children.length > 0) {
        this.setChildrenVisibility(child, visible);
      }
    });
  }

  toggleNodeVisibility(modelId: string): boolean | null {
    const model = this.models.get(modelId);
    if (model) {
      // 切换节点可见性
      model.visible = !model.visible;
      model.object.visible = model.visible;

      // 如果要显示子节点，需要确保所有父节点都是可见的
      if (model.visible && model.parent) {
        this.ensureParentVisibility(model.parent);
      }

      return model.visible;
    }
    return null;
  }

  private ensureParentVisibility(parentModel: ModelInfo) {
    // 递归确保所有父节点都是可见的
    if (!parentModel.visible) {
      parentModel.visible = true;
      parentModel.object.visible = true;

      // 继续向上检查
      if (parentModel.parent) {
        this.ensureParentVisibility(parentModel.parent);
      }
    }
  }

  showAllModels() {
    // 显示所有模型
    this.models.forEach((model) => {
      model.visible = true;
      model.object.visible = true;
    });
  }

  hideAllModels() {
    // 隐藏所有模型
    this.models.forEach((model) => {
      model.visible = false;
      model.object.visible = false;
    });
  }

  getAllModelsFlattened(): ModelInfo[] {
    const allModels: ModelInfo[] = [];

    this.models.forEach((model) => {
      if (model.nodeType === "root") {
        allModels.push(model);
        this.addChildrenToList(model, allModels);
      }
    });

    return allModels;
  }

  private addChildrenToList(parentModel: ModelInfo, list: ModelInfo[]) {
    parentModel.children.forEach((child) => {
      list.push(child);
      if (child.children.length > 0) {
        this.addChildrenToList(child, list);
      }
    });
  }

  getRootModels(): ModelInfo[] {
    const rootModels: ModelInfo[] = [];
    this.models.forEach((model) => {
      if (model.nodeType === "root") {
        rootModels.push(model);
      }
    });
    return rootModels;
  }

  // TransformControls 相关方法
  attachTransformControls(modelId: string) {
    const model = this.models.get(modelId);
    if (model && model.object) {
      this.transformControls.attach(model.object);
      this.transformControls.visible = true;
    }
  }

  detachTransformControls() {
    this.transformControls.detach();
    this.transformControls.visible = false;
    this.selectedObject = null;
  }

  setTransformMode(mode: "translate" | "rotate" | "scale") {
    this.transformControls.setMode(mode);
  }

  getTransformMode(): string {
    return this.transformControls.mode;
  }

  isTransformControlsVisible(): boolean {
    return this.transformControls.visible;
  }

  getSelectedObject(): THREE.Object3D | null {
    return this.selectedObject;
  }

  getSelectedObjectInfo(): {
    name: string;
    type: string;
    modelId?: string;
  } | null {
    if (!this.selectedObject) return null;

    return {
      name: this.selectedObject.name || "未命名对象",
      type: this.selectedObject.type,
      modelId: undefined, // 暂时简化，后续可以扩展
    };
  }

  // userData 相关方法
  getSelectedObjectUserData(): Record<string, any> | null {
    if (!this.selectedObject) return null;
    return this.selectedObject.userData || {};
  }

  setSelectedObjectUserData(userData: Record<string, any>): boolean {
    if (!this.selectedObject) return false;
    this.selectedObject.userData = { ...userData };
    return true;
  }

  updateSelectedObjectUserData(key: string, value: any): boolean {
    if (!this.selectedObject) return false;
    if (!this.selectedObject.userData) {
      this.selectedObject.userData = {};
    }
    this.selectedObject.userData[key] = value;
    return true;
  }

  removeSelectedObjectUserData(key: string): boolean {
    if (!this.selectedObject || !this.selectedObject.userData) return false;
    delete this.selectedObject.userData[key];
    return true;
  }

  clearSelectedObjectUserData(): boolean {
    if (!this.selectedObject) return false;
    this.selectedObject.userData = {};
    return true;
  }

  // ===== 新增：对象位置控制方法 =====
  /**
   * 获取当前选中对象的位置坐标
   */
  getSelectedObjectPosition(): { x: number; y: number; z: number } | null {
    if (!this.selectedObject) return null;
    return {
      x: this.selectedObject.position.x,
      y: this.selectedObject.position.y,
      z: this.selectedObject.position.z,
    };
  }

  /**
   * 设置当前选中对象的位置坐标
   */
  setSelectedObjectPosition(x: number, y: number, z: number): boolean {
    if (!this.selectedObject) return false;
    this.selectedObject.position.set(x, y, z);
    return true;
  }

  /**
   * 根据模型ID获取对象位置
   */
  getModelPosition(modelId: string): { x: number; y: number; z: number } | null {
    const model = this.models.get(modelId);
    if (!model) return null;
    return {
      x: model.object.position.x,
      y: model.object.position.y,
      z: model.object.position.z,
    };
  }

  /**
   * 根据模型ID设置对象位置
   */
  setModelPosition(modelId: string, x: number, y: number, z: number): boolean {
    const model = this.models.get(modelId);
    if (!model) return false;
    model.object.position.set(x, y, z);
    return true;
  }

  // 相机动画控制方法
  isCameraAnimating(): boolean {
    return this.cameraAnimation.isAnimating;
  }

  stopCameraAnimation() {
    this.cameraAnimation.isAnimating = false;
  }

  setCameraAnimationDuration(duration: number) {
    this.cameraAnimation.duration = duration;
  }

  animateCameraToPosition(
    position: THREE.Vector3,
    lookAt: THREE.Vector3,
    duration?: number
  ) {
    this.animateCameraTo(position, lookAt, duration);
  }

  private isObjectInModel(
    target: THREE.Object3D,
    modelRoot: THREE.Object3D
  ): boolean {
    if (target === modelRoot) return true;

    for (const child of modelRoot.children) {
      if (this.isObjectInModel(target, child)) {
        return true;
      }
    }

    return false;
  }

  // ===== 新增：几何信息统计方法 =====
  /**
   * (优化) 计算当前场景（所有模型）的顶点、边和面数量
   * 该方法现在从缓存中读取数据，性能极高
   */
  getSceneGeometryInfo(): { vertices: number; edges: number; faces: number } {
    const total = { vertices: 0, edges: 0, faces: 0 };
    this.getRootModels().forEach((model) => {
      if (model.perfInfo) {
        total.vertices += model.perfInfo.vertices;
        total.edges += model.perfInfo.edges;
        total.faces += model.perfInfo.faces;
      }
    });
    return total;
  }

  // ===== 模型导出功能 =====
  
  /**
   * 导出单个模型
   * @param modelId 模型ID
   * @param options 导出配置选项
   * @returns Promise<ExportResult>
   */
  async exportModel(modelId: string, options?: Partial<ExportOptions>): Promise<ExportResult> {
    const model = this.models.get(modelId);
    if (!model) {
      return {
        success: false,
        fileName: '',
        error: '模型不存在'
      };
    }

    // 检查模型可见性
    if (options?.onlyVisible !== false && !model.visible) {
      return {
        success: false,
        fileName: '',
        error: '模型不可见，无法导出'
      };
    }

    const exportOptions = this.getDefaultExportOptions(options);
    
    try {
      // 创建临时场景用于导出
      const exportScene = new THREE.Scene();
      
      // 克隆模型对象，保持变换关系
      const clonedObject = this.cloneObjectWithTransforms(model.object);
      exportScene.add(clonedObject);
      
      // 如果需要保留自定义材质，确保材质也被正确处理
      if (exportOptions.includeCustomMaterials) {
        this.processCustomMaterials(clonedObject);
      }
      
      const fileName = this.generateFileName(model.name, exportOptions.format);
      const data = await this.performExport(exportScene, exportOptions);
      
      // 下载文件
      this.downloadFile(data, fileName, exportOptions.format);
      
      return {
        success: true,
        fileName,
        data
      };
    } catch (error) {
      console.error('导出模型失败:', error);
      return {
        success: false,
        fileName: '',
        error: error instanceof Error ? error.message : '导出失败'
      };
    }
  }

  /**
   * 批量导出可见模型
   * @param modelIds 模型ID数组，如果为空则导出所有可见模型
   * @param options 导出配置选项
   * @returns Promise<ExportResult>
   */
  async exportModels(modelIds?: string[], options?: Partial<ExportOptions>): Promise<ExportResult> {
    const exportOptions = this.getDefaultExportOptions(options);
    
    try {
      // 确定要导出的模型
      let modelsToExport: ModelInfo[];
      
      if (modelIds && modelIds.length > 0) {
        modelsToExport = modelIds
          .map(id => this.models.get(id))
          .filter((model): model is ModelInfo => model !== undefined);
      } else {
        // 导出所有根模型
        modelsToExport = this.getRootModels();
      }
      
      // 过滤可见模型
      if (exportOptions.onlyVisible) {
        modelsToExport = modelsToExport.filter(model => model.visible);
      }
      
      if (modelsToExport.length === 0) {
        return {
          success: false,
          fileName: '',
          error: '没有可导出的模型'
        };
      }
      
      // 创建临时场景用于导出
      const exportScene = new THREE.Scene();
      
      // 添加所有要导出的模型，保持层级关系
      modelsToExport.forEach(model => {
        const clonedObject = this.cloneObjectWithTransforms(model.object);
        exportScene.add(clonedObject);
        
        if (exportOptions.includeCustomMaterials) {
          this.processCustomMaterials(clonedObject);
        }
      });
      
      const fileName = this.generateFileName('scene_export', exportOptions.format);
      const data = await this.performExport(exportScene, exportOptions);
      
      // 下载文件
      this.downloadFile(data, fileName, exportOptions.format);
      
      return {
        success: true,
        fileName,
        data
      };
    } catch (error) {
      console.error('批量导出模型失败:', error);
      return {
        success: false,
        fileName: '',
        error: error instanceof Error ? error.message : '批量导出失败'
      };
    }
  }

  /**
   * 获取默认导出配置
   */
  private getDefaultExportOptions(options?: Partial<ExportOptions>): ExportOptions {
    return {
      format: 'glb',
      includeAnimations: true,
      includeCustomMaterials: true,
      onlyVisible: true,
      preserveTransforms: true,
      binary: true,
      ...options
    };
  }

  /**
   * 克隆对象并保持变换关系
   */
  private cloneObjectWithTransforms(object: THREE.Object3D): THREE.Object3D {
    const cloned = object.clone(true);
    
    // 确保变换矩阵被正确复制
    cloned.matrix.copy(object.matrix);
    cloned.matrixWorld.copy(object.matrixWorld);
    
    // 递归处理子对象
    cloned.traverse((child) => {
      const originalChild = object.getObjectByProperty('uuid', child.uuid);
      if (originalChild) {
        child.matrix.copy(originalChild.matrix);
        child.matrixWorld.copy(originalChild.matrixWorld);
        
        // 保持位置、旋转、缩放
        child.position.copy(originalChild.position);
        child.rotation.copy(originalChild.rotation);
        child.scale.copy(originalChild.scale);
      }
    });
    
    return cloned;
  }

  /**
   * 处理自定义材质
   */
  private processCustomMaterials(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        // 确保材质被正确克隆和处理
        if (Array.isArray(child.material)) {
          child.material = child.material.map(mat => mat.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });
  }

  /**
   * 执行实际的导出操作
   */
  private async performExport(scene: THREE.Scene, options: ExportOptions): Promise<ArrayBuffer | object> {
    return new Promise((resolve, reject) => {
      const exportOptions = {
        binary: options.format === 'glb' || options.binary,
        includeCustomExtensions: options.includeCustomMaterials,
        animations: options.includeAnimations ? this.getSceneAnimations(scene) : [],
        onlyVisible: options.onlyVisible,
        truncateDrawRange: true,
        embedImages: true,
        maxTextureSize: 4096
      };

      this.gltfExporter.parse(
        scene,
        (result) => {
          resolve(result);
        },
        (error) => {
          reject(error);
        },
        exportOptions
      );
    });
  }

  /**
   * 获取场景中的动画
   */
  private getSceneAnimations(scene: THREE.Scene): THREE.AnimationClip[] {
    const animations: THREE.AnimationClip[] = [];
    
    scene.traverse((object) => {
      // 查找对象上的动画
      if (object.animations && object.animations.length > 0) {
        animations.push(...object.animations);
      }
    });
    
    return animations;
  }

  /**
   * 生成文件名
   */
  private generateFileName(baseName: string, format: 'glb' | 'gltf'): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const cleanName = baseName.replace(/\.[^/.]+$/, ''); // 移除原有扩展名
    return `${cleanName}_exported_${timestamp}.${format}`;
  }

  /**
   * 下载文件
   */
  private downloadFile(data: ArrayBuffer | object, fileName: string, format: 'glb' | 'gltf'): void {
    let blob: Blob;
    
    if (format === 'glb' || data instanceof ArrayBuffer) {
      blob = new Blob([data as ArrayBuffer], { type: 'application/octet-stream' });
    } else {
      const jsonString = JSON.stringify(data, null, 2);
      blob = new Blob([jsonString], { type: 'application/json' });
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理blob URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  /**
   * 获取可导出的模型列表（仅可见模型）
   */
  getExportableModels(): ModelInfo[] {
    return this.getRootModels().filter(model => model.visible);
  }

  /**
   * 检查模型是否可以导出
   */
  canExportModel(modelId: string): boolean {
    const model = this.models.get(modelId);
    return model !== undefined && model.visible;
  }

  dispose() {
    // 清理所有blob URLs
    this.blobUrls.forEach((url) => URL.revokeObjectURL(url));
    this.blobUrls.clear();

    // 清理资源映射
    this.resourceMap.clear();

    // 停止相机动画
    this.stopCameraAnimation();

    // 清理TransformControls
    if (this.transformControls) {
      this.transformControls.detach();
      this.scene.remove(this.transformControls);
      this.transformControls.dispose();
    }

    // 清理性能统计
    if (this.stats && this.stats.dom) {
      this.container.removeChild(this.stats.dom);
    }

    this.renderer.dispose();
    this.dracoLoader.dispose();
    window.removeEventListener("resize", this.handleResize.bind(this));
    this.renderer.domElement.removeEventListener(
      "click",
      this.handleMouseClick.bind(this)
    );

    console.log("ThreeScene已完全清理");
  }
}
