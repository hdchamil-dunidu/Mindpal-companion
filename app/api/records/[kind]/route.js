import {db} from '@/lib/db';import {schemas} from '@/lib/domain';import {identity,origin,body,handle,json,objectId,HttpError} from '@/lib/http';
async function run(req,ctx){origin(req);const userId=await identity(),{kind}=await ctx.params;if(!schemas[kind])throw new HttpError('Unknown collection.',404);const data=await body(req),d=await db(),col=d.collection(kind);
 if(req.method==='DELETE'){const r=await col.deleteOne({_id:objectId(data.id),userId});if(!r.deletedCount)throw new HttpError('Record not found.',404);return json({ok:true});}
 const parsed=schemas[kind].parse(data);
 if(kind==='tasks')parsed.completedAt=parsed.completed?new Date():null;
 if(req.method==='PATCH'){const filter={_id:objectId(data.id),userId};const old=await col.findOne(filter);if(!old)throw new HttpError('Record not found.',404);if(kind==='tasks'&&old.completed&&parsed.completed)parsed.completedAt=old.completedAt;await col.updateOne(filter,{$set:{...parsed,updatedAt:new Date()}});return json({ok:true});}
 if(kind==='budgets'){await col.updateOne({userId,month:parsed.month},{$set:{...parsed,updatedAt:new Date()},$setOnInsert:{createdAt:new Date()}},{upsert:true});return json({ok:true});}
 const result=await col.insertOne({...parsed,userId,createdAt:new Date()});return json({id:result.insertedId},201);
}
export const POST=handle(run),PATCH=handle(run),DELETE=handle(run);
