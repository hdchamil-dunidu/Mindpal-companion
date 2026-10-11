import {randomBytes,scrypt as scryptCB,timingSafeEqual,createHmac,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {DEFAULT_SETTINGS} from '../web/domain.js';
const scrypt=promisify(scryptCB);
export function fail(message,status=400){return Object.assign(Error(message),{status});}
export function secret(){const s=process.env.SESSION_SECRET;if(!s||s.length<32)throw fail('Server authentication is not configured. Set a private SESSION_SECRET of at least 32 characters.',503);return s;}
export function digest(text){return createHmac('sha256',secret()).update(text).digest('hex');}
export function emailOf(v){if(typeof v!=='string'||v.length>254||!/^\S+@\S+\.\S+$/.test(v.trim()))throw fail('Enter a valid email address.');return v.trim().toLowerCase();}
export async function hashPassword(password){if(typeof password!=='string'||password.length<10||password.length>128)throw fail('Use a password with 10–128 characters.');const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64);return salt+':'+key.toString('hex');}
export async function verifyPassword(password,stored){if(typeof password!=='string'||password.length>128)return false;const [salt,key]=stored.split(':');const hashed=await scrypt(password,salt,64);return timingSafeEqual(hashed,Buffer.from(key,'hex'));}
export async function register(d,input){
 const email=emailOf(input.email),name=String(input.name||'').trim();if(!name||name.length>60)throw fail('Enter a name of 1–60 characters.');
 const passwordHash=await hashPassword(input.password);const user={_id:createHash('sha256').update('mindpal-user:'+email).digest('hex'),email,name,passwordHash,settings:{...DEFAULT_SETTINGS},look:{head:'',face:'',body:''},createdAt:new Date().toISOString()};
 try{await d.collection('users').insertOne(user);}catch(e){if(e.code===11000)throw fail('This email is already registered. Sign in instead.',409);throw e;}
 return issueSession(d,user);
}
export async function login(d,input){const email=emailOf(input.email),user=await d.collection('users').findOne({_id:createHash('sha256').update('mindpal-user:'+email).digest('hex')});if(!user||!await verifyPassword(input.password,user.passwordHash))throw fail('Email or password is incorrect.',401);return issueSession(d,user);}
async function issueSession(d,user){const token=randomBytes(32).toString('base64url');await d.collection('auth_sessions').insertOne({_id:digest('session:'+token),ownerId:user._id,expiresAt:new Date(Date.now()+7*86400000)});return {token,profile:{name:user.name,email:user.email}};}
export async function authenticate(d,req){const h=req.headers.authorization||'';if(!h.startsWith('Bearer ')||h.length>300)throw fail('Please sign in to your cloud account.',401);const id=digest('session:'+h.slice(7)),session=await d.collection('auth_sessions').findOne({_id:id});if(!session||new Date(session.expiresAt).getTime()<Date.now())throw fail('Your session has expired. Please sign in again.',401);return {ownerId:session.ownerId,sessionId:id};}
