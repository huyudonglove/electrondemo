import  path  from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { getMainWindow } from "../main/index";
import os from 'node:os';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';
import { dialog } from 'electron';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
var _videoPath = '';
// 创建临时文件夹
function createTempDir(pa) {
    const tmpDir = fs.mkdtempSync(path.join(pa, 'thumbs-'));
    return tmpDir;
  }
const Zhuanma=(data)=>{
    console.log(data.path)
    let outputPath = path.dirname(data.path);
    let win = getMainWindow();
    ffmpeg(data.path).videoCodec('libx264').outputOptions('-crf 28').save(`${outputPath}/ys.mp4`).on("end",()=>{
            win.webContents.send('ZhuanmaDone', 'done');
    });  
}
const dropVideo=(data)=>{
    console.log(data.path)
    let win = getMainWindow();
    let p =data.path;
    _videoPath = data.path;
    let outp = path.dirname(data.path);
    const temp=  createTempDir(outp);
    let outputPath = path.join(temp, 'thumb_%05d.jpg');
    ffmpeg(p)
    .outputOptions([
        '-vf', 'fps=1',     // 每秒1帧
        '-q:v', '20'         // 图片质量高
      ])
    .save(`${outputPath}`).on("end",()=>{
        const fi=dropImage(temp);
        win.webContents.send('dropVideoDone', fi);
    });
}
function dropImage(tempFolder){
    const files = fs.readdirSync(tempFolder)
        .filter(file => file.endsWith('.jpg'))
        .map(file => path.join(tempFolder, file));
      // 排序保证时间顺序一致
      files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      return files; 
}
async function cutVideo(data) {
    console.log('kaishila');
  
    let win = getMainWindow();
    let outp = path.dirname(_videoPath);
    const temp=  createTempDir(outp);
    
    Promise.all(
      data.map((item, index) => {
        let outputPath = path.join(temp, `thumb${index}.mp4`);  
        return cutSegment(item.source,item.start,item.end, outputPath) 
      })
    ).then((res)=>{
      console.log('done',res);
      win.webContents.send('cutVideoDone');
    })
    
  }
//剪辑视频的方法
function cutSegment(source, start, end, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(source)
      .setStartTime(start)
      .setDuration(end - start)
      .output(output)
      .on('end', () => {resolve(output)})
      .on('error', reject)
      .run();
  });
}
//加水印
function AddWatermark(inputVideo,output) {
  return new Promise((resolve, reject) => { 
    ffmpeg(inputVideo)
    .videoFilters({
      filter: 'drawtext',
      options: {
        fontfile: '/public/mingzi.ttf', // 字体路径
        text: '我的水印',
        fontsize: 24,
        fontcolor: 'white',
        x: '(w-text_w)-10', // 右下角
        y: '(h-text_h)-10'
      }
    })
    .on('end', () =>{
      resolve(output)
    })
    .on('error', err => reject(err))
    .save(output);
  });
    
}

//加水印剪辑
async function CutAndAddWatermark(data) {
  let tempOutput = await cutVideo(data);
  let waterMarked = await AddWatermark(tempOutput, 'watermarked_video.mp4');
  console.log('CutAndAddWatermarkDone',waterMarked);
  return waterMarked;

}
function ChangeImgEle(data){
    console.log(data,5555)
    const oldImg= getRealImagePathFromWebUrl(data[0]); // Web 中的图片地址
    console.log(oldImg,6666)
    const newImg = data[1];
    CopyImg(oldImg,newImg);
  
}
function getRealImagePathFromWebUrl(webUrl) {
  const projectRoot = path.join(__dirname, '../../');
  console.log(projectRoot,7777)
  const p2 = path.join(projectRoot, 'public');
  const urlObj = new URL(webUrl);
  
  const relativePath = decodeURIComponent(urlObj.pathname).replace(/^\/+/, '');
  return path.join(p2, relativePath);
}
function CopyImg(o,n){
  let win = getMainWindow();
    fs.copyFile(n,o,(err)=>{
      if(err){
        console.log(err)
      }
       console.log('CopyImgDone')
    })
}
async function GetImagesFromFolder(folderPath){
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
   function walk(dir) {
    let results = [];

    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath)); // ⬅ 递归子文件夹
      } else {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    });

    return results;
  }
  const images = walk(folderPath);
  return images;
}
 async function ChangeImg2(data){
  console.log(data,666)
  const oldImg = data[0];
  const newImg = data[1];
 await fs.copyFileSync(newImg,oldImg);
 console.log('ChangeImg2Done')
}
export {
    Zhuanma,
    dropVideo,
    cutVideo,
    ChangeImgEle,
    GetImagesFromFolder,
    ChangeImg2,
    CutAndAddWatermark
}