<template>  
    <div>
        <input type="file" name="video" id="videoInput" @change="changeFile">
        <div ref="canvasRef"></div>
        <div class="buttonCon">
            <button @click="toggleEffect('fragmentShader')">正常</button>
            <button @click="toggleEffect('niuqu')">扭曲</button>
            <button @click="toggleEffect('huiduShader')">灰度</button>
            <button @click="toggleEffect('guzhangShader')">故障</button>
            <button @click="toggleEffect('xiangsuoShader')">像素</button>
            <button @click="toggleEffect('scanShader')">扫描线</button>
            <button @click="toggleEffect('noiseShader')">噪点</button>
            <button @click="gaosiEffect">残影效果（3pass）</button>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { TexiaoScene } from '../util/texiao.js';
import * as THREE from 'three';
const canvasRef = ref(null);
let texiaoScene;
onMounted(() => {
    
})

function changeFile(e) {
  texiaoScene= new TexiaoScene(canvasRef.value);
  const file = e.target.files[0]
  const texture = createVideoTexture(file);
  texiaoScene.addTexture(texture);
}

function createVideoTexture(file) {
  const video = document.createElement('video');
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
function toggleEffect(val){
    texiaoScene.toggleEffect(val);
}

function bloomEffect(){
    texiaoScene.bloomEffect();
}
function gaosiEffect(){
    texiaoScene.gaosiEffect();
}
</script>
<style>
.buttonCon{
    position: absolute;
    top: 10px;
    right: 0;
    z-index: 10;
    background: rgb(99, 81, 81);
    width: 300px;
    box-sizing: border-box;
    padding: 10px;
}
button{
    display: block;
    width: 200px;
    height: 40px;
    margin: auto;
    margin-top: 10px;
    font-size: 1rem;
}
</style>