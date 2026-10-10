import * as THREE from 'three';

// Original Luma geometry. No Coucou artwork, audio, or character meshes are used.
// The animated GLB is built from this file. +Y is up; the face points along +Z.
export const REACTIONS = {
  idle: {label:'Idle', duration:4, loop:true, description:'A gentle breath. Ready when you are.'},
  greeting: {label:'Greeting', duration:3, loop:false, description:'A little wave to say hello.'},
  working: {label:'Working', duration:4, loop:true, description:'Focused eyes and a small pulsing blue activity badge.'},
  slap: {label:'Slap', duration:1.7, loop:false, description:'A soft squash, a startled wobble, then recovery.'},
  annoyed: {label:'Annoyed', duration:3, loop:true, description:'Narrow eyes and a tiny, unimpressed head shake.'},
  error: {label:'Angry / Error', duration:3, loop:true, description:'Angry brows and a coral warning pulse.'},
  happy: {label:'Happy', duration:2.8, loop:false, description:'Bright crescent eyes and a joyful bounce.'},
  love: {label:'Love', duration:3.2, loop:false, description:'Heart-shaped eyes and softly floating hearts.'},
  wink: {label:'Wink', duration:2, loop:false, description:'One eye closes with a playful little tilt.'},
  yawn: {label:'Yawn', duration:3.6, loop:false, description:'A slow stretch, sleepy eyes, and a wide yawn.'},
  dance: {label:'Dance', duration:4, loop:true, description:'A bouncing two-step with swaying hands.'},
  stressed: {label:'Stressed', duration:3, loop:true, description:'A nervous shiver and a little blue sweat drop.'},
  tired: {label:'Tired', duration:4, loop:true, description:'Heavy eyelids, a slow nod, and softer breathing.'},
};
const TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const envelope=(t,d,r=.35)=>smooth(t/r)*smooth((d-t)/r);
function material(name,color,extra={}) {
  const m=new THREE.MeshPhysicalMaterial({color,roughness:.31,metalness:.04,clearcoat:.75,clearcoatRoughness:.22,...extra});
  m.name=name;return m;
}
function mesh(name,geometry,mat,parent,position=[0,0,0],scale=[1,1,1]) {
  const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.fromArray(position);m.scale.fromArray(scale);
  m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function group(name,parent,position=[0,0,0]) {const g=new THREE.Group();g.name=name;g.position.fromArray(position);parent.add(g);return g;}
function heartGeometry(size=.18) {
  const s=new THREE.Shape();s.moveTo(0,-.7);s.bezierCurveTo(-1,-.1,-.9,.65,-.43,.65);s.bezierCurveTo(-.15,.65,0,.4,0,.3);
  s.bezierCurveTo(0,.4,.15,.65,.43,.65);s.bezierCurveTo(.9,.65,1,-.1,0,-.7);
  const g=new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.06,bevelThickness:.045,curveSegments:14});
  g.scale(size,size,size);g.computeVertexNormals();return g;
}
// Every eye uses the same topology. Capsule -> happy arch / flat lid / angry eye /
// heart / sleepy lid. True morph targets travel with the GLB into other engines.
function eyeGeometry(side) {
  const rings=32,segments=12;
  function vertices(kind) {
    const v=[];
    for(let i=0;i<=rings;i++) {
      const u=i/rings;let x=0,y=(u-.5)*.32,r=.057*Math.pow(Math.sin(Math.PI*u),.38);
      if(kind==='happy') {x=(u-.5)*.22;y=.03+Math.sin(Math.PI*u)*.07;r=.019*Math.pow(Math.sin(Math.PI*u),.25);}
      if(kind==='flat') {x=(u-.5)*.22;y=0;r=.022*Math.pow(Math.sin(Math.PI*u),.27);}
      if(kind==='angry') {x=(u-.5)*.23;y=side*x*.55;r=.03*Math.pow(Math.sin(Math.PI*u),.28);}
      if(kind==='tired') {x=(u-.5)*.22;y=-.018-Math.sin(Math.PI*u)*.025;r=.022*Math.pow(Math.sin(Math.PI*u),.28);}
      if(kind==='heart') {
        const a=TAU*u;x=.006*16*Math.pow(Math.sin(a),3);
        y=.006*(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))+.02;r=.035;
      }
      for(let j=0;j<=segments;j++) {
        const a=TAU*j/segments;
        // A curved tube laid on the front of the body, with visible depth.
        const dy=kind==='open'?0:Math.cos(a)*r;
        const fill=(1+Math.cos(a))/2;
        const vx=kind==='heart'?x*fill:x+(kind==='open'?-Math.cos(a)*r:0);
        const vy=kind==='heart'?y*fill:y+dy;
        const gy=.045+vy,gx=side*.22+vx;
        const surface=Math.sqrt(Math.max(0,1-gy*gy-gx*gx));
        v.push(vx,vy,surface-.968+.011+Math.sin(a)*(kind==='heart'?.012:r*.24));
      }
    }
    return new Float32Array(v);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(vertices('open'),3));
  const indices=[];for(let i=0;i<rings;i++)for(let j=0;j<segments;j++) {const a=i*(segments+1)+j,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
  g.setIndex(indices);g.computeVertexNormals();
  const names=['happy','flat','angry','heart','tired'];
  g.morphAttributes.position=names.map(k=>new THREE.BufferAttribute(vertices(k),3));
  g.morphAttributes.normal=names.map((k,i)=>{const temp=g.clone();temp.morphAttributes={};temp.setAttribute('position',g.morphAttributes.position[i]);temp.computeVertexNormals();return temp.getAttribute('normal');});
  g.userData={morphNames:names};return g;
}
function mouthGeometry() {
  const g=new THREE.TorusGeometry(.085,.013,8,32,Math.PI);g.rotateZ(Math.PI);g.scale(1,.55,1);
  const p=g.getAttribute('position');const a=p.array.slice();
  // Yawn target uses the same half-torus topology remapped to a closed oval.
  for(let i=0;i<p.count;i++) {
    const x=p.getX(i),y=p.getY(i);const theta=Math.atan2(y/.55,x);
    const t=(theta+Math.PI)/Math.PI*TAU;
    const radial=Math.hypot(x,y/.55)-.085;
    a[i*3]=Math.cos(t)*(.083+radial);a[i*3+1]=Math.sin(t)*(.13+radial);a[i*3+2]=p.getZ(i);
  }
  g.morphAttributes.position=[new THREE.BufferAttribute(a,3)];return g;
}
export function createMascot() {
  const model=new THREE.Group();model.name='Luma';
  model.userData={author:'Original mascot created for Chamil Dunidu',version:'2.0',design:'Minimal round pearl orb',front:'+Z',units:'metres',rig:'Transform hierarchy and facial morph targets',reactions:Object.keys(REACTIONS)};
  const root=group('Motion',model),bodyRig=group('BodyRig',root),face=group('FaceRig',bodyRig);
  const pearl=material('Pearl porcelain',0xffffff,{vertexColors:true,roughness:.4,clearcoat:.35,iridescence:.06,iridescenceIOR:1.35});
  const ink=material('Soft black ink',0x111a24,{roughness:.66,clearcoat:.08,metalness:0,side:THREE.DoubleSide});
  const blue=material('Luma blue',0x81d9fa,{emissive:0x1988c7,emissiveIntensity:.24,roughness:.23});
  const coral=material('Coral warning',0xff596d,{emissive:0xff2341,emissiveIntensity:.35});
  const pink=material('Love pink',0xf889b5,{emissive:0xb73972,emissiveIntensity:.13});
  const geo=new THREE.SphereGeometry(1,64,48);const pos=geo.getAttribute('position'),col=[];
  const top=new THREE.Color('#fffdfa'),bottom=new THREE.Color('#d5ebf5');
  for(let i=0;i<pos.count;i++) {
    const y=pos.getY(i);
    // Preserve the sphere itself; expression comes from the animated rig.
    const c=top.clone().lerp(bottom,Math.pow(clamp((1-y)/2),2.1)*.44);col.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
  mesh('PearlBody',geo,pearl,bodyRig);
  const simple=new THREE.SphereGeometry(1,24,16);
  const eyes=[];
  for(const side of [-1,1]) {
    const e=mesh(side===-1?'EyeLeft':'EyeRight',eyeGeometry(side),ink,face,[side*.22,.045,.968]);
    e.morphTargetDictionary={happy:0,flat:1,angry:2,heart:3,tired:4};e.morphTargetInfluences=[0,0,0,0,0];eyes.push(e);
  }
  // The only mouth is a small temporary oval during a yawn.
  const mouth=mesh('Mouth',mouthGeometry(),ink,face,[0,-.19,.99]);mouth.morphTargetDictionary={yawn:0};mouth.morphTargetInfluences=[0];
  const hands=[];
  for(const side of [-1,1]) {
    const hand=group(side<0?'HandLeft':'HandRight',bodyRig,[side*1.17,-.08,.03]);
    mesh(side<0?'PalmLeft':'PalmRight',simple,material(side<0?'Left hand pearl':'Right hand pearl',0xf3f8fc),hand,[0,0,0],[.155,.21,.145]);
    hand.scale.setScalar(.001);hands.push(hand);
  }
  const workBadge=group('WorkBadge',root,[-.76,.65,.4]);
  mesh('BadgeBody',simple,blue,workBadge,[0,0,0],[.15,.15,.075]);
  for(let i=0;i<3;i++)mesh(`BadgeDot${i}`,simple,ink,workBadge,[(i-1)*.059,0,.075],[.017,.026,.009]);
  const hearts=[];for(let i=0;i<4;i++) {const h=mesh(`Heart${i}`,heartGeometry(.13+i*.018),pink,root,[0,0,0],[.001,.001,.001]);hearts.push(h);}
  const sweat=mesh('Sweat',simple,blue,root,[.94,.61,.58],[.001,.001,.001]);
  const warning=mesh('Warning',simple,coral,root,[-.88,.73,.36],[.001,.001,.001]);
  const refs={model,root,bodyRig,face,eyes,mouth,hands,workBadge,hearts,sweat,warning};
  const clips=Object.keys(REACTIONS).map(state=>makeClip(refs,state));
  applyPose(refs,'idle',0);return {model,clips,refs};
}
export function applyPose(r,state,t) {
  const d=REACTIONS[state].duration,loop=REACTIONS[state].loop,e=loop?1:envelope(t,d);
  const phase=TAU*t/d;
  r.root.position.set(0,.045*Math.sin(phase),0);r.root.rotation.set(0,0,0);r.root.scale.set(1,1,1);
  r.bodyRig.rotation.set(.035*Math.sin(phase),.035*Math.sin(phase),0);
  r.bodyRig.scale.set(1,1+.012*Math.sin(phase),1);r.face.position.set(0,0,0);r.face.rotation.set(0,0,0);
  r.eyes.forEach(x=>{x.morphTargetInfluences.fill(0);x.scale.set(1,1,1);});r.mouth.morphTargetInfluences[0]=0;r.mouth.scale.setScalar(.001);
  r.hands.forEach((h,i)=>{h.position.set((i?1:-1)*1.17,-.08,.03);h.rotation.set(0,0,0);h.scale.setScalar(.001);});
  r.workBadge.scale.setScalar(.001);r.hearts.forEach(h=>h.scale.setScalar(.001));r.sweat.scale.setScalar(.001);r.warning.scale.setScalar(.001);
  const eyes=(index,value=e)=>r.eyes.forEach(x=>x.morphTargetInfluences[index]=value);
  if(state==='idle'||state==='working') {
    const blink=1-.96*Math.exp(-Math.pow((t-d*.62)/.06,2));r.eyes.forEach(x=>x.scale.y=blink);
  }
  switch(state) {
    case 'greeting': {
      eyes(0);r.root.position.y+=.14*Math.sin(Math.PI*t/d)*e;r.bodyRig.rotation.z=.08*Math.sin(TAU*t)*e;
      r.hands.forEach((h,i)=>{h.scale.setScalar(Math.max(.001,e));h.position.y=.16+Math.sin(t*12+i)*.08*e;h.rotation.z=(i?1:-1)*(.25+Math.sin(t*14)*.65)*e;});break;
    }
    case 'working': {
      r.bodyRig.rotation.y=.16*Math.sin(phase);r.bodyRig.rotation.x=.06;
      r.workBadge.scale.setScalar(.96+.06*Math.sin(phase*2));r.workBadge.position.y=.65+.022*Math.sin(phase);break;
    }
    case 'slap': {
      const impact=Math.exp(-t*5)*Math.sin(t*24);eyes(1,e);r.root.position.x=.22*impact;
      r.bodyRig.rotation.z=.3*impact;r.bodyRig.scale.set(1+.2*impact,1-.22*impact,1);break;
    }
    case 'annoyed': eyes(1);r.bodyRig.rotation.y=.1*Math.sin(phase*2);r.bodyRig.rotation.z=-.065;break;
    case 'error': eyes(2);r.bodyRig.rotation.z=.035*Math.sin(phase*8);
      r.warning.scale.setScalar(.08+.025*Math.sin(phase*2));break;
    case 'happy': eyes(0);r.root.position.y+=.23*Math.abs(Math.sin(t*7))*e;r.bodyRig.scale.y=1-.06*Math.cos(t*14)*e;r.bodyRig.rotation.z=.1*Math.sin(t*7)*e;break;
    case 'love': eyes(3);r.bodyRig.rotation.z=.09*Math.sin(phase)*e;r.root.position.y+=.09*e;
      r.hearts.forEach((h,i)=>{const p=(t/d+i*.22)%1,fade=Math.sin(Math.PI*p)*e;h.position.set((i%2?1:-1)*(.75+.23*p),.15+1.55*p,.2+Math.sin(t+i)*.25);h.rotation.set(0,Math.sin(t+i)*.3,(i%2?1:-1)*.2);h.scale.setScalar(Math.max(.001,fade));});break;
    case 'wink': r.eyes[1].morphTargetInfluences[1]=e;r.bodyRig.rotation.z=-.15*e;r.root.position.y+=.055*e;break;
    case 'yawn': {
      const y=envelope(t,d,.95);eyes(4,y);r.mouth.morphTargetInfluences[0]=y;r.mouth.scale.setScalar(Math.max(.001,y));r.bodyRig.rotation.x=-.17*y;
      r.bodyRig.scale.set(1-.05*y,1+.1*y,1);r.eyes.forEach(x=>x.scale.y=1-.45*y);break;
    }
    case 'dance': eyes(0);r.root.position.x=.12*Math.sin(phase*4);r.root.position.y+=.16*(1-Math.cos(phase*8));
      r.bodyRig.rotation.set(.08*Math.sin(phase*4),.28*Math.sin(phase*4),.16*Math.sin(phase*4));r.bodyRig.scale.y=1-.035*Math.cos(phase*8);
      r.hands.forEach((h,i)=>{h.scale.setScalar(.9);h.position.y=.1+Math.sin(phase*4+i*Math.PI)*.32;h.rotation.z=(i?1:-1)*.4*Math.sin(phase*4);});break;
    case 'stressed': eyes(2,.25);r.root.position.x=.018*Math.sin(phase*15);r.bodyRig.rotation.z=.055*Math.sin(phase*3);r.eyes.forEach(x=>x.scale.y=.86);
      r.sweat.scale.set(.055,.1,.055);r.sweat.position.y=.67-.13*(1+Math.sin(phase))/2;break;
    case 'tired': eyes(4);r.bodyRig.rotation.set(.16+.07*Math.sin(phase),0,-.09);r.root.position.y=-.06+.025*Math.sin(phase);r.eyes.forEach(x=>x.scale.y=.78);break;
  }
  // Reset mouth orientation each frame so previewing one reaction cannot leak a pose.
  r.mouth.rotation.z=0;
  r.model.updateMatrixWorld(true);
}
function makeClip(r,state) {
  const duration=REACTIONS[state].duration,n=Math.round(duration*30),times=[];
  const nodes=[r.root,r.bodyRig,r.face,...r.eyes,r.mouth,...r.hands,r.workBadge,...r.hearts,r.sweat,r.warning];
  const data=nodes.map(node=>({node,p:[],q:[],s:[],m:[]}));
  for(let i=0;i<=n;i++) {
    const t=duration*i/n;times.push(t);applyPose(r,state,t);
    data.forEach(d=>{d.p.push(...d.node.position);d.q.push(...d.node.quaternion);d.s.push(...d.node.scale);if(d.node.morphTargetInfluences)d.m.push(...d.node.morphTargetInfluences);});
  }
  const tracks=[];
  for(const d of data) {
    tracks.push(new THREE.VectorKeyframeTrack(`${d.node.name}.position`,times,d.p),new THREE.QuaternionKeyframeTrack(`${d.node.name}.quaternion`,times,d.q),new THREE.VectorKeyframeTrack(`${d.node.name}.scale`,times,d.s));
    if(d.m.length)tracks.push(new THREE.NumberKeyframeTrack(`${d.node.name}.morphTargetInfluences`,times,d.m));
  }
  return new THREE.AnimationClip(state,duration,tracks);
}
