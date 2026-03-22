---
name: electron-vite-vue
description: Electron + Vue 3 + Vite 视频编辑工具项目，支持视频剪辑、转码、特效处理。使用当用户询问关于vfx项目、视频编辑功能、项目结构或技术栈相关问题时。
---

# Electron Vite Vue 项目

## 项目概述

这是一个基于 Electron + Vue 3 + Vite 构建的桌面视频编辑工具，项目名为 "vfx" (shader vfx tool)。

### 技术栈

- **前端框架**: Vue 3.4.21 + TypeScript
- **构建工具**: Vite 5.1.5
- **桌面框架**: Electron 29.1.1
- **UI组件库**: Element Plus 2.10.2
- **富文本编辑**: Tiptap 3.x
- **3D渲染**: Three.js 0.178.0
- **视频处理**: FFmpeg (fluent-ffmpeg + @ffmpeg-installer/ffmpeg)

### 项目结构

```
electron-vite-vue/
├── electron/              # Electron 主进程和预加载脚本
│   ├── main/index.ts      # 主进程入口
│   ├── preload/index.ts   # 预加载脚本
│   └── api/index.ts       # 视频处理API (FFmpeg相关)
├── src/                   # 渲染进程 (Vue应用)
│   ├── components/        # Vue组件
│   │   ├── Banben.vue     # 图片批量替换组件
│   │   ├── JianYing.vue   # 视频剪辑组件
│   │   ├── Texiao.vue     # 视频特效组件 (Three.js)
│   │   ├── Editor.vue     # 富文本编辑器
│   │   ├── Apple.vue      # 3D苹果展示
│   │   └── Ffmpeg.vue     # FFmpeg转码组件
│   ├── util/texiao.js     # Three.js特效工具
│   ├── main.ts            # Vue应用入口
│   └── App.vue            # 根组件
├── dist/                  # 渲染进程构建输出
├── dist-electron/         # Electron构建输出
├── release/               # 打包输出目录
├── vite.config.ts         # Vite配置
├── electron-builder.json  # Electron打包配置
└── package.json
```

### 核心功能模块

1. **视频剪辑 (JianYing.vue)**
   - 拖拽导入视频
   - 时间轴可视化
   - 剪辑区域选择 (左右拖拽调整)
   - 多段标记剪辑
   - FFmpeg后端处理

2. **视频转码 (FFmpeg API)**
   - H.264编码
   - CRF质量控制
   - 批量处理

3. **视频特效 (Texiao.vue)**
   - Three.js WebGL渲染
   - 支持特效: 正常、扭曲、灰度、故障、像素、扫描线、噪点、残影

4. **图片批量替换 (Banben.vue)**
   - 文件夹选择
   - 拖拽替换图片
   - 缓存刷新机制

5. **富文本编辑 (Editor.vue)**
   - Tiptap编辑器
   - 字符计数、颜色、提及等功能

### 开发命令

```bash
# 开发模式
npm run dev

# 构建打包
npm run build

# 预览
npm run preview
```

### IPC 通信

**渲染进程 → 主进程:**

- `dropVideo` - 拖入视频处理
- `cutVideo` - 剪辑视频
- `Zhuanma` - 视频转码
- `ChangeImgEle` / `ChangeImg2` - 图片替换
- `SelectFolder` - 选择文件夹

**主进程 → 渲染进程:**

- `dropVideoDone` - 视频缩略图生成完成
- `cutVideoDone` - 视频剪辑完成
- `ZhuanmaDone` - 转码完成

### 重要配置

**vite.config.ts:**

- 使用 `vite-plugin-electron` 简化Electron开发
- 支持VSCode调试 (`VSCODE_DEBUG`)
- 开发服务器端口: 3344

**electron-builder.json:**

- 产品名: sp
- 输出目录: release/${version}
- Windows打包: NSIS安装程序
- macOS打包: DMG
- Linux打包: AppImage

### 注意事项

1. **Windows路径处理**: 使用 `file://` 协议转换本地路径
2. **图片缓存**: 使用 `?t=${Date.now()}` 时间戳防止缓存
3. **临时文件**: 视频处理生成临时缩略图到 `thumbs-xxx` 文件夹
4. **安全性**: `webSecurity: false` 允许加载本地资源 (开发环境)
