// Writes only a public HTTPS origin into the Android web assets.
import {writeFile} from 'node:fs/promises';
const value=process.env.MINDPAL_PUBLIC_SERVER_URL||'';
if(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('MINDPAL_PUBLIC_SERVER_URL must be an HTTPS origin without credentials, path, or query.');}
await writeFile(new URL('../web/config.js',import.meta.url),'// Public backend origin only. Never add secrets here.\nexport const defaultServer = '+JSON.stringify(value?new URL(value).origin:'')+';\n');
console.log(value?'Android backend address configured. Rebuild the APK to apply it.':'No public address configured. Android will offer one-time connection setup.');
