<script setup>
import { ref ,onMounted} from 'vue';
const myIframe = ref(null);
const imgListAll = ref(null);
let imgListItem = ref([]);
let imgListSrc = ref([]);
onMounted(() => {

 
})

const getImgList = () => {
    
    imgListItem = myIframe.value.contentWindow.document.querySelectorAll('img');
    //console.log(imgListItem,111);
    imgListItem.forEach(item => {
        if(imgListSrc.value.includes(item.src)){
            return
        }
        imgListSrc.value.push(item.src)
    })
}
const dragImg = (e) => {
    let file =  e.dataTransfer.files[0];
    console.log(file);
    console.log(e,5555);
    let oldImg = e.target.getAttribute('src');
    let newImg = file.path;
    console.log(oldImg);
    window.API.ChangeImg(oldImg,newImg)
}
const dragImg2 = async (e) => {
    let file = e.dataTransfer.files[0];
    if (!file) return;
    
    // 获取当前显示的图片路径（去掉时间戳和 file:// 前缀，并处理路径格式）
    let srcWithTimestamp = e.target.getAttribute('src');
    let targetPath = srcWithTimestamp
        .split("?")[0]
        .replace(/^file:\/\//, '')
        .replace(/^\//, '');  // 去掉开头的斜杠，如 /C:/ -> C:/
    let sourcePath = file.path;
    
    console.log('替换图片: 将', sourcePath, '复制到', targetPath);
    
    try {
        // 将新图片复制到目标位置（覆盖原文件）
        await window.API.ChangeImg2(targetPath, sourcePath);
        // 刷新显示（加时间戳防缓存）
        refreshImage(e.target);
        console.log("替换成功");
    } catch (err) {
        console.error('替换失败:', err);
    }
}

async function handleSelectFolder() {
  const result = await window.API.SelectFolder();
  if (result) {
    console.log('选择的图片:', result);
    imgListSrc.value = result;
  } else {
    console.log('用户取消了选择');
  }
}
function cacheBustedSrc(path) {
  return `${path}?v=${Date.now()}`; // 每次都变
}
function refreshImage(imgEl) {
  const oldSrc = imgEl.src;
  const base = oldSrc.split('?')[0];
  const newSrc = `${base}?t=${Date.now()}`; // 加时间戳防缓存
  imgEl.src = newSrc;
}
const deleteImg = (index) => {
  imgListSrc.value.splice(index, 1);
};
</script>
<template>
    <el-button @click="handleSelectFolder" class="select-folder-button">选择文件夹</el-button>
    <div class="panel">
        <div v-for="(img,index) in imgListSrc" :key="index" class="img-item" >
          <img  :src="cacheBustedSrc(img)"  alt="" class="imgSelf" @drop.prevent="dragImg2" @dragover.prevent>
          <p class="img-path" :title="img">{{img}}</p>
          <el-button @click="deleteImg(index)">shanchu</el-button>
        </div>
        
    </div>
</template>
<style scoped>
.select-folder-button {
  position: absolute;
  top: 0;
  left: 10px;
}
.myIframe{
    position: absolute;
    left: 0;
    top: 0;
    width: 100rem;
    height: 100%;
}
.panel{
   
    position: absolute;
    right: 0;
    top: 2rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.img-item{
    width: 20rem;
    box-sizing: border-box;
}
.imgSelf{
    width: 20rem;
    border: 1px solid red;
}
.img-path {
    font-size: 0.7rem;
    word-break: break-all;
    overflow-wrap: break-word;
    max-width: 100%;
    margin: 0;
    line-height: 1.2;
}
</style>