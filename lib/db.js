import { MongoClient } from 'mongodb';
const globalCache = globalThis;
export function clientPromise() {
    if(!process.env.MONGODB_URI) throw new Error('MongoDB is not configured. Run npm run setup and set MONGODB_URI in .env.local.');
    if(!globalCache.mindpalMongo) {
        globalCache.mindpalMongo = new MongoClient(process.env.MONGODB_URI, {serverSelectionTimeoutMS:5000}).connect().catch(e=>{globalCache.mindpalMongo=null;throw e;});
    }
    return globalCache.mindpalMongo;
}
export async function db(){return (await clientPromise()).db(process.env.MONGODB_DB || 'mindpal');}
export async function ensureIndexes(){
    const d=await db();
    await Promise.all([
        d.collection('users').createIndex({email:1},{unique:true}),
        d.collection('users').createIndex({username:1},{unique:true,partialFilterExpression:{username:{$type:'string'}}}),
        d.collection('accounts').createIndex({provider:1,providerAccountId:1},{unique:true}),
        ...['tasks','events','moods','focus','breathing','transactions','messages'].map(c=>d.collection(c).createIndex({userId:1,createdAt:-1})),
        ...['focus','breathing'].map(c=>d.collection(c).createIndex({userId:1},{unique:true,partialFilterExpression:{status:{$in:['running','paused']}}})),
        d.collection('budgets').createIndex({userId:1,month:1},{unique:true}),
        d.collection('limits').createIndex({expiresAt:1},{expireAfterSeconds:0})
    ]);
}
