import {randomBytes,createHash} from 'node:crypto';
import {fail,secret,digest,issueSession,emailOf} from './auth.js';
import {DEFAULT_SETTINGS} from '../web/domain.js';
const random=()=>randomBytes(32).toString('base64url');
export function googleConfigured(){return !!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REDIRECT_URI);}
export async function beginGoogle(d,input,ownerId=null){
 secret();if(!googleConfigured())throw fail('Google sign-in needs GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI in the backend .env. Follow the Google setup section in the update guide.',503);
 if(typeof input.challenge!=='string'||!/^[-\w]{43}$/.test(input.challenge))throw fail('Invalid sign-in challenge.');
 const state=random(),poll=random(),verifier=random();
 await d.collection('oauth_requests').insertOne({_id:digest('oauth:'+state),poll:digest('poll:'+poll),challenge:input.challenge,verifier,ownerId,expiresAt:new Date(Date.now()+5*60000),status:'pending'});
 const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');url.search=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:process.env.GOOGLE_REDIRECT_URI,response_type:'code',scope:'openid email profile',state,prompt:'select_account',code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256'}).toString();
 return {url:url.href,poll,expiresIn:300};
}
export async function finishGoogle(d,params,fetcher=fetch){
 const state=params.get('state');if(!state||state.length>100)throw fail('Invalid Google sign-in state.');
 // Consume state once before code exchange; pending polls remain separate.
 const request=await d.collection('oauth_requests').findOneAndUpdate({_id:digest('oauth:'+state),status:'pending',expiresAt:{$gt:new Date()}},{$set:{status:'exchanging'}},{returnDocument:'before'});
 if(!request)throw fail('This sign-in expired or was already used. Return to MindPal and try again.');
 try{
  if(params.get('error'))throw fail('Google sign-in was cancelled.');const code=params.get('code');if(!code||code.length>3000)throw fail('Missing Google authorization code.');
  const response=await fetcher('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:AbortSignal.timeout(15000),body:new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:process.env.GOOGLE_REDIRECT_URI,grant_type:'authorization_code',code,code_verifier:request.verifier})});
  if(!response.ok)throw fail('Google could not complete sign-in. Check the OAuth client and exact redirect URI in your server settings.',502);const token=await response.json();
  const r=await fetcher('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(15000)});if(!r.ok)throw fail('Google could not verify this account.',502);const profile=await r.json();
  if(profile.email_verified!==true||typeof profile.sub!=='string')throw fail('Use a Google account with a verified email address.');const email=emailOf(profile.email);
  let user=await d.collection('users').findOne({googleSub:profile.sub});
  if(request.ownerId){const current=await d.collection('users').findOne({_id:request.ownerId});if(!current||current.email!==email||(user&&user._id!==current._id))throw fail('Sign in with the Google account matching your MindPal email to link it.');await d.collection('users').updateOne({_id:current._id},{$set:{googleSub:profile.sub}});user=current;}
  else if(!user){const id=createHash('sha256').update('mindpal-user:'+email).digest('hex');if(await d.collection('users').findOne({_id:id}))throw fail('This email already has a MindPal account. Sign in with your password, then choose Link Google in Settings.');user={_id:id,email,name:String(profile.name||email.split('@')[0]).slice(0,60),googleSub:profile.sub,settings:{...DEFAULT_SETTINGS},look:{head:'',face:'',body:''},createdAt:new Date().toISOString()};await d.collection('users').insertOne(user);}
  await d.collection('oauth_requests').updateOne({_id:request._id},{$set:{status:'done',userId:user._id}});return 'Google sign-in complete. Return to the MindPal app or its original browser tab to continue.';
 }catch(e){const message=e.status?e.message:'Google sign-in could not complete. Please try again.';await d.collection('oauth_requests').updateOne({_id:request._id},{$set:{status:'failed',message}});throw fail(message,e.status||502);}
}
export async function pollGoogle(d,input){
 if(!/^[-\w]{43}$/.test(input.poll||'')||!/^[-\w]{43}$/.test(input.verifier||''))throw fail('Invalid sign-in request.');
 const query={poll:digest('poll:'+input.poll),challenge:createHash('sha256').update(input.verifier).digest('base64url'),expiresAt:{$gt:new Date()}};
 const r=await d.collection('oauth_requests').findOne(query);if(!r)throw fail('Google sign-in expired. Please try again.',410);if(r.status==='failed')throw fail(r.message);if(r.status!=='done')return {pending:true};
 const consumed=await d.collection('oauth_requests').findOneAndDelete({...query,status:'done'});if(!consumed)throw fail('Sign-in already completed. Please start again.',409);
 const user=await d.collection('users').findOne({_id:r.userId});if(!user)throw fail('Account not found.',401);return issueSession(d,user);
}
