import {setupDB,closeDB} from './db.js';
try{await setupDB();console.log('Database ping and indexes verified.');}catch(e){console.error(e.message);process.exitCode=1;}finally{await closeDB();}
