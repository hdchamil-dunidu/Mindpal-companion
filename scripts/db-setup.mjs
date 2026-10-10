import {ensureIndexes,clientPromise} from '../lib/db.js';
try{await ensureIndexes();console.log('MongoDB connected. MindPal indexes are ready. No sample users or activity were inserted.');await(await clientPromise()).close();}catch(e){console.error('Database setup failed:',e.message);process.exitCode=1;}
