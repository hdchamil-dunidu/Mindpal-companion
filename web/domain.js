export const MOODS = Object.freeze({
  calm:{label:'Calm',color:'#7bd9b0',rgb:'123,217,176',reaction:'idle',word:'A little space to breathe.',icon:'leaf'},
  joy:{label:'Joy',color:'#f2d178',rgb:'242,209,120',reaction:'happy',word:'Let’s keep that good feeling.',icon:'sun'},
  sad:{label:'Sad',color:'#7aaeff',rgb:'122,174,255',reaction:'sad',word:'You can take this slowly. I’m here.',icon:'cloud'},
  anxious:{label:'Anxious',color:'#bd9af2',rgb:'189,154,242',reaction:'stressed',word:'One small step at a time.',icon:'wind'},
  tired:{label:'Tired',color:'#97b7ce',rgb:'151,183,206',reaction:'tired',word:'It’s okay to make room for rest.',icon:'moon'},
  love:{label:'Love',color:'#f2a4bd',rgb:'242,164,189',reaction:'love',word:'A little kindness goes a long way.',icon:'heart'}
});
export const DEFAULT_SETTINGS = Object.freeze({mute:false,sfx:true,music:true,sfxVolume:0.35,musicVolume:0.25,voice:false,reducedMotion:false,currency:'LKR'});
export const HEADS=['','cap','party','crown','headphones'];
export const FACES=['','glasses','sunglasses'];
export const BODIES=['','bow'];
export const CATEGORIES=['Food','Transport','Study','Shopping','Bills','Health','Income','Other'];
export const COLLECTIONS=['moods','tasks','events','finances','sessions','chats'];
export const CUES=['idle','greeting','happy','love','sad','tired','curious','listening','talking'];
export function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function shiftDate(day,n){const d=new Date(day+'T12:00:00');d.setDate(d.getDate()+n);return localDate(d);}
export function dateValid(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;return localDate(new Date(v+'T12:00:00'))===v;}
export function timeValid(v){return typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);}
function text(v,max,required=true){if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw Error(`Please enter ${required?'a value':'text'} of up to ${max} characters.`);return v.trim();}
function choose(v,list){if(!list.includes(v))throw Error('Please select a valid option.');return v;}
export function validateRecord(kind,input){
  const d={};
  if(kind==='moods'){d.mood=choose(input.mood,Object.keys(MOODS));d.note=text(input.note||'',1000,false);}
  else if(kind==='tasks'){
    d.title=text(input.title,200);d.notes=text(input.notes||'',2000,false);d.date=input.date;
    if(!dateValid(d.date))throw Error('Choose a valid date.');d.time=input.time||'';if(d.time&&!timeValid(d.time))throw Error('Choose a valid time.');
    d.priority=choose(input.priority||'normal',['low','normal','high']);d.completed=!!input.completed;
    d.completedAt=d.completed&&typeof input.completedAt==='string'?input.completedAt:null;
  }else if(kind==='events'){
    d.title=text(input.title,200);d.details=text(input.details||'',2000,false);d.date=input.date;d.start=input.start;d.end=input.end;
    if(!dateValid(d.date)||!timeValid(d.start)||!timeValid(d.end)||d.end<=d.start)throw Error('Choose a valid date and an end time after the start time.');
  }else if(kind==='finances'){
    d.title=text(input.title,200);d.kind=choose(input.kind,['income','expense']);d.category=choose(input.category,CATEGORIES);d.date=input.date;
    if(!dateValid(d.date))throw Error('Choose a valid date.');d.amountMinor=Number(input.amountMinor);
    if(!Number.isSafeInteger(d.amountMinor)||d.amountMinor<=0||d.amountMinor>100000000000)throw Error('Enter an amount greater than zero, up to 1 billion.');
  }else if(kind==='sessions'){
    d.kind=choose(input.kind,['focus','break','breathing','stretching','dance']);d.durationMs=Number(input.durationMs);d.targetMs=Number(input.targetMs);
    if(!Number.isSafeInteger(d.durationMs)||d.durationMs<1000||d.durationMs>14400000||d.durationMs!==d.targetMs)throw Error('Only a fully completed session can be saved.');
    d.endedAt=text(input.endedAt,40);if(!Number.isFinite(Date.parse(d.endedAt)))throw Error('Invalid completion date.');d.date=input.date;if(!dateValid(d.date))throw Error('Invalid session date.');
  }else throw Error('Unknown record type.');
  return d;
}
export function validateSettings(v){
  const out={...DEFAULT_SETTINGS};for(const k of ['mute','sfx','music','voice','reducedMotion'])if(typeof v[k]==='boolean')out[k]=v[k];
  for(const k of ['sfxVolume','musicVolume']){const n=Number(v[k]);if(Number.isFinite(n)&&n>=0&&n<=1)out[k]=n;}
  if(['LKR','USD','EUR','GBP','INR'].includes(v.currency))out.currency=v.currency;return out;
}
export function validateLook(v){return {head:choose(v.head||'',HEADS),face:choose(v.face||'',FACES),body:choose(v.body||'',BODIES)};}
export function elapsed(timer,now=Date.now()){
  if(!timer)return 0;return Math.min(timer.targetMs,Math.max(0,timer.elapsedMs+(timer.running?Math.max(0,now-timer.startedAt):0)));
}
export function pauseTimer(t,now=Date.now()){return {...t,elapsedMs:elapsed(t,now),startedAt:null,running:false};}
export function startTimer(t,now=Date.now()){return {...t,startedAt:now,running:true};}
export function totals(records){return records.reduce((a,r)=>{a[r.kind]+=r.amountMinor;return a;},{income:0,expense:0});}
export function overlaps(a,b){return a.date===b.date&&a.start<b.end&&b.start<a.end;}
export function weeklySummary(data,day=localDate()){
  const start=shiftDate(day,-6);const tasks=data.tasks.filter(t=>t.date>=start&&t.date<=day);const sessions=data.sessions.filter(s=>s.date>=start&&s.date<=day&&s.kind==='focus');
  return {tasks:tasks.length,done:tasks.filter(t=>t.completed).length,focusMs:sessions.reduce((n,s)=>n+s.durationMs,0),days:Array.from({length:7},(_,i)=>{const d=shiftDate(start,i);return {date:d,minutes:Math.round(sessions.filter(s=>s.date===d).reduce((n,s)=>n+s.durationMs,0)/60000)};})};
}
export function money(value,currency='LKR'){return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(value/100);}
export function escapeHTML(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
