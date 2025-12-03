<script setup>
import { ref,onMounted,computed } from 'vue';

const drop = (e)=>{
    console.log(e);
    console.log(e.dataTransfer.files);
    let data ={
        path:e.dataTransfer.files[0].path
    }
    window.API.dropVideo(data)
    videoData.source = data.path;
}
const clipLeft = ref(100)  // 初始左边距
const clipWidth = ref(300) // 初始宽度
const dragging = ref(null)
const timelineRef = ref(null)
onMounted(()=>{
    window.ipcRenderer.on('dropVideoDone', dropVideoDone);
    window.ipcRenderer.on('cutVideoDone', cutVideoDone);
})
const videoDuration = 60 // 假设视频为60秒，换成你自己的

const startTime = computed(() => {
  const total = timelineRef.value?.offsetWidth || 1
  return ((clipLeft.value) / total * videoDuration).toFixed(2)
})

const endTime = computed(() => {
  const total = timelineRef.value?.offsetWidth || 1
  return ((clipLeft.value + clipWidth.value) / total * videoDuration).toFixed(2)
})
const dropVideoDone = (event, data) => {
    //console.log(data);
    imgs.value = data;
}
const imgs =ref([]);
const toFileUrl = (filePath) => {
  return `file://${filePath.replace(/\\/g, '/')}`; // 注意 Windows 斜杠
};
const onMouseDown = (type) => { 
    dragging.value = type
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
};
const onMouseMove = (e) => {
  const rect = timelineRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left

  if (dragging.value === 'left') {
    const maxLeft = clipLeft.value + clipWidth.value - 20
    clipLeft.value = Math.max(0, Math.min(x, maxLeft))
    clipWidth.value = clipWidth.value + (clipLeft.value - x)
  }

  if (dragging.value === 'right') {
    const minRight = clipLeft.value + 20
    const maxRight = rect.width
    const newRight = Math.min(x, maxRight)
    clipWidth.value = Math.max(20, newRight - clipLeft.value)
  }
}
const onMouseUp = () => {
  dragging.value = null
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
const cutVideo =()=>{
    if(!imgs.value.length){
        alert("请拖入视频")
        return
    }
    window.API.cutVideo(videoArr)
}
const cutVideoDone = (event,data) =>{
    console.log(event,data);
    alert("导出完成");
}
let videoArr = [];
let videoData ={
        source:String,
        start:Number,
        end:Number
    }
const biaoji =()=>{
    videoData.start = startTime.value;
    videoData.end = endTime.value;
    videoArr.push(JSON.parse(JSON.stringify(videoData)));
     console.log(videoArr);
}
</script>
<template>
    <div class="waiceng" @drop.prevent="drop" @dragover.prevent>
        
    </div>
    <div class="timeline-wrapper">
        <div class="thumb-track" ref="timelineRef">
            <img
                v-for="(thumb, index) in imgs"
                :key="index"
                :src="toFileUrl(thumb)"
                class="thumb"
                draggable="false"
                @dragstart.prevent
            />
        </div>
        <div v-if="imgs.length" class="clip-region" :style="{ left: clipLeft + 'px', width: clipWidth + 'px' }">
            <div class="handle left" @mousedown="onMouseDown('left')"></div>
            <div class="handle right" @mousedown="onMouseDown('right')"></div>
        </div>
    </div>
    <div class="info">
      🎞 剪辑起止：{{ startTime }}s - {{ endTime }}s
    </div>
    <el-button @click="biaoji()" class="biaojiButton">标记</el-button>
    <el-button @click="cutVideo()" class="jianjiButton">剪辑</el-button>
</template>
<style scoped>
.waiceng{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
.videoPlay{
    width: 30rem;
}
.timeline-wrapper {
  width: 100%;
  height: 100px;
  overflow-x: auto;
  white-space: nowrap;
  box-sizing: border-box;
  background: #1e1e1e;
  position: absolute;
  z-index: 10;
  left: 0;
  bottom: 2rem;
}

.thumb-track {
    display: inline-flex;
    padding: 4px;
    box-sizing: border-box;
    user-select: none;  /* 禁止文字/图片选中 */
    -webkit-user-select: none;
    -ms-user-select: none;
}

.thumb {
  width: 6rem;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
  border-radius: 4px;
  box-sizing: border-box;
}
.clip-region {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(100, 200, 255, 0.3);
  border: 1px solid #00aaff;
  cursor: move;
  z-index: 20;
}
.handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6px;
  background: #00aaff;
  cursor: ew-resize;
}
.handle.left {
  left: 0;
}
.handle.right {
  right: 0;
  
}
.info {
  margin-top: 10px;
  color: #ccc;
  font-size: 14px;
}
.jianjiButton{
    position: absolute;
    z-index: 20;
}
.biaojiButton{
    position: absolute;
    z-index: 20;
    left: 40rem;
}
</style>