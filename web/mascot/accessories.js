import * as T from './vendor/three.module.js';
export function attachAccessories(viewer,equipped={}){
 if(!viewer.model)return;
 const rig=viewer.model.getObjectByName('BodyRig');
 if(viewer.accessoryGroup){rig.remove(viewer.accessoryGroup);viewer.accessoryGroup.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
 const g=new T.Group();g.name='OptionalAccessories';rig.add(g);viewer.accessoryGroup=g;
 const mat=color=>new T.MeshStandardMaterial({color,roughness:.5,metalness:.15});
 const add=(geo,color,pos,rot=[0,0,0],scale=[1,1,1])=>{const m=new T.Mesh(geo,mat(color));m.position.set(...pos);m.rotation.set(...rot);m.scale.set(...scale);g.add(m);return m;};
 const violet=0x8b6fe8,ink=0x30283d,pearl=0xd9d4e5;
 if(equipped.head==='cap'){add(new T.SphereGeometry(.71,32,16,0,Math.PI*2,0,Math.PI/2),violet,[0,.77,0],[0,0,0],[1,.65,1]);add(new T.CylinderGeometry(.65,.65,.06,40),ink,[0,.8,.55],[0,0,0],[1,1,.65]);}
 if(equipped.head==='party'){add(new T.ConeGeometry(.42,.9,40),violet,[0,1.28,0]);add(new T.SphereGeometry(.08,16,12),pearl,[0,1.75,0]);}
 if(equipped.head==='crown'){add(new T.CylinderGeometry(.46,.43,.19,40,1,true),0xc9b47c,[0,1.02,0]);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;add(new T.ConeGeometry(.09,.22,4),0xc9b47c,[Math.cos(a)*.44,1.2,Math.sin(a)*.44]);}}
 if(equipped.head==='headphones'){add(new T.TorusGeometry(1.035,.06,12,64,Math.PI),ink,[0,0,0]);for(const s of [-1,1])add(new T.SphereGeometry(.24,24,16),violet,[s*1.04,0,0],[0,0,0],[.45,1,1]);}
 if(equipped.face){for(const s of [-1,1]){add(new T.TorusGeometry(.2,.018,12,40),ink,[s*.24,.035,1.018]);if(equipped.face==='sunglasses'){const lens=add(new T.CircleGeometry(.18,32),ink,[s*.24,.035,1.021]);lens.material.transparent=true;lens.material.opacity=.25;lens.material.depthWrite=false;}}
 add(new T.CylinderGeometry(.015,.015,.09,8),ink,[0,.055,1.024],[0,0,Math.PI/2]);}
 if(equipped.body==='bow'){for(const s of [-1,1])add(new T.ConeGeometry(.15,.22,3),violet,[s*.14,-.66,.79],[0,0,s*Math.PI/2]);add(new T.SphereGeometry(.07,16,12),ink,[0,-.66,.83]);}
}
