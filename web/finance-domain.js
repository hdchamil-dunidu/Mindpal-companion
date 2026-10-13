// Shared, deterministic calculations. Money is always integer minor units.
import {dateValid,timeValid,localDate,shiftDate} from './dates.js';
export const FINANCE_COLLECTIONS=['financeBudgets','savingsGoals','recurring','weeklyPlans','insights','reports','categories'];
export const PAYMENT_METHODS=['cash','card','bank','other'];
const amount=(v,zero=false)=>{const n=Number(v);if(!Number.isSafeInteger(n)||n<(zero?0:1)||n>100000000000)throw Error('Enter a valid amount, up to 1 billion.');return n;};
const txt=(v,n=200,optional=false)=>{if(typeof v!=='string'||v.length>n||(!optional&&!v.trim()))throw Error('Enter valid text (maximum '+n+' characters).');return v.trim();};
const option=(v,values)=>{if(!values.includes(v))throw Error('Choose a valid option.');return v;};
const day=v=>{if(!dateValid(v))throw Error('Choose a valid date.');return v;};
export function validateFinance(kind,v){
 if(kind==='financeBudgets'&&(!Array.isArray(v.thresholds||[75,90,100])||(v.thresholds||[75,90,100]).some(t=>!Number.isInteger(Number(t))||Number(t)<=0||Number(t)>200)))throw Error('Alert percentages must be integers from 1 to 200.');
 if(kind==='finances')return {title:txt(v.title),kind:option(v.kind,['income','expense']),category:txt(v.category,60),date:day(v.date),amountMinor:amount(v.amountMinor),time:v.time?(timeValid(v.time)?v.time:(()=>{throw Error('Choose a valid time.');})()):'',description:txt(v.description||'',2000,true),paymentMethod:option(v.paymentMethod||'other',PAYMENT_METHODS),recurringId:txt(v.recurringId||'',80,true)};
 if(kind==='categories')return {title:txt(v.title,60),kind:option(v.kind,['income','expense'])};
 if(kind==='financeBudgets')return {title:txt(v.title),period:option(v.period,['daily','weekly','monthly']),start:day(v.start),category:txt(v.category||'',60,true),amountMinor:amount(v.amountMinor),thresholds:[...new Set((v.thresholds||[75,90,100]).map(Number))].sort((a,b)=>a-b).filter(n=>Number.isInteger(n)&&n>0&&n<=200)};
 if(kind==='savingsGoals')return {title:txt(v.title),targetMinor:amount(v.targetMinor),savedMinor:amount(v.savedMinor||0,true),date:v.date?day(v.date):''};
 if(kind==='recurring')return {title:txt(v.title),category:txt(v.category,60),amountMinor:amount(v.amountMinor),nextDate:day(v.nextDate),anchorDay:Number.isInteger(Number(v.anchorDay))&&Number(v.anchorDay)>=1&&Number(v.anchorDay)<=31?Number(v.anchorDay):Number(v.nextDate.slice(-2)),frequency:option(v.frequency,['weekly','monthly','yearly']),paymentMethod:option(v.paymentMethod||'other',PAYMENT_METHODS),active:v.active!==false};
 if(kind==='weeklyPlans'){
  const d={start:day(v.start),fundsMinor:amount(v.fundsMinor),savingsMinor:amount(v.savingsMinor||0,true),commitmentsMinor:amount(v.commitmentsMinor||0,true),carry:!!v.carry,status:option(v.status||'draft',['draft','accepted']),preferences:txt(v.preferences||'',1000,true),notes:txt(v.notes||'',3000,true)};
  if(!Array.isArray(v.allocations)||v.allocations.length>30)throw Error('Add category allocations.');
  d.allocations=v.allocations.map(a=>({category:txt(a.category,60),amountMinor:amount(a.amountMinor,true)}));
  if(new Set(d.allocations.map(a=>a.category)).size!==d.allocations.length)throw Error('Use each category only once.');
  if(d.allocations.reduce((n,a)=>n+a.amountMinor,0)+d.savingsMinor+d.commitmentsMinor>d.fundsMinor)throw Error('Spending, commitments and savings cannot exceed confirmed funds.');
  d.challenges=Array.isArray(v.challenges)?v.challenges.slice(0,7).map(t=>txt(t,240)):[];return d;
 }
 if(kind==='insights')return {title:txt(v.title),explanation:txt(v.explanation,1500),action:txt(v.action,600),priority:option(v.priority||'normal',['low','normal','high']),status:option(v.status||'open',['open','completed','dismissed']),start:day(v.start),end:day(v.end),category:txt(v.category||'',60,true),evidence:txt(v.evidence||'',1200,true),savingMinor:amount(v.savingMinor||0,true),source:option(v.source||'local',['local','gemini'])};
 if(kind==='reports')return {period:option(v.period,['weekly','monthly','yearly']),start:day(v.start),end:day(v.end),summary:txt(v.summary||'',6000,true),source:option(v.source||'calculated',['calculated','gemini']),fingerprint:txt(v.fingerprint||'',100,true)};
 throw Error('Unknown finance resource.');
}
export function weekStart(d){return shiftDate(d,-((new Date(d+'T12:00:00').getDay()+6)%7));}
export function periodRange(type,date=localDate()){
 day(date);let start=date,end=date;
 if(type==='weekly'){start=weekStart(date);end=shiftDate(start,6);}
 else if(type==='monthly'){start=date.slice(0,7)+'-01';const d=new Date(start+'T12:00:00');d.setMonth(d.getMonth()+1);end=shiftDate(localDate(d),-1);}
 else if(type==='yearly'){start=date.slice(0,4)+'-01-01';end=date.slice(0,4)+'-12-31';}
 else if(type!=='daily')throw Error('Invalid period.');return {start,end};
}
export function daysBetween(a,b){return Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);}
export function previousRange(start,end){const count=daysBetween(start,end)+1;return {start:shiftDate(start,-count),end:shiftDate(start,-1)};}
export function comparisonRange(type,date,today=localDate()){
 const current=periodRange(type,date),effective=current.start<=today&&today<current.end?today:current.end;
 let prior;if(type==='monthly'){const p=shiftDate(current.start,-1);prior=periodRange(type,p);}else if(type==='yearly'){prior=periodRange(type,(Number(date.slice(0,4))-1)+'-01-01');}else prior=previousRange(current.start,current.end);
 const count=daysBetween(current.start,effective);prior.end=shiftDate(prior.start,Math.min(count,daysBetween(prior.start,prior.end)));
 return {current:{start:current.start,end:effective},previous:prior};
}
export function summarize(records,start,end){
 day(start);day(end);if(end<start||daysBetween(start,end)>3660)throw Error('Choose a valid date range of at most ten years.');
 const rows=records.filter(r=>r.date>=start&&r.date<=end),expenses=rows.filter(r=>r.kind==='expense'),income=rows.filter(r=>r.kind==='income').reduce((n,r)=>n+r.amountMinor,0),expense=expenses.reduce((n,r)=>n+r.amountMinor,0),category={};
 for(const r of expenses)category[r.category]=(category[r.category]||0)+r.amountMinor;
 const days=Array.from({length:daysBetween(start,end)+1},(_,i)=>{const date=shiftDate(start,i);return {date,expense:expenses.filter(r=>r.date===date).reduce((n,r)=>n+r.amountMinor,0)};});
 const groups=new Map();for(const r of expenses){const key=r.title.toLowerCase().trim();const a=groups.get(key)||{title:r.title,count:0,amountMinor:0,category:r.category};a.count++;a.amountMinor+=r.amountMinor;groups.set(key,a);}
 const weekend=days.filter(d=>[0,6].includes(new Date(d.date+'T12:00:00').getDay()));const weekday=days.filter(d=>![0,6].includes(new Date(d.date+'T12:00:00').getDay()));
 const avg=expense/days.length;
 return {start,end,income,expense,net:income-expense,savingsRate:income?Math.round((income-expense)/income*1000)/10:null,averageDaily:Math.round(avg),count:rows.length,categories:Object.entries(category).map(([name,total])=>({name,total,percentage:expense?Math.round(total/expense*1000)/10:0})).sort((a,b)=>b.total-a.total),days,highest:expenses.length?Math.max(...expenses.map(r=>r.amountMinor)):0,lowest:expenses.length?Math.min(...expenses.map(r=>r.amountMinor)):0,largest:expenses.slice().sort((a,b)=>b.amountMinor-a.amountMinor).slice(0,5),repeated:[...groups.values()].filter(g=>g.count>=3),unusualDays:days.filter(d=>d.expense>avg*2&&d.expense>0),weekdayAverage:weekday.length?Math.round(weekday.reduce((n,d)=>n+d.expense,0)/weekday.length):0,weekendAverage:weekend.length?Math.round(weekend.reduce((n,d)=>n+d.expense,0)/weekend.length):0};
}
export function budgetProgress(b,records){const range=periodRange(b.period,b.start),spent=records.filter(r=>r.kind==='expense'&&r.date>=range.start&&r.date<=range.end&&(!b.category||r.category===b.category)).reduce((n,r)=>n+r.amountMinor,0);return {...range,spent,remaining:b.amountMinor-spent,percent:b.amountMinor?spent/b.amountMinor*100:0};}
export function nextOccurrence(r,date=r.nextDate){
 if(r.frequency==='weekly')return shiftDate(date,7);
 const d=new Date(date+'T12:00:00'),wanted=r.anchorDay||Number(r.nextDate.slice(-2));d.setDate(1);if(r.frequency==='monthly')d.setMonth(d.getMonth()+1);else d.setFullYear(d.getFullYear()+1);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(wanted,last));return localDate(d);
}
export function upcomingPayments(records,start,end){return records.filter(r=>r.active).flatMap(r=>{const list=[];let date=r.nextDate;for(let i=0;date<=end&&i<600;i++,date=nextOccurrence(r,date))if(date>=start)list.push({...r,date});return list;}).sort((a,b)=>a.date.localeCompare(b.date));}
export function planProgress(plan,transactions){const end=shiftDate(plan.start,6),sum=summarize(transactions,plan.start,end),limit=plan.allocations.reduce((n,a)=>n+a.amountMinor,0)+plan.commitmentsMinor;let carry=0;const days=sum.days.map((d,i)=>{const allowance=Math.floor(limit/7)+(i<limit%7?1:0)+(plan.carry?carry:0);carry=Math.max(0,allowance-d.expense);return {...d,allowance,remaining:allowance-d.expense,challenge:plan.challenges[i]||''};});return {days,spent:sum.expense,limit,remaining:limit-sum.expense,savingsReserved:plan.savingsMinor,categories:plan.allocations.map(a=>({...a,spent:sum.categories.find(c=>c.name===a.category)?.total||0}))};}
export function suggestCategory(title,kind='expense'){if(kind==='income'){if(/salary|wage/i.test(title))return 'Salary';if(/gift/i.test(title))return 'Gift';if(/freelance/i.test(title))return 'Freelance';return 'Allowance';}for(const [re,c]of [[/food|ice.?cream|snack|lunch|dinner|coffee|breakfast|meal/i,'Food'],[/bus|train|taxi|fuel|fare|transport/i,'Transport'],[/textbook|book|course|tuition/i,'Study'],[/movie|game|cinema|concert/i,'Entertainment']])if(re.test(title))return c;return 'Other';}
export function financialAlerts(data,today=localDate()){
 const out=[];for(const b of data.financeBudgets||[]){const p=budgetProgress(b,data.finances);if(today<p.start||today>p.end)continue;const threshold=b.thresholds.filter(t=>p.percent>=t).at(-1);if(threshold)out.push({key:'budget:'+b.id+':'+p.start+':'+threshold,text:b.title+' has reached '+Math.round(p.percent)+'% of its budget.',route:'money'});}
 for(const g of data.savingsGoals||[])if(g.savedMinor>=g.targetMinor)out.push({key:'goal:'+g.id+':'+g.targetMinor,text:'You reached your '+g.title+' savings goal!',route:'money'});
 for(const r of upcomingPayments(data.recurring||[],today,shiftDate(today,3)))out.push({key:'recurring:'+r.id+':'+r.date,text:r.title+' is due '+r.date+'.',route:'money'});
 const current=summarize(data.finances,shiftDate(today,-6),today),prior=summarize(data.finances,shiftDate(today,-13),shiftDate(today,-7));if(prior.expense&&current.expense>prior.expense*1.5)out.push({key:'rise:'+weekStart(today),text:'Recorded spending in the last 7 days is over 50% above the preceding 7 days. Review your transactions.',route:'money'});return out;
}
export function csvEncode(rows){return rows.map(row=>row.map(v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"').join(',')).join('\r\n');}
export function exportTransactions(records,currency){return csvEncode([['id','date','time','kind','title','category','amount','paymentMethod','description','currency'],...records.map(r=>[r.id,r.date,r.time,r.kind,r.title,r.category,(r.amountMinor/100).toFixed(2),r.paymentMethod||'other',r.description||'',currency])]);}
export function csvParse(input){
 input=input.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){cell+='"';i++;}else if(!quoted&&cell)throw Error('Invalid CSV quote.');else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&input[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}if(quoted)throw Error('CSV has an unclosed quote.');row.push(cell);if(row.some(Boolean))rows.push(row);return rows;
}
export function importTransactions(input,existing,currency){
 const rows=csvParse(input),header=rows.shift()?.map(v=>v.trim());if(!header||!['date','kind','title','category','amount'].every(k=>header.includes(k)))throw Error('CSV requires date, kind, title, category and amount columns. Export a file to see the format.');
 if(rows.length>2000)throw Error('Import at most 2,000 rows at once.');const fingerprint=r=>[r.date,r.time||'',r.kind,r.title,r.category,r.amountMinor,r.paymentMethod||'other',r.description||''].join('|');const seen=new Set(existing.map(fingerprint)),ids=new Set(existing.map(r=>r.id));const records=[];let duplicates=0;
 rows.forEach((row,i)=>{try{if(row.length!==header.length)throw Error('Column count does not match.');const v=Object.fromEntries(header.map((k,j)=>[k,row[j].replace(/^'(?=[=+@\-\t\r])/,'')]));if(v.currency&&v.currency!==currency)throw Error('Currency differs from your settings.');if(!/^\d+(\.\d{1,2})?$/.test(v.amount))throw Error('Amount needs up to two decimal places.');const r=validateFinance('finances',{...v,amountMinor:Math.round(Number(v.amount)*100)}),fp=fingerprint(r);if(seen.has(fp)||(v.id&&ids.has(v.id))){duplicates++;return;}seen.add(fp);records.push(r);}catch(e){throw Error('CSV row '+(i+2)+': '+e.message);}});return {records,duplicates};
}
