import { getServerSession } from 'next-auth';
import {authOptions} from './auth.js';
import {ObjectId} from 'mongodb';
export class HttpError extends Error{constructor(message,status=400){super(message);this.status=status;}}
export async function identity(){const session=await getServerSession(authOptions);if(!session?.user?.id)throw new HttpError('Please sign in.',401);return session.user.id;}
export async function body(req){if(Number(req.headers.get('content-length'))>32000)throw new HttpError('Request is too large.',413);const raw=await req.text();if(raw.length>32000)throw new HttpError('Request is too large.',413);try{return JSON.parse(raw);}catch{throw new HttpError('Invalid JSON.');}}
export function origin(req){const actual=req.headers.get('origin');const expected=new URL(process.env.NEXTAUTH_URL||req.url).origin;if(!actual||actual!==expected)throw new HttpError('Request origin is not allowed.',403);}
export function objectId(id){if(!/^[a-f\d]{24}$/i.test(id))throw new HttpError('Invalid record ID.');return new ObjectId(id);}
export const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export function handle(fn){return async(req,ctx)=>{try{return await fn(req,ctx);}catch(e){if(e.name==='ZodError')return json({error:e.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},400);if(e.code===11000)return json({error:'This email, username, or record already exists.'},409);if(e.status)return json({error:e.message},e.status);console.error(e.name,e.message);return json({error:'The service could not complete this request. Check the database connection and server configuration.'},503);}};}
