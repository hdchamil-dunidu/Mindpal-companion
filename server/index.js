import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {db,closeDB} from './db.js';
import {register,login,authenticate,fail} from './auth.js';
import {chat,clean} from './chat.js';
import {COLLECTIONS,validateRecord,validateLook,validateSettings} from '../web/domain.js';
const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../web');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.glb':'model/gltf-binary','.json':'application/json','.woff2':'font/woff2','.ttf':'font/ttf'};
const rates=new Map();
function rate(req,kind,max){const key=(req.socket.remoteAddress||'unknown')+':'+kind;const now=Date.now();const v=rates.get(key)||{count:0,reset:now+60000};if(now>=v.reset){v.count=0;v.reset=now+60000;}if(++v.count>max)throw fail('Too many requests. Please wait a minute and try again.',429);rates.set(key,v);if(rates.size>10000)for(const [k,r]of rates)if(r.reset<now)rates.delete(k);}
async function body(req){let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>65536)throw fail('Request is too large.',413);}try{return JSON.parse(text||'{}');}catch{throw fail('Invalid JSON request.');}}
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
export async function loadData(d,ownerId){const user=await d.collection('users').findOne({_id:ownerId});if(!user)throw fail('Account not found.',401);const data={profile:{name:user.name,email:user.email},settings:user.settings,look:user.look};for(const k of COLLECTIONS)data[k]=(await d.collection(k).find({ownerId}).toArray()).map(clean).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));return data;}
export async function saveRecord(d,ownerId,kind,id,input){
 if(!COLLECTIONS.includes(kind)||kind==='chats')throw fail('Unknown record type.',404);if(!/^[-\w]{8,80}$/.test(id))throw fail('Invalid record identifier.');
 const _id=ownerId+':'+id;const old=await d.collection(kind).findOne({_id,ownerId});let validated;try{validated=validateRecord(kind,input);}catch(e){throw fail(e.message);}
 if(kind==='tasks')validated.completedAt=validated.completed?(old?.completedAt||new Date().toISOString()):null;
 const record={...validated,_id,id,ownerId,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
 await d.collection(kind).replaceOne({_id,ownerId},record,{upsert:true});return clean(record);
}
export function createServer(){return http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https: http://localhost:3000; media-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'");
 if(process.env.NODE_ENV==='production')res.setHeader('Strict-Transport-Security','max-age=31536000');
 try{
  const origin=req.headers.origin;const allowed=(process.env.ALLOWED_ORIGINS||'https://appassets.androidplatform.net,http://localhost:3000,http://127.0.0.1:3000').split(',').map(s=>s.trim());
  if(origin){if(!allowed.includes(origin))throw fail('This app origin is not allowed by the server.',403);res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE, OPTIONS');}
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/health')return json(res,200,{status:'ok',databaseConfigured:!!process.env.MONGODB_URI,geminiConfigured:!!process.env.GEMINI_API_KEY,authConfigured:(process.env.SESSION_SECRET?.length||0)>=32});
  if(url.pathname.startsWith('/api/')){
   rate(req,'api',180);const d=await db();
   if(['/api/auth/register','/api/auth/login'].includes(url.pathname)&&req.method==='POST'){rate(req,'auth',10);const input=await body(req);return json(res,200,await(url.pathname.endsWith('register')?register(d,input):login(d,input)));}
   const {ownerId,sessionId}=await authenticate(d,req);
   if(url.pathname==='/api/auth/logout'&&req.method==='POST'){await d.collection('auth_sessions').deleteOne({_id:sessionId,ownerId});return json(res,200,{ok:true});}
   if(url.pathname==='/api/data'&&req.method==='GET')return json(res,200,await loadData(d,ownerId));
   if(url.pathname==='/api/preferences'&&req.method==='PATCH'){
    const input=await body(req),update={};if(input.profile){const name=String(input.profile.name||'').trim();if(!name||name.length>60)throw fail('Enter a name of 1–60 characters.');update.name=name;}
    try{if(input.settings)update.settings=validateSettings(input.settings);if(input.look)update.look=validateLook(input.look);}catch(e){throw fail(e.message);}
    if(Object.keys(update).length)await d.collection('users').updateOne({_id:ownerId},{$set:update});return json(res,200,await loadData(d,ownerId));
   }
   if(url.pathname==='/api/chat'&&req.method==='POST'){rate(req,'chat',12);return json(res,200,await chat(d,ownerId,await body(req)));}
   const parts=url.pathname.split('/');if(parts[2]==='records'&&parts.length===5){const kind=parts[3],id=parts[4];if(!COLLECTIONS.includes(kind)||kind==='chats')throw fail('Unknown record type.',404);
    if(req.method==='PUT')return json(res,200,await saveRecord(d,ownerId,kind,id,await body(req)));
    if(req.method==='DELETE'){await d.collection(kind).deleteOne({_id:ownerId+':'+id,ownerId});return json(res,200,{ok:true});}
   }
   throw fail('API endpoint not found.',404);
  }
  if(req.method!=='GET'&&req.method!=='HEAD')throw fail('Method not allowed.',405);
  const filename=path.resolve(web,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!filename.startsWith(web+path.sep))throw fail('Not found.',404);
  if(!(await stat(filename)).isFile())throw fail('Not found.',404);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:await readFile(filename));
 }catch(error){const known=error.status||error.code==='ENOENT';const status=error.status||(error.code==='ENOENT'?404:500);if(!known)console.error('Request failed:',error.name,error.code||'');json(res,status,{error:known?error.message:status===500?'The server could not complete this request. Check server configuration and try again.':'Request failed.'});}
});}
if(process.argv[1]===fileURLToPath(import.meta.url)){const server=createServer();server.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>console.log('MindPal running on port '+(process.env.PORT||3000)+'. Cloud services require .env configuration.'));for(const event of ['SIGINT','SIGTERM'])process.on(event,()=>server.close(async()=>{await closeDB();process.exit(0);}));}
