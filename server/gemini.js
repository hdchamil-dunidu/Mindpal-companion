import {fail} from './auth.js';
let selected;
function providerError(status){const errors={400:'Gemini rejected the request. Check the selected model supports JSON responses and your key is valid.',401:'Gemini API key is invalid. Replace GEMINI_API_KEY in .env and restart the server.',403:'Gemini access was denied. Check API key restrictions, project access, region and billing in Google AI Studio.',404:'Gemini model was not found. Run npm run models and choose an available model, or set GEMINI_MODEL=auto.',429:'Gemini quota or rate limit reached. Check the API project quota/billing or retry later.'};return fail(errors[status]||'Gemini is temporarily unavailable. Please retry.',status===429?429:502);}
export async function listModels(fetcher=fetch){
 if(!process.env.GEMINI_API_KEY)throw fail('Add GEMINI_API_KEY to the backend .env and restart npm start.',503);
 let models=[],page='';do{const r=await fetcher('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000'+(page?'&pageToken='+encodeURIComponent(page):''),{headers:{'x-goog-api-key':process.env.GEMINI_API_KEY},signal:AbortSignal.timeout(15000)});if(!r.ok)throw providerError(r.status);const data=await r.json();models.push(...(data.models||[]));page=data.nextPageToken||'';}while(page&&models.length<3000);
 return models.filter(m=>m.supportedGenerationMethods?.includes('generateContent')).map(m=>m.name.replace(/^models\//,''));
}
export async function resolveModel(fetcher=fetch){
 const value=(process.env.GEMINI_MODEL||'auto').replace(/^models\//,'');if(value!=='auto'){if(!/^[\w.\-]+$/.test(value))throw fail('Invalid GEMINI_MODEL. Use its model ID only.',503);return value;}
 if(selected?.key===process.env.GEMINI_API_KEY&&Date.now()-selected.time<3600000)return selected.model;
 const models=await listModels(fetcher);const candidates=models.filter(m=>/^gemini-/.test(m)&&/flash/.test(m)&&!/image|audio|live|tts|robot|computer|exp|preview/.test(m));
 candidates.sort((a,b)=>Number(/lite/.test(b))-Number(/lite/.test(a))||b.localeCompare(a,undefined,{numeric:true}));
 if(!candidates.length)throw fail('No compatible stable Gemini Flash model was returned for this key. Run npm run models and set GEMINI_MODEL explicitly.',503);
 selected={key:process.env.GEMINI_API_KEY,time:Date.now(),model:candidates[0]};return selected.model;
}
export async function generateJSON(system,contents,{fetcher=fetch,maxTokens=3000}={}){
 if(!process.env.GEMINI_API_KEY)throw fail('Gemini is not configured. Add GEMINI_API_KEY to the private backend .env and restart npm start.',503);
 try{const model=await resolveModel(fetcher),r=await fetcher('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},signal:AbortSignal.timeout(45000),body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents,generationConfig:{responseMimeType:'application/json',temperature:.35,maxOutputTokens:maxTokens}})});
 if(!r.ok)throw providerError(r.status);const data=await r.json();const raw=data.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('');if(!raw)throw fail('Gemini returned no answer. The request may have been filtered; try rephrasing.',502);try{return JSON.parse(raw);}catch{throw fail('Gemini returned an incomplete or invalid response. Retry with a shorter request.',502);}
 }catch(e){if(e.status)throw e;if(['TimeoutError','AbortError'].includes(e.name))throw fail('Gemini took too long to reply. Please retry.',504);throw fail('The backend could not reach Gemini. Check the laptop internet connection and retry.',502);}
}
export async function checkGemini(){const result=await generateJSON('Return only JSON: {"ok":true}.',[{role:'user',parts:[{text:'Connection test. Reply with ok true.'}]}]);if(result.ok!==true)throw fail('Gemini replied, but the connection-test response was unexpected.',502);return {ok:true,model:await resolveModel()};}
