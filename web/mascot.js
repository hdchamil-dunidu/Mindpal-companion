import {MascotViewer} from './mascot/mascot-viewer.js';
import {attachAccessories} from './mascot/accessories.js';
import {MOODS} from './domain.js';
export class Luma {
 constructor(canvas,sound){
  this.canvas=canvas;this.sound=sound;this.mood='calm';this.mode='idle';this.until=0;this.clock=0;this.blink=0;this.nextBlink=3;this.activity=null;
  this.v=new MascotViewer(canvas,{transparent:true,reducedMotion:false});const v=this.v;
  v.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));v.renderer.shadowMap.enabled=false;v.key.castShadow=false;v.resetCamera=()=>{v.camera.position.set(0,.30,Math.max(5.9,4.0/v.camera.aspect));v.controls.target.set(0,.1,0);v.controls.update();};
  this.ready=v.ready.then(()=>{
   v.mixer.removeEventListener('finished',v.onFinished);
   this.eyes=['EyeLeft','EyeRight'].map(n=>v.model.getObjectByName(n));this.mouth=v.model.getObjectByName('Mouth');this.eyeScales=this.eyes.map(e=>e.scale.clone());this.mouthScale=this.mouth.scale.clone();
   v.beforeRender=dt=>this.frame(dt);v.resize();this.restore();this.react('greeting',3);return this;
  });
  let gesture,lastTap=0,tapTimer,hold;
  const track=e=>{if(v.reducedMotion)return;const r=canvas.getBoundingClientRect();v.look.set(Math.max(-.38,Math.min(.38,(e.clientX-r.left-r.width/2)/r.width*.7)),Math.max(-.24,Math.min(.24,(e.clientY-r.top-r.height/2)/r.height*.45)));};
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;this.sound.unlock();gesture={x:e.clientX,y:e.clientY,hit:v.hit(e),moved:false,held:false};track(e);clearTimeout(hold);hold=setTimeout(()=>{if(gesture&&!gesture.moved&&gesture.hit){gesture.held=true;this.react('curious');this.sound.cue('tap');}},550);});
  canvas.addEventListener('pointermove',e=>{if(gesture&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>12){gesture.moved=true;clearTimeout(hold);}if(e.pointerType==='mouse'||gesture)track(e);});
  canvas.addEventListener('pointerup',()=>{clearTimeout(hold);if(gesture?.hit&&!gesture.moved&&!gesture.held){const now=performance.now();if(now-lastTap<300){clearTimeout(tapTimer);this.react('happy');this.sound.cue('success');lastTap=0;}else{lastTap=now;tapTimer=setTimeout(()=>{this.react('slap',1.7);this.sound.cue('tap');},300);}}gesture=null;});
  const cancel=()=>{clearTimeout(hold);gesture=null;v.look.set(0,0);};canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('pointerleave',cancel);
  canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();this.sound.unlock();this.react('happy');this.sound.cue('success');}});
 }
 setMood(mood){if(MOODS[mood])this.mood=mood;if(!this.until&&!this.activity)this.restore();}
 setSettings(settings){this.v.setReducedMotion(settings.reducedMotion);this.restore();}
 setLook(look){if(this.v.model)attachAccessories(this.v,look);}
 restore(){this.mode=MOODS[this.mood].reaction;this.until=0;const clip=['tired','stressed'].includes(this.mode)?this.mode:'idle';this.v.play(clip,{quiet:true});}
 react(mode,seconds=3){if(!this.v.model)return;this.mode=mode;this.until=performance.now()+seconds*1000;const clip=this.v.actions[mode]?mode:mode==='thinking'?'working':'idle';this.v.play(clip,{quiet:true});}
 frame(dt){
  const v=this.v;if(!this.eyes)return;const motion=!v.reducedMotion;this.clock+=dt;if(this.until&&performance.now()>this.until)this.restore();
  let mode=this.activity?.running?this.activity.kind==='focus'?'working':this.activity.kind==='dance'?'dance':this.activity.kind:this.mode;
  this.eyes.forEach((e,i)=>e.scale.copy(this.eyeScales[i]));this.mouth.scale.copy(this.mouthScale);v.tracking.position.set(0,0,0);v.tracking.scale.setScalar(1);v.tracking.rotation.z=0;
  const morph=(eye,key,value)=>{const i=eye.morphTargetDictionary?.[key];if(i!==undefined)eye.morphTargetInfluences[i]=value;};
  if(['sad','curious','talking','listening','breathing','stretching','happy','love'].includes(mode))this.eyes.forEach(e=>e.morphTargetInfluences.fill(0));
  if(mode==='sad'){this.eyes.forEach(e=>morph(e,'tired',.82));v.tracking.rotation.x+=.12;v.tracking.rotation.z=-.06;}
  if(mode==='happy')this.eyes.forEach(e=>morph(e,'happy',.9));
  if(mode==='love')this.eyes.forEach(e=>morph(e,'heart',.8));
  if(mode==='curious'){v.tracking.rotation.z=.14;this.eyes[1].scale.y*=.7;}
  if(mode==='listening')v.tracking.rotation.z=.07;
  if(mode==='talking'){this.mouth.scale.set(.5,motion?.25+Math.abs(Math.sin(this.clock*9))*.32:.3,1);if(this.mouth.morphTargetInfluences)this.mouth.morphTargetInfluences[0]=1;}
  if(mode==='breathing'&&motion){const sec=this.activity.elapsed/1000;v.tracking.scale.setScalar(1+(1-Math.cos(sec*Math.PI/4))*.035);}
  if(mode==='stretching'&&motion)v.tracking.rotation.z=Math.sin(this.activity.elapsed/1000*.6)*.10;
  if(this.activity?.running&&mode==='dance'&&v.state!=='dance')v.play('dance',{quiet:true});
  if(this.activity?.running&&mode==='working'&&v.state!=='working')v.play('working',{quiet:true});
  this.blink+=dt;if(this.blink>this.nextBlink){this.blink=0;this.nextBlink=3+Math.random()*3;}
  if(motion&&this.blink<.22&&!['slap','error','wink','yawn'].includes(mode))this.eyes.forEach(e=>morph(e,'flat',Math.sin(this.blink/.22*Math.PI)));
 }
 setActivity(activity){const was=this.activity?.running;this.activity=activity;if(was&&!activity?.running)this.restore();}
}
