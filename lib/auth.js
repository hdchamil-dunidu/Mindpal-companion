import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { compare } from 'bcryptjs';
import { createHash } from 'node:crypto';
import { db,clientPromise } from './db.js';
export async function limit(key,max=20){
 const d=await db();const bucket=Math.floor(Date.now()/600000);const _id=createHash('sha256').update(key+bucket).digest('hex');
 const doc=await d.collection('limits').findOneAndUpdate({_id},{$inc:{count:1},$setOnInsert:{expiresAt:new Date((bucket+2)*600000)}},{upsert:true,returnDocument:'after'});
 if(doc.count>max)throw new Error('Too many attempts. Please try again in ten minutes.');
}
// Lazy adapter avoids connecting during compilation or when OAuth is disabled.
const adapter=new Proxy({}, {get(_t,key){return async(...args)=>{const a=MongoDBAdapter(clientPromise(),{databaseName:process.env.MONGODB_DB||'mindpal'});return a[key](...args);};}});
export const authOptions={
 secret:process.env.NEXTAUTH_SECRET,adapter,session:{strategy:'jwt',maxAge:60*60*24*14},pages:{signIn:'/login',error:'/login'},
 providers:[
  (Credentials.default || Credentials)({name:'Email and password',credentials:{email:{type:'email'},password:{type:'password'}},async authorize(c){
   if(!c?.email||!c?.password||c.password.length>128)return null;
   const email=c.email.trim().toLowerCase();await limit('login:'+email,15);
   const user=await (await db()).collection('users').findOne({email});
   if(!user?.passwordHash||!await compare(c.password,user.passwordHash))return null;
   return {id:user._id.toString(),name:user.name,email:user.email};
  }}),
  ...(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET?[(Google.default || Google)({clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET})]:[]),
  ...(process.env.APPLE_CLIENT_ID&&process.env.APPLE_CLIENT_SECRET?[(Apple.default || Apple)({clientId:process.env.APPLE_CLIENT_ID,clientSecret:process.env.APPLE_CLIENT_SECRET})]:[])
 ],callbacks:{async jwt({token,user}){if(user)token.uid=user.id;return token;},async session({session,token}){if(session.user)session.user.id=token.uid;return session;}}
};
