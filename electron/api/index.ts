import  path  from 'node:path';
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { getMainWindow } from "../main/index";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);


const Zhuanma=(data)=>{
    console.log(data.path)
    let outputPath = path.dirname(data.path);
    let win = getMainWindow();
    ffmpeg(data.path).videoCodec('libx264').outputOptions('-crf 28').save(`${outputPath}/ys.mp4`).on("end",()=>{
            win.webContents.send('ZhuanmaDone', 'done');
    });  
}
export {
    Zhuanma
}