---
name: electron-vue-patterns
description: Electron + Vue 3 项目的常见开发模式和最佳实践。使用当用户询问IPC通信、文件路径处理、Vue组合式API等开发模式时。
---

# Electron Vue 开发模式

## IPC 通信模式

### 预加载脚本暴露API (preload/index.ts)

```typescript
contextBridge.exposeInMainWorld("ipcRenderer", {
  on: (...args) => ipcRenderer.on(...args),
  off: (...args) => ipcRenderer.off(...args),
  send: (...args) => ipcRenderer.send(...args),
  invoke: (...args) => ipcRenderer.invoke(...args),
});

contextBridge.exposeInMainWorld("API", {
  dropVideo: (data) => ipcRenderer.send("dropVideo", data),
  cutVideo: (data) => ipcRenderer.send("cutVideo", data),
  SelectFolder: (data) => ipcRenderer.invoke("SelectFolder", data),
  // ...
});
```

### 主进程处理 (main/index.ts)

```typescript
// send/on 模式 (单向)
ipcMain.on("dropVideo", (_, arg) => {
  All.dropVideo(arg);
});

// invoke/handle 模式 (双向，可返回数据)
ipcMain.handle("SelectFolder", async (event, arg) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.filePaths;
});
```

### 渲染进程调用

```typescript
// 发送消息
window.API.dropVideo(data);

// 调用并等待返回
const result = await window.API.SelectFolder();

// 监听主进程消息
window.ipcRenderer.on("dropVideoDone", (event, data) => {
  // 处理返回数据
});
```

## 文件路径处理

### Windows路径转file协议

```typescript
const toFileUrl = (filePath) => {
  return `file://${filePath.replace(/\\/g, "/")}`;
};
```

### 获取项目根目录

```typescript
process.env.APP_ROOT = path.join(__dirname, "../..");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;
```

## Vue 3 组合式API模式

### 响应式数据

```vue
<script setup>
import { ref, computed, onMounted } from "vue";

const imgListSrc = ref([]);
const clipLeft = ref(100);
const clipWidth = ref(300);

const startTime = computed(() => {
  return ((clipLeft.value / total) * videoDuration).toFixed(2);
});

onMounted(() => {
  window.ipcRenderer.on("dropVideoDone", dropVideoDone);
});
</script>
```

## Element Plus 使用模式

### 全局引入

```typescript
// main.ts
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
app.use(ElementPlus);
```

### 常用组件

```vue
<template>
  <el-button @click="handleClick">按钮</el-button>
</template>
```

## FFmpeg 处理模式

### 设置FFmpeg路径

```typescript
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
```

### Promise包装异步操作

```typescript
function cutSegment(source, start, end, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(source)
      .setStartTime(start)
      .setDuration(end - start)
      .output(output)
      .on("end", () => resolve(output))
      .on("error", reject)
      .run();
  });
}
```
