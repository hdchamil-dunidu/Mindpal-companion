import {COLLECTIONS,DEFAULT_SETTINGS,validateRecord,validateSettings,validateLook} from './domain.js';
const KEY='mindpal.local.v1';
export function emptyData(){return {profile:{name:''},settings:{...DEFAULT_SETTINGS},look:{head:'',face:'',body:''},...Object.fromEntries(COLLECTIONS.map(k=>[k,[]]))};}
export class LocalStore {
 constructor(){this.mode='local';const raw=localStorage.getItem(KEY);this.data=raw?JSON.parse(raw):emptyData();if(!this.data.profile||COLLECTIONS.some(k=>!Array.isArray(this.data[k])))throw Error('Local data could not be read. Export or restore a backup before resetting it.');}
 async load(){return structuredClone(this.data);}
 commit(next){localStorage.setItem(KEY,JSON.stringify(next));this.data=next;}
 async put(kind,input,id=crypto.randomUUID()){
  if(!COLLECTIONS.includes(kind)||kind==='chats')throw Error('Unknown collection.');const next=structuredClone(this.data),old=next[kind].find(r=>r.id===id);
  const record={...validateRecord(kind,input),id,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
  next[kind]=[record,...next[kind].filter(r=>r.id!==id)];this.commit(next);return record;
 }
 async remove(kind,id){if(!COLLECTIONS.includes(kind))throw Error('Unknown collection.');const next=structuredClone(this.data);next[kind]=next[kind].filter(r=>r.id!==id);this.commit(next);}
 async preferences(values){const next=structuredClone(this.data);if(values.profile){const name=String(values.profile.name||'').trim();if(!name||name.length>60)throw Error('Enter a name of 1–60 characters.');next.profile={name};}if(values.settings)next.settings=validateSettings(values.settings);if(values.look)next.look=validateLook(values.look);this.commit(next);return next;}
 async chat(){throw Error('Gemini chat needs a connected server. Set up your HTTPS server in Settings → Connection. Your other features work on this device.');}
}
export class ApiStore {
 constructor(base,token){this.mode='cloud';this.base=base;this.token=token;}
 async request(path,method='GET',body){
  let res;try{res=await fetch(this.base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(this.token?{'Authorization':'Bearer '+this.token}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(60000)});}catch{throw Error('Cannot reach your server. Check your connection and try again.');}
  const result=await res.json().catch(()=>({error:'The server returned an unreadable response.'}));if(!res.ok)throw Error(result.error||'The request failed.');return result;
 }
 load(){return this.request('/data');}
 put(kind,input,id=crypto.randomUUID()){return this.request('/records/'+kind+'/'+encodeURIComponent(id),'PUT',input);}
 remove(kind,id){return this.request('/records/'+kind+'/'+encodeURIComponent(id),'DELETE');}
 preferences(values){return this.request('/preferences','PATCH',values);}
 chat(text,requestId){return this.request('/chat','POST',{text,requestId});}
}
export function serverURL(value){const url=new URL(value);if(url.username||url.password||url.search||url.hash)throw Error('Use only your server URL, without passwords or query parameters.');if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error('Use an HTTPS server URL.');if(url.pathname!=='/'&&url.pathname!=='')throw Error('Enter the server origin without a path.');return url.origin;}
export function makeStore(){const token=sessionStorage.getItem('mindpal.token'),base=localStorage.getItem('mindpal.server');return token&&base?new ApiStore(base,token):new LocalStore();}
