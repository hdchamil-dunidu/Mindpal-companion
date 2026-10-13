import {listModels} from '../server/gemini.js';
try{console.log((await listModels()).join('\n'));}catch(e){console.error(e.message);process.exitCode=1;}
