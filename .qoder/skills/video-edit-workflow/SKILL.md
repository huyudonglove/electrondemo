---
name: video-edit-workflow
description: 视频编辑功能的工作流程和代码模式。使用当用户询问视频剪辑、转码、图片替换等功能的实现方式时。
---

# 视频编辑工作流程

## 视频剪辑工作流程

### 1. 导入视频

**渲染进程 (JianYing.vue):**

```vue
const drop = (e)=>{ let data = { path: e.dataTransfer.files[0].path }
window.API.dropVideo(data) videoData.source = data.path; }
```

**主进程 (api/index.ts):**

```typescript
const dropVideo = (data) => {
  _videoPath = data.path;
  let outp = path.dirname(data.path);
  const temp = createTempDir(outp);
  let outputPath = path.join(temp, "thumb_%05d.jpg");

  ffmpeg(p)
    .outputOptions(["-vf", "fps=1", "-q:v", "20"])
    .save(outputPath)
    .on("end", () => {
      const fi = dropImage(temp);
      win.webContents.send("dropVideoDone", fi);
    });
};
```

### 2. 时间轴剪辑

**剪辑区域计算:**

```typescript
const startTime = computed(() => {
  return ((clipLeft.value / total) * videoDuration).toFixed(2);
});

const endTime = computed(() => {
  return (((clipLeft.value + clipWidth.value) / total) * videoDuration).toFixed(
    2,
  );
});
```

**拖拽调整:**

- `left` handle: 调整起始时间
- `right` handle: 调整结束时间

### 3. 标记与剪辑

**标记片段:**

```typescript
const biaoji = () => {
  videoData.start = startTime.value;
  videoData.end = endTime.value;
  videoArr.push(JSON.parse(JSON.stringify(videoData)));
};
```

**执行剪辑:**

```typescript
// 主进程批量处理
async function cutVideo(data) {
  Promise.all(
    data.map((item, index) => {
      let outputPath = path.join(temp, `thumb${index}.mp4`);
      return cutSegment(item.source, item.start, item.end, outputPath);
    }),
  ).then(() => {
    win.webContents.send("cutVideoDone");
  });
}

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

## 图片替换工作流程 (Banben.vue)

### 选择文件夹并显示

```vue
async function handleSelectFolder() { const result = await
window.API.SelectFolder(); if (result) { imgListSrc.value = result; } }
```

### 拖拽替换

```vue
const dragImg2 = async (e) => { let file = e.dataTransfer.files[0]; if (!file)
return; // 获取当前显示的图片路径（去掉时间戳和 file:// 前缀，并处理路径格式）
let srcWithTimestamp = e.target.getAttribute('src'); let targetPath =
srcWithTimestamp .split("?")[0] .replace(/^file:\/\//, '') .replace(/^\//, '');
// 去掉开头的斜杠，如 /C:/ -> C:/ let sourcePath = file.path;
console.log('替换图片: 将', sourcePath, '复制到', targetPath); try { //
将新图片复制到目标位置（覆盖原文件） await window.API.ChangeImg2(targetPath,
sourcePath); console.log("替换成功"); } catch (err) { console.error('替换失败:',
err); } };
```

### 删除图片

```vue
const deleteImg = (index) => { imgListSrc.value.splice(index, 1); };
```

### 关键注意事项

1. **路径格式处理**: `file://` 协议路径需要去掉前缀和开头的斜杠
2. **复制逻辑**: `copyFile(sourcePath, targetPath)` 是将源文件复制到目标位置（覆盖）
3. **v-for key**: 使用 `index` 作为 key，避免使用数据项（可能导致删除错乱）
4. **单数组管理**: 只用一个响应式数组 `imgListSrc`，避免多个数组引用同一数据
5. **长路径显示**: 使用 `word-break: break-all` 让长路径自动换行

## Three.js 特效工作流程

### 初始化场景

```typescript
function changeFile(e) {
  texiaoScene = new TexiaoScene(canvasRef.value);
  const file = e.target.files[0];
  const texture = createVideoTexture(file);
  texiaoScene.addTexture(texture);
}

function createVideoTexture(file) {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(file);
  video.muted = true;
  video.loop = true;
  video.play();
  return new THREE.VideoTexture(video);
}
```

### 切换特效

```typescript
function toggleEffect(val) {
  texiaoScene.toggleEffect(val);
}
// 支持的特效: fragmentShader, niuqu, huiduShader, guzhangShader, xiangsuoShader, scanShader, noiseShader
```
