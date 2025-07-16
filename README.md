# Vue Three.js 模型加载器

基于 Vue 3 + Three.js 的现代化3D模型加载器，支持拖拽式批量加载模型，包括draco压缩模型。

## ✨ 功能特性

- 🎯 **拖拽式加载**: 支持将3D模型文件直接拖拽到浏览器中加载
- 📁 **批量加载**: 可同时选择多个模型文件进行加载
- 🗜️ **压缩模型支持**: 完全支持Draco压缩的GLTF/GLB模型
- 🎮 **交互控制**: 内置相机控制、光照调节、模型管理等功能
- 💎 **现代技术栈**: Vue 3 + TypeScript + Vite + Three.js
- 🎨 **美观界面**: 现代化的UI设计，支持响应式布局

## 🎨 支持的模型格式

- **GLTF/GLB** - 包括Draco压缩版本
- **OBJ** - Wavefront OBJ格式
- **FBX** - Autodesk FBX格式

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 🛠️ 技术栈

- **Vue 3**: 现代化的渐进式JavaScript框架
- **TypeScript**: 类型安全的JavaScript超集
- **Vite**: 下一代前端构建工具
- **Three.js**: 强大的3D JavaScript库
- **OrbitControls**: 轨道相机控制器
- **各种Three.js加载器**: GLTF、OBJ、FBX等

## 📦 项目结构

```
src/
├── components/          # Vue组件
├── composables/        # Vue组合式API
│   └── useThreeScene.ts # Three.js场景管理
├── types/              # TypeScript类型定义
│   └── index.ts
├── App.vue            # 主应用组件
├── main.ts            # 应用入口
└── style.css          # 全局样式
```

## 🎯 主要功能

### 模型加载
- 支持拖拽文件到页面进行加载
- 支持点击按钮选择文件
- 自动检测文件格式并使用对应加载器
- 支持Draco压缩模型的自动解压

### 场景控制
- 光源强度调节
- 环境光调节
- 相机位置重置
- 场景清空

### 模型管理
- 模型列表显示
- 单击模型名称聚焦到该模型
- 删除指定模型
- 模型数量统计

## 🔧 配置选项

在 `src/composables/useThreeScene.ts` 中可以自定义：

- 场景配置 (背景色、雾效、阴影等)
- 相机配置 (视角、位置等)
- 光照配置 (方向光、环境光等)

## 🎨 UI特性

- 毛玻璃效果的控制面板
- 响应式设计，支持移动端
- 优雅的过渡动画
- 现代化的交互反馈

## 📝 使用说明

1. 打开应用后，您会看到一个拖拽区域
2. 将3D模型文件拖拽到该区域，或点击"浏览文件"按钮选择文件
3. 模型加载完成后，可以：
   - 使用鼠标拖拽旋转视角
   - 使用鼠标滚轮缩放
   - 使用右侧控制面板调节光照
   - 在左侧模型列表中管理已加载的模型

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## �� 许可证

MIT License 