import {db,closeDB} from '../server/db.js';
import {checkGemini,resolveModel} from '../server/gemini.js';
import {googleConfigured} from '../server/google.js';
console.log('MindPal checks actual connections. Gemini test sends one small request and may use API quota.');
console.log('Session secret:',(process.env.SESSION_SECRET?.length||0)>=32?'PASS':'FAIL — run npm run setup');
try{await(await db()).command({ping:1});console.log('MongoDB connection: PASS');}catch(e){console.error('MongoDB: FAIL — '+e.message);process.exitCode=1;}finally{await closeDB();}
try{const r=await checkGemini();console.log('Gemini generation: PASS — '+r.model);}catch(e){console.error('Gemini: FAIL — '+e.message);process.exitCode=1;}
console.log('Google sign-in:',googleConfigured()?'Settings present; complete a browser sign-in to verify.':'Not configured (optional). See the setup guide.');
