import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {REACTIONS} from './mascot-factory.js';

/** Reusable browser/WebView mascot. No application services or backend required. */
export class MascotViewer extends EventTarget {
  constructor(canvas,{modelUrl='/models/luma-pearl.glb',transparent=false,reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches}={}) {
    super();this.canvas=canvas;this.modelUrl=modelUrl;this.reducedMotion=reducedMotion;this.state='idle';this.paused=false;this.disposed=false;this.actions={};this.look=new THREE.Vector2();this.currentLook=new THREE.Vector2();this.frame=0;this.slaps=[];this.transparent=transparent;this.sound=false;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.setClearColor(0x000000,0);
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.16;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(31,1,.1,50);this.camera.position.set(0,.32,6.6);
    this.controls=new OrbitControls(this.camera,canvas);this.controls.target.set(0,.15,0);this.controls.enableDamping=true;this.controls.enablePan=false;this.controls.minDistance=4.5;this.controls.maxDistance=9;this.controls.minPolarAngle=Math.PI*.22;this.controls.maxPolarAngle=Math.PI*.72;this.controls.enabled=false;
    const pmrem=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.environment=pmrem.fromScene(room,.04);this.scene.environment=this.environment.texture;room.dispose();pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight(0xeaf7ff,0x59718e,2.1));
    this.key=new THREE.DirectionalLight(0xfff5e8,3.8);this.key.position.set(-3,5,4);this.key.castShadow=true;this.key.shadow.mapSize.set(1024,1024);this.key.shadow.camera.left=-3;this.key.shadow.camera.right=3;this.key.shadow.camera.top=3;this.key.shadow.camera.bottom=-3;this.key.shadow.normalBias=.025;this.scene.add(this.key);
    const rim=new THREE.DirectionalLight(0x93d9ff,2.8);rim.position.set(3,1,-2);this.scene.add(rim);
    this.underlight=new THREE.PointLight(0x75ceff,5,5,2);this.underlight.position.set(0,-1.6,1.2);this.scene.add(this.underlight);
    this.floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.23,color:0x05182a}));this.floor.rotation.x=-Math.PI/2;this.floor.position.y=-1.42;this.floor.receiveShadow=true;this.scene.add(this.floor);
    this.halo=new THREE.Sprite(new THREE.SpriteMaterial({map:this.glowTexture(),color:0x66bcfa,opacity:.19,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));this.halo.position.set(0,0,-1.4);this.halo.scale.set(4.2,4.2,1);this.scene.add(this.halo);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.handlers=[];
    this.listen(canvas,'pointermove',e=>this.pointerMove(e));this.listen(canvas,'pointerleave',()=>this.look.set(0,0));
    this.listen(canvas,'pointerdown',e=>{if(e.button===0)this.pointerDown={x:e.clientX,y:e.clientY,t:performance.now()};});
    this.listen(canvas,'pointerup',e=>{const p=this.pointerDown;this.pointerDown=null;if(!p||this.controls.enabled||Math.hypot(e.clientX-p.x,e.clientY-p.y)>12)return;
      if(!this.hit(e))return;if(performance.now()-p.t>480)this.play('love');else this.slap();});
    this.listen(canvas,'dblclick',e=>{if(this.hit(e)){e.preventDefault();this.play('love');}});
    this.listen(canvas,'contextmenu',e=>{if(this.hit(e)){e.preventDefault();this.play('greeting');}});
    this.visibility=()=>{this.hidden=document.hidden;this.last=performance.now();};this.listen(document,'visibilitychange',this.visibility);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();this.setTransparent(transparent);this.last=performance.now();
    this.ready=this.load();this.tick=this.tick.bind(this);this.frame=requestAnimationFrame(this.tick);
  }
  listen(el,event,fn) {el.addEventListener(event,fn);this.handlers.push(()=>el.removeEventListener(event,fn));}
  glowTexture() {const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(.3,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
  async load() {
    const gltf=await new GLTFLoader().loadAsync(this.modelUrl);if(this.disposed)return;
    this.model=gltf.scene;this.scene.add(this.model);this.model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    this.tracking=new THREE.Group();this.tracking.name='PointerTracking';this.scene.remove(this.model);this.tracking.add(this.model);this.scene.add(this.tracking);
    this.mixer=new THREE.AnimationMixer(this.model);gltf.animations.forEach(clip=>this.actions[clip.name]=this.mixer.clipAction(clip));
    for(const key of Object.keys(REACTIONS))if(!this.actions[key])throw new Error(`Model is missing animation: ${key}`);
    this.onFinished=e=>{if(e.action===this.active&&!REACTIONS[this.state].loop)this.play('idle',{quiet:true});};this.mixer.addEventListener('finished',this.onFinished);
    this.play(this.reducedMotion?'idle':'greeting',{quiet:true});this.dispatchEvent(new CustomEvent('ready',{detail:{clips:gltf.animations.map(c=>c.name)}}));return this;
  }
  play(name,{quiet=false}={}) {
    if(!REACTIONS[name])throw new RangeError(`Unknown mascot reaction: ${name}`);
    if(!this.actions[name])return false;
    const next=this.actions[name];if(this.active===next){next.reset();next.play();}else{
      next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);next.setLoop(REACTIONS[name].loop?THREE.LoopRepeat:THREE.LoopOnce,REACTIONS[name].loop?Infinity:1);next.clampWhenFinished=true;next.play();
      if(this.active) {const old=this.active;old.fadeOut(.2);next.fadeIn(.2);clearTimeout(this.stopTimer);this.stopTimer=setTimeout(()=>{for(const a of Object.values(this.actions))if(a!==this.active)a.stop();},230);}
      this.active=next;
    }
    this.state=name;if(!quiet&&this.sound)this.chime(name);
    this.dispatchEvent(new CustomEvent('reactionchange',{detail:{name,...REACTIONS[name]}}));return true;
  }
  slap() {const now=performance.now();this.slaps=this.slaps.filter(t=>now-t<1700);this.slaps.push(now);if(this.slaps.length>=3){this.slaps=[];this.play('annoyed');clearTimeout(this.annoyedTimer);this.annoyedTimer=setTimeout(()=>{if(this.state==='annoyed')this.play('idle',{quiet:true});},2400);}else this.play('slap');}
  pointerMove(e) {if(!this.hit(e)){this.look.set(0,0);return;}const rect=this.canvas.getBoundingClientRect();this.look.set(((e.clientX-rect.left)/rect.width-.5)*.7,((e.clientY-rect.top)/rect.height-.5)*.4);}
  hit(e) {if(!this.model)return false;const r=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);return this.raycaster.intersectObject(this.model,true).some(h=>h.object.name==='PearlBody');}
  setTransparent(on) {this.transparent=on;this.floor.visible=!on;this.halo.visible=!on;this.canvas.classList.toggle('transparent',on);}
  setInspect(on) {this.controls.enabled=on;this.look.set(0,0);if(!on)this.resetCamera();}
  resetCamera() {this.camera.position.set(0,.32,6.6);this.controls.target.set(0,.15,0);this.controls.update();}
  setReducedMotion(on) {this.reducedMotion=on;this.look.set(0,0);if(on)this.play('idle',{quiet:true});}
  setSound(on) {this.sound=on;if(on){this.audio??=new (window.AudioContext||window.webkitAudioContext)();this.audio.resume().catch(()=>{});}}
  chime(name) {if(!this.audio)return;this.audio.resume().catch(()=>{});const frequencies={greeting:660,working:440,slap:150,annoyed:180,error:120,happy:784,love:880,wink:740,yawn:260,dance:523,stressed:300,tired:220};const ctx=this.audio,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(frequencies[name]||440,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime((frequencies[name]||440)*1.3,ctx.currentTime+.16);gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.045,ctx.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.25);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.26);}
  resize() {const r=this.canvas.parentElement.getBoundingClientRect();this.renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);this.camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);this.camera.updateProjectionMatrix();}
  tick(now) {if(this.disposed)return;const dt=Math.min((now-this.last)/1000,.05);this.last=now;
    if(!this.hidden) {if(!this.paused&&this.mixer)this.mixer.update(this.reducedMotion?0:dt);
      this.currentLook.lerp(this.look,1-Math.exp(-dt*8));if(this.tracking){this.tracking.rotation.y=this.reducedMotion?0:this.currentLook.x;this.tracking.rotation.x=this.reducedMotion?0:this.currentLook.y;}
      this.controls.update();this.renderer.render(this.scene,this.camera);}
    this.frame=requestAnimationFrame(this.tick);
  }
  dispose() {this.disposed=true;cancelAnimationFrame(this.frame);clearTimeout(this.stopTimer);clearTimeout(this.annoyedTimer);this.resizeObserver.disconnect();this.handlers.forEach(f=>f());this.controls.dispose();this.mixer?.stopAllAction();if(this.mixer&&this.onFinished)this.mixer.removeEventListener('finished',this.onFinished);
    const materials=new Set(),geometries=new Set(),textures=new Set();this.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])materials.add(m);});materials.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());this.environment.dispose();this.renderer.dispose();this.audio?.close();}
}
