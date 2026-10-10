import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const [urlText,fingerprint]=process.argv.slice(2);
try{
 const url=new URL(urlText);
 if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash||url.username||url.password||url.port||!/^[a-z0-9.-]+$/i.test(url.hostname))throw new Error('Use a bare HTTPS origin, such as https://mindpal.yourdomain.com');
 if(!/^([0-9A-Fa-f]{2}:){31}[0-9A-Fa-f]{2}$/.test(fingerprint||''))throw new Error('Supply the Android signing certificate SHA-256 fingerprint (32 colon-separated byte pairs).');
 const statements=JSON.stringify([{relation:['delegate_permission/common.handle_all_urls'],target:{namespace:'web',site:url.origin}}]).replaceAll('"','\\"');writeFileSync('android/app/src/main/res/values/strings.xml','<resources><string name="asset_statements" translatable="false">'+statements+'</string></resources>\n');
 const path='android/app/build.gradle';let text=readFileSync(path,'utf8').replace(/def mindpalUrl = '[^']*'/,`def mindpalUrl = '${url.origin}'`).replace(/def mindpalHost = '[^']*'/,`def mindpalHost = '${url.hostname}'`);writeFileSync(path,text);
 mkdirSync('public/.well-known',{recursive:true});writeFileSync('public/.well-known/assetlinks.json',JSON.stringify([{relation:['delegate_permission/common.handle_all_urls'],target:{namespace:'android_app',package_name:'com.mindpal.companion',sha256_cert_fingerprints:[fingerprint.toUpperCase()]}}],null,2));console.log('Android domain and Digital Asset Links configured. Redeploy the web app before testing the signed Android app.');
}catch(e){console.error(e.message);process.exitCode=1;}
