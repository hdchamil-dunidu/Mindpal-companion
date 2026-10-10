import { z } from 'zod';
export const moods=['Sad','Tired','Okay','Happy','Excited','Stressed','Anxious','Lonely'];
export const reactions={Sad:'tired',Tired:'tired',Okay:'idle',Happy:'happy',Excited:'dance',Stressed:'stressed',Anxious:'stressed',Lonely:'love'};
export const dateKey=(d=new Date(),zone='Asia/Colombo')=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
export const dateString=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s,'Enter a valid date');
const text=z.string().trim().max(1000).default('');
const time=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).or(z.literal('')).default('');
export const schemas={
  tasks:z.object({title:z.string().trim().min(1).max(160),description:text,category:z.enum(['Study','Exercise','Personal','Other']).default('Study'),priority:z.enum(['Low','Medium','High']).default('Medium'),dueDate:dateString,startTime:time,endTime:time,reminder:z.boolean().default(false),completed:z.boolean().default(false)}).refine(x=>!x.startTime||!x.endTime||x.startTime<x.endTime,'End time must be after start time'),
  events:z.object({title:z.string().trim().min(1).max(160),date:dateString,type:z.enum(['Birthday','Exam','Assignment','Meeting','Holiday','Other']).default('Other'),time:time,notes:text,reminder:z.boolean().default(false)}),
  moods:z.object({mood:z.enum(moods),note:text}),
  transactions:z.object({type:z.enum(['income','expense']),amountMinor:z.number().int().positive().max(100000000000),category:z.enum(['Food','Transport','Shopping','Entertainment','Health','Education','Salary','Other']),description:text,date:dateString}),
  budgets:z.object({month:z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),limitMinor:z.number().int().positive().max(100000000000)}),
};
export const accessories={cap:{slot:'head',name:'Cap'},headphones:{slot:'head',name:'Headphones'},party:{slot:'head',name:'Party hat'},crown:{slot:'head',name:'Crown'},sunglasses:{slot:'face',name:'Sunglasses'},glasses:{slot:'face',name:'Reading glasses'},bow:{slot:'body',name:'Bow tie'}};
export function unlocks(data,zone='Asia/Colombo'){
  const tasks=data.tasks.filter(t=>t.completed).length;
  const focus=data.focus.filter(s=>s.completed&&s.mode==='focus').length;
  const days=new Set(data.moods.map(m=>dateKey(m.createdAt,zone))).size;
  return {cap:true,headphones:true,sunglasses:true,glasses:true,party:tasks>=5,crown:focus>=10,bow:days>=7,counts:{tasks,focus,days}};
}
export function minorUnits(v){if(!/^\d+(\.\d{1,2})?$/.test(String(v)))throw new Error('Use a positive amount with at most two decimal places.');const [a,b='']=String(v).split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(n)||n<=0)throw new Error('Enter a positive amount.');return n;}
export function sessionElapsed(s,now=Date.now()){return (s.elapsedMs||0)+(s.status==='running'?Math.max(0,now-new Date(s.resumedAt).getTime()):0);}
export const money=n=>new Intl.NumberFormat('en-LK',{style:'currency',currency:'LKR'}).format((n||0)/100);
export function weekKeys(end=new Date(),zone='Asia/Colombo',days=7){const last=dateKey(end,zone);return Array.from({length:days},(_,i)=>{const d=new Date(last+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(days-1-i));return d.toISOString().slice(0,10);});}
