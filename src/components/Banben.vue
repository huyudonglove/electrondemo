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
const dragImg2 =async (e) => {
     let file =  e.dataTransfer.files[0];
    let oldImg = e.target.getAttribute('src').split("?")[0];
    let newImg = file.path;
    console.log(oldImg,newImg);
    await window.API.ChangeImg2(oldImg,newImg);
    refreshImage(e.target)
    console.log("改变成功");
}

const folderPath = ref('');

async function handleSelectFolder() {
  const result = await window.API.SelectFolder();
  if (result) {
    folderPath.value = result;
    console.log('真实文件夹路径:', folderPath.value);
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
const deleteImg = (img) => {
  imgListSrc.value = imgListSrc.value.filter(item => item !== img);
};
</script>
<template>
    <el-button @click="handleSelectFolder" class="select-folder-button">选择文件夹</el-button>
    <div class="panel">
        <div v-for="(img,index) in imgListSrc" :key="img" class="img-item" >
          <img  :src="cacheBustedSrc(img)"  alt="" class="imgSelf" @drop.prevent="dragImg2" @dragover.prevent>
          <p style="font-size: 0.7rem;">{{folderPath[index] }}</p>
          <el-button @click="deleteImg(img)">shanchu</el-button>
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
</style>