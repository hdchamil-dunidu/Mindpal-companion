import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const roots=['web','server','tests','scripts'];let total=0;
async function walk(dir){for(const f of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory()){if(f.name!=='vendor')await walk(p);}else if(f.name.endsWith('.js')){const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});if(r.status)throw Error(r.stderr);total++;}}}
for(const root of roots)await walk(root);
const html=await readFile('web/index.html','utf8');if(!html.includes('type="module"'))throw Error('Missing app module');console.log(`${total} JavaScript files passed syntax checks.`);
