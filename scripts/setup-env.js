import {readFile,writeFile,access} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import readline from 'node:readline';
import {Writable} from 'node:stream';
// Values never leave this computer. Secret input is masked on an interactive terminal.
let muted=false;const output=new Writable({write(chunk,enc,callback){if(!muted)process.stdout.write(chunk);callback();}});
const rl=readline.createInterface({input:process.stdin,output,terminal:!!process.stdin.isTTY});
function ask(label,privateValue=false){return new Promise(resolve=>{muted=false;rl.question(label+' ',answer=>{muted=false;if(privateValue)process.stdout.write('\n');resolve(answer.trim());});muted=privateValue;});}
let existing='';try{existing=await readFile('.env','utf8');}catch{}
const entries=new Map();for(const line of existing.split(/\r?\n/)){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m)entries.set(m[1],m[2]);}
console.log('MindPal backend setup. Press Enter to keep an existing value. Private values are not displayed.');
for(const [key,label,hidden] of [['MONGODB_URI','Paste your MongoDB connection string (hidden):',true],['MONGODB_DB','Database name [mindpal]:',false],['GEMINI_API_KEY','Paste Gemini API key (hidden):',true],['GEMINI_MODEL','Gemini model ID [auto]:',false],['MINDPAL_PUBLIC_SERVER_URL','Public HTTPS address, if available (otherwise Enter):',false]]){const value=await ask(label,hidden);if(value)entries.set(key,JSON.stringify(value));}
if((await ask('Configure Google sign-in now? [y/N]')).toLowerCase()==='y')for(const [key,hidden] of [['GOOGLE_CLIENT_ID',false],['GOOGLE_CLIENT_SECRET',true],['GOOGLE_REDIRECT_URI',false]]){const value=await ask(key+':',hidden);if(value)entries.set(key,JSON.stringify(value));}
rl.close();muted=false;
for(const [k,v]of Object.entries({PORT:'3000',HOST:'0.0.0.0',MONGODB_DB:'mindpal',GEMINI_MODEL:'auto',ALLOWED_ORIGINS:'https://appassets.androidplatform.net,http://localhost:3000,http://127.0.0.1:3000'}))if(!entries.get(k))entries.set(k,v);
if(!entries.get('SESSION_SECRET'))entries.set('SESSION_SECRET',randomBytes(48).toString('hex'));
if(existing)await writeFile('.env.backup',existing,{mode:0o600});
await writeFile('.env','# Private backend settings. Never upload this file.\n'+[...entries].map(([k,v])=>k+'='+v).join('\n')+'\n',{mode:0o600});
console.log('Saved .env. Now run: npm run check:services, npm run db:setup, then npm start.');
