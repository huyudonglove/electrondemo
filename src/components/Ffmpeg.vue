<script setup lang="ts">
import { ref ,onMounted} from 'vue'

const InputFile = ref<HTMLInputElement | null>(null)

type VideoObj = {
  name: string
  size: number
  path: string
}

function Zhuanma() {
  console.log(111)
  console.dir(InputFile.value)

  // 空值判断
  if (!InputFile.value || !InputFile.value.files) {
    alert('请先选择一个文件')
    return
  }

  const files: FileList = InputFile.value.files

  const videoObj: VideoObj = {
    name: files[0].name,
    size: files[0].size,
    path: files[0].path // 注意：浏览器中 File.path 是非标准属性，仅在 Electron 或 Node 环境下可用
  }
  //@ts-ignore
  window.API.Zhuanma(videoObj)
  loading.value = true;
}
let loading = ref(false);
function ZhuanmaDone() {
    loading.value = false;
  }
onMounted(() => {
    console.log(window)
    window.ipcRenderer.on('ZhuanmaDone', ZhuanmaDone);
  });
</script>

<template>
  <input type="file" ref="InputFile" />
  <button @click="Zhuanma()">上传</button>
  <div class="loading" v-if="loading">

  </div>
</template>
<style scoped>
    .loading {
       width: 100%;
       height: 100%;
       background: rgba(0, 0, 0, .8);
       position: absolute;
       top: 0;
       left: 0;
    }
</style>