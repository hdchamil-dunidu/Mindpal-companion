'use client';
import {createContext,useContext} from 'react';
export const AppContext=createContext(null);
export const useApp=()=>useContext(AppContext);
export async function request(path,method='GET',data){const r=await fetch('/api/'+path,{method,headers:{'Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{})});const out=await r.json();if(!r.ok)throw new Error(out.error||'Request failed. Please try again.');return out;}
