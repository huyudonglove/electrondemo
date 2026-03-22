---
name: threejs-effects
description: Three.js 视频特效处理，支持多种着色器特效。使用当用户询问视频特效、Three.js、WebGL着色器相关问题时。
---

# Three.js 视频特效

## 概述

项目使用 Three.js 实现视频实时特效处理，通过 WebGL 着色器实现各种视觉效果。

## 核心文件

- `src/components/Texiao.vue` - 特效组件UI
- `src/util/texiao.js` - Three.js场景和特效逻辑

## 使用方式

### 初始化特效场景

```typescript
import { TexiaoScene } from "../util/texiao.js";
import * as THREE from "three";

const canvasRef = ref(null);
let texiaoScene;

function changeFile(e) {
  texiaoScene = new TexiaoScene(canvasRef.value);
  const file = e.target.files[0];
  const texture = createVideoTexture(file);
  texiaoScene.addTexture(texture);
}
```

### 创建视频纹理

```typescript
function createVideoTexture(file) {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(file);
  video.muted = true;
  video.loop = true;
  video.play();
  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  return texture;
}
```

### 切换特效

```typescript
function toggleEffect(effectName) {
  texiaoScene.toggleEffect(effectName);
}

// 支持的特效名称
const effects = [
  "fragmentShader", // 正常
  "niuqu", // 扭曲
  "huiduShader", // 灰度
  "guzhangShader", // 故障
  "xiangsuoShader", // 像素
  "scanShader", // 扫描线
  "noiseShader", // 噪点
];
```

### 高级特效

```typescript
// 残影效果 (多pass处理)
function gaosiEffect() {
  texiaoScene.gaosiEffect();
}

// 辉光效果
function bloomEffect() {
  texiaoScene.bloomEffect();
}
```

## 特效列表

| 特效名称       | 说明                      |
| -------------- | ------------------------- |
| fragmentShader | 正常显示，无特效          |
| niuqu          | 扭曲变形效果              |
| huiduShader    | 灰度/黑白效果             |
| guzhangShader  | 故障/ glitch 效果         |
| xiangsuoShader | 像素化效果                |
| scanShader     | 扫描线效果                |
| noiseShader    | 噪点效果                  |
| gaosiEffect    | 残影/高斯模糊效果 (3pass) |

## 着色器 uniforms

特效切换通过更改 fragment shader 实现，常用 uniforms:

- `tDiffuse` - 输入纹理
- `time` - 时间变量 (动画)
- `resolution` - 分辨率

## 注意事项

1. 视频必须设置 `muted = true` 才能自动播放
2. 使用 `URL.createObjectURL` 创建本地视频URL
3. 纹理格式使用 `THREE.RGBFormat`
4. 高级特效可能需要多pass渲染
