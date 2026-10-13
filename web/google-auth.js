import {ApiStore,suggestedServer,serverURL} from './store.js';
const base64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
export function installGoogle({s,toast,connected}){
 let timer,busy=false;
 async function poll(){const raw=sessionStorage.getItem('mindpal.google');if(!raw)return;const pending=JSON.parse(raw);if(Date.now()>pending.until){sessionStorage.removeItem('mindpal.google');toast('Google sign-in timed out. Try again.',true);return;}
  try{const api=new ApiStore(pending.base,'');const result=await api.request('/auth/google/poll','POST',{poll:pending.poll,verifier:pending.verifier});if(result.pending){timer=setTimeout(poll,3000);return;}sessionStorage.removeItem('mindpal.google');await connected(api,result);toast('Google account connected.');}catch(e){sessionStorage.removeItem('mindpal.google');toast(e.message,true);}
 }
 document.addEventListener('click',async e=>{const button=e.target.closest('[data-google]');if(!button||busy)return;e.stopImmediatePropagation();busy=true;button.disabled=true;let popup;try{
  const base=serverURL(suggestedServer());if(!window.MindPalNative?.openGoogle)popup=window.open('about:blank','MindPalGoogle','width=500,height=700');
  const verifier=base64(crypto.getRandomValues(new Uint8Array(32))),challenge=base64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
  const api=button.dataset.google==='link'?s.store:new ApiStore(base,'');const result=await api.request('/auth/google/'+(button.dataset.google==='link'?'link':'start'),'POST',{challenge});
  const url=new URL(result.url);if(url.protocol!=='https:'||url.hostname!=='accounts.google.com')throw Error('The server returned an invalid Google sign-in URL.');
  sessionStorage.setItem('mindpal.google',JSON.stringify({base,poll:result.poll,verifier,until:Date.now()+result.expiresIn*1000}));
  if(window.MindPalNative?.openGoogle)window.MindPalNative.openGoogle(url.href);else if(popup){popup.opener=null;popup.location.href=url.href;}else{sessionStorage.removeItem('mindpal.google');throw Error('Allow pop-ups for MindPal, then try Google sign-in again.');}
  toast('Complete Google sign-in in the browser, then return to MindPal.');clearTimeout(timer);timer=setTimeout(poll,2000);
 }catch(error){popup?.close();toast(error.message==='Invalid URL'?'Set your MindPal server address in Connection settings first.':error.message,true);}finally{busy=false;if(button.isConnected)button.disabled=false;}},true);
 if(sessionStorage.getItem('mindpal.google'))timer=setTimeout(poll,1500);
}
