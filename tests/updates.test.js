import test from 'node:test';
import assert from 'node:assert/strict';
import {financeProgress,moneyProgress,moodSupport,specialDays} from '../web/updates.js';
import {validateRecord,validateSettings,DEFAULT_SETTINGS} from '../web/domain.js';
const row=(date,amountMinor,kind='expense',category='Food')=>({date,amountMinor,kind,category});
test('financial progress excludes other months and compares disjoint seven-day ranges',()=>{
 const p=financeProgress([row('2026-10-11',200),row('2026-10-05',300),row('2026-10-04',400),row('2026-09-30',100),row('2026-10-11',1000,'income')],'2026-10','2026-10-11');
 assert.equal(p.expense,900);assert.equal(p.balance,100);assert.equal(p.week,500);assert.equal(p.previous,500);assert.deepEqual(p.categories,[['Food',900]]);
});
test('financial progress handles empty records and zero income without NaN',()=>{
 const s={month:'2026-10',data:{finances:[],settings:{...DEFAULT_SETTINGS}}};const html=moneyProgress(s);assert.ok(!html.includes('NaN'));assert.ok(html.includes('Add income'));assert.ok(html.includes('Add expenses'));
});
test('budgets validate minor units and reject invalid keys and values',()=>{
 assert.deepEqual(validateSettings({budgets:{'2026-10':10000,'2026-11':0,'2026-13':10,'2026-12':-1,'2027-01':0.5}}).budgets,{'2026-10':10000,'2026-11':0});
});
test('calendar legacy events remain regular; special days persist with validation',()=>{
 const base={title:'Birthday',date:'2026-10-11',start:'09:00',end:'10:00'};assert.equal(validateRecord('events',base).occasion,'none');assert.equal(validateRecord('events',{...base,occasion:'birthday'}).occasion,'birthday');assert.throws(()=>validateRecord('events',{...base,occasion:'<img>'}));
 const html=specialDays({day:'2026-10-11',data:{events:[{...base,id:'test1234',title:'<script>',occasion:'birthday'}]}});assert.ok(!html.includes('<script>'));assert.ok(html.includes('occasion-birthday'));
});
test('mood support uses saved mood and offers working existing activity routes',()=>{
 const html=moodSupport({moodDraft:'joy',data:{moods:[{mood:'sad'}]}});assert.ok(html.includes('SAD')||html.includes('Sad'));assert.ok(html.includes('data-activity="breathing"'));assert.ok(html.includes('data-route="chat"'));assert.ok(!html.includes('data-activity="music"'));
});
