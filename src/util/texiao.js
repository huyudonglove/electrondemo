import * as THREE from 'three';
import Stats from 'stats.js';
export class TexiaoScene {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.renderer = new THREE.WebGLRenderer();
        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.clock = new THREE.Clock();  
        this.shaderMap = new Map();
        this.shaderKey = 'fragmentShader'; 
        this.setMap();
        this.material = new THREE.ShaderMaterial({
            vertexShader: this.shaderMap.get('vertexShader'),
            fragmentShader: this.shaderMap.get('fragmentShader'),
            uniforms: {
                uTime: { value: 0 },
                uVideo: { value: null},
                uTexture: { value: null },
                uBloom: { value: null },
                uIntensity: { value: 1.0 },
                uResolution:{value:new THREE.Vector2(1388, 720)}
            }
        });
        this.renderer.setSize(1388, 720)
        container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
        
        this.stats = new Stats();
        this.stats.showPanel(0); // 0 = FPS
        document.body.appendChild(this.stats.dom);
        this.rt1 =  new THREE.WebGLRenderTarget(1388, 720);
        this.rt2 =  new THREE.WebGLRenderTarget(1388, 720);
        this.rt3 =  new THREE.WebGLRenderTarget(1388, 720);
        this.animate();
    }
    addTexture(texture) {
        // console.log(texture);
        this.texture = texture;
        this.material.uniforms.uVideo.value = texture;
    }
    animate() {
        this.ainId1 =requestAnimationFrame(() => this.animate());
        this.stats.begin();
        this.material.uniforms.uTime.value = this.clock.getElapsedTime()
        this.renderer.render(this.scene, this.camera);
        this.stats.end();
    }
    setMap(key, shader) {
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;
        const niuquShader =`
            uniform sampler2D uVideo;
            uniform float uTime;
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv;
                // 可选：轻微时间扭曲（VFX 起点）
                uv.x += sin(uv.y * 10.0 + uTime) * 0.02;
                vec3 videoColor = texture2D(uVideo, uv).rgb;
                gl_FragColor = vec4(videoColor, 1.0);
            }
        `;
        const huiduShader = `
            uniform sampler2D uVideo;
            uniform float uTime;
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv;
                vec3 videoColor = texture2D(uVideo, uv).rgb;
                // 灰度化
                float gray = dot(videoColor, vec3(0.299, 0.587, 0.114));
                gl_FragColor = vec4(vec3(gray), 1.0);   
            }
        `;
        const fragmentShader = `
            uniform sampler2D uVideo;
            uniform float uTime;
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv;
                vec3 videoColor = texture2D(uVideo, uv).rgb;
                gl_FragColor = vec4(videoColor, 1.0);
            }
        `;
        const guzhangShader = `
            uniform sampler2D uVideo;
            uniform float uTime;
            varying vec2 vUv;

            void main() {
                vec2 offset = vec2(0.01,0.0);
                vec2 uv = vUv;
                vec3 videoColor = texture2D(uVideo, uv).rgb;
                
                float r = texture2D(uVideo, uv + offset).r;
                float g = texture2D(uVideo, uv).g;
                float b = texture2D(uVideo, uv - offset).b;
                gl_FragColor = vec4(vec3(r, g, b), 1.0);
            }`;
        const xiangsuoShader = `
            uniform sampler2D uVideo;
            uniform float uTime;
            varying vec2 vUv;
            void main() {
                float size = 0.002;
                vec2 uv = floor(vUv / size) * size;
                vec3 videoColor = texture2D(uVideo, uv).rgb;

                vec3 color = texture2D(uVideo, uv).rgb;
                gl_FragColor = vec4(color, 1.0);
            }`;
        const scanShader = `
            uniform sampler2D uVideo;
            uniform float uTime;
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv;
                vec3 videoColor = texture2D(uVideo, uv).rgb;
                float scan = sin(vUv.y * 800.0 + uTime * 2.0) * 0.05;
                gl_FragColor = vec4(videoColor - vec3(scan), 1.0);
            }`;
        const noiseShader = `
            uniform sampler2D uVideo;
            uniform float uTime;
            varying vec2 vUv;
            void main() {
                vec2 uv = vUv;
                vec3 videoColor = texture2D(uVideo, uv).rgb;
                float noise = fract(sin(dot(vUv, vec2(12.9898,78.233))) * 43758.5453);
                gl_FragColor = vec4(videoColor + vec3(noise), 1.0);
            }`;
        this.shaderMap.set('vertexShader', vertexShader);
        this.shaderMap.set('niuqu', niuquShader);
        this.shaderMap.set('fragmentShader', fragmentShader);
        this.shaderMap.set('huiduShader', huiduShader);
        this.shaderMap.set('guzhangShader', guzhangShader);
        this.shaderMap.set('xiangsuoShader', xiangsuoShader);
        this.shaderMap.set('scanShader', scanShader);
        this.shaderMap.set('noiseShader', noiseShader);
    }
    toggleEffect(val){
        cancelAnimationFrame(this.gaosiId);
        this.shaderKey = val;
        // console.log( this.shaderMap.get(this.shaderKey));
        this.material.fragmentShader = this.shaderMap.get(this.shaderKey);
        this.material.needsUpdate = true;
        this.mesh.material = this.material;
        this.animate();
    }
    bloomEffect() {
        
        const gaoliangShader =`
            uniform sampler2D uTexture;
            varying vec2 vUv;

            void main() {
                vec3 color = texture2D(uTexture, vUv).rgb;

                float brightness = dot(color, vec3(0.299,0.587,0.114));

                if(brightness > 0.7)
                    gl_FragColor = vec4(color,1.0);
                else
                    gl_FragColor = vec4(0.0);
            }

        `;
        const mohuShader = `
            uniform sampler2D uTexture;
            uniform sampler2D uBloom;
            uniform float uIntensity;
            varying vec2 vUv;

            void main() {
                vec3 bloom = texture2D(uBloom, vUv).rgb;
                vec3 origin = texture2D(uTexture, vUv).rgb;

                gl_FragColor = vec4(origin + bloom * uIntensity, 1.0);  
            }`;
        const bloomShader = `
            uniform sampler2D uTexture;
            uniform sampler2D uBloom;
            uniform float uIntensity;
            varying vec2 vUv;

            void main() {
                vec3 bloom = texture2D(uBloom, vUv).rgb;
                vec3 origin = texture2D(uTexture, vUv).rgb;

                gl_FragColor = vec4(origin + bloom * uIntensity, 1.0);
            }`;
        
        this.material.fragmentShader = gaoliangShader; 
        this.renderer.setRenderTarget(this.rt1);
        this.renderer.render(this.scene, this.camera);
        this.material.fragmentShader = mohuShader;
        this.material.uniforms.uTexture.value = this.rt1.texture;
        this.renderer.setRenderTarget(this.rt2);
        this.renderer.render(this.scene, this.camera);
        this.material.fragmentShader = bloomShader;
        this.material.uniforms.uTexture.value = this.rt1.texture;
        this.material.uniforms.uBloom.value = this.rt2.texture;
        this.material.uniforms.uIntensity.value = 1.5;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
        
        this.brightMaterial = new THREE.ShaderMaterial({
            uniforms: this.material.uniforms,
            vertexShader: this.shaderMap.get('vertexShader'),
            fragmentShader: gaoliangShader
        });
        this.blurMaterial   = new THREE.ShaderMaterial({
            uniforms: this.material.uniforms,
            vertexShader: this.shaderMap.get('vertexShader'),
            fragmentShader: mohuShader
        });
        this.finalMaterial  = new THREE.ShaderMaterial({
            uniforms: this.material.uniforms,
            vertexShader: this.shaderMap.get('vertexShader'),
            fragmentShader: bloomShader
        });
        cancelAnimationFrame(this.ainId1);
        this.bloomAnimate();
    }
    bloomAnimate() { 
        this.geometry.material = this.brightMaterial;
        this.material.needsUpdate = true;
        this.renderer.setRenderTarget(this.rt1);        
        this.renderer.render(this.scene, this.camera);


        this.geometry.material = this.blurMaterial;
        this.material.needsUpdate = true;
        this.renderer.setRenderTarget(this.rt2);
        this.renderer.render(this.scene, this.camera);


        this.geometry.material = this.finalMaterial;
        this.material.needsUpdate = true;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.bloomAnimate.bind(this));    
    }
    gaosiEffect(){
       
       const normal1DShader = `
            uniform sampler2D uVideo;
            varying vec2 vUv;
            void main() {
                vec3 origin = texture2D(uVideo, vUv).rgb;
                gl_FragColor = vec4(origin, 1.0);
            }`; 
        this.mat1 = new THREE.ShaderMaterial({
            uniforms: {
                ...this.material.uniforms
            },
            vertexShader: this.shaderMap.get('vertexShader'),
            fragmentShader: normal1DShader
        });
        const normal2DShader = `
            uniform sampler2D uTexture;
            uniform sampler2D uHistory;
            varying vec2 vUv;
            void main() {
                vec3 origin = texture2D(uTexture, vUv).rgb;
                vec3 history = texture2D(uHistory, vUv).rgb;
                vec3 color = mix(origin, history, 0.9);
                gl_FragColor = vec4(color, 1.0);   
            }`;
        this.mat2 = new THREE.ShaderMaterial({
            uniforms: {
                ...this.material.uniforms,
                uTexture: {
                    value: null
                },
                uHistory: {
                    value: null
                }
            },
            vertexShader: this.shaderMap.get('vertexShader'),
            fragmentShader: normal2DShader
        });
        //第三个渲染通道
        const normal3DShader = `
            uniform sampler2D uTexture;
            varying vec2 vUv;
            void main() {
                vec3 origin = texture2D(uTexture, vUv).rgb;
                gl_FragColor = vec4(origin, 1.0);
            }
            `;
        this.mat3 = new THREE.ShaderMaterial({
            uniforms: {
                ...this.material.uniforms,
                uTexture: {
                    value: null
                }
            },
            vertexShader: this.shaderMap.get('vertexShader'),
            fragmentShader: normal3DShader
        });
        cancelAnimationFrame(this.ainId1);
        this.gaosiAnimate();
    }
    gaosiAnimate() { 
        this.stats.begin();
        // 第一次渲染到rt1
        this.mesh.material = this.mat1;
        this.mat1.needsUpdate = true;
        this.renderer.setRenderTarget(this.rt1);
        this.renderer.render(this.scene, this.camera);

        // 第二次渲染到rt3,同一帧数据，然后倒回rt2
        this.mesh.material = this.mat2;
        this.mat2.uniforms.uTexture.value = this.rt1.texture;
        this.mat2.uniforms.uHistory.value = this.rt2.texture;
        this.mat2.needsUpdate = true;
        this.renderer.setRenderTarget(this.rt3);
        this.renderer.render(this.scene, this.camera);
        let temp = this.rt2;
        this.rt2 = this.rt3;
        this.rt3 = temp;
        // 第三次渲染到屏幕
        this.mesh.material = this.mat3;
        this.mat3.uniforms.uTexture.value = this.rt3.texture;
        this.mat3.needsUpdate = true;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
        this.stats.end();
        this.gaosiId = requestAnimationFrame(this.gaosiAnimate.bind(this));
    }
    addImgTexture(){
        

    }
}
