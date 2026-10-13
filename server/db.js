import {COLLECTIONS} from '../web/domain.js';
import {MongoClient} from 'mongodb';
let client,promise;
export async function db(){
 if(!process.env.MONGODB_URI)throw Object.assign(Error('Cloud storage is not configured. Add MONGODB_URI on the server.'),{status:503});
 if(!promise){client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:8000,maxPoolSize:10});promise=client.connect().then(()=>client.db(process.env.MONGODB_DB||'mindpal')).catch(()=>{promise=null;throw Object.assign(Error('Cannot connect to the database. Check the server configuration and MongoDB database username/password, connection string, cluster status, and IP access list. Run npm run check:services.'),{status:503});});}
 return promise;
}
export async function closeDB(){if(client)await client.close();promise=null;}
export async function setupDB(){const d=await db();for(const name of COLLECTIONS){await d.collection(name).createIndex({ownerId:1});}await d.collection('auth_sessions').createIndex({expiresAt:1},{expireAfterSeconds:0});await d.collection('oauth_requests').createIndex({expiresAt:1},{expireAfterSeconds:0});await d.collection('users').createIndex({googleSub:1},{unique:true,sparse:true});return d.command({ping:1});}
