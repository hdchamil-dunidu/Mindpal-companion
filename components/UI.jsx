'use client';
import {X} from 'lucide-react';import {useEffect,useRef} from 'react';
export function Card({children,className=''}){return <section className={'card '+className}>{children}</section>}
export function SectionTitle({eyebrow,title,description,action}){return <header className="page-heading"><div><p className="eyebrow">{eyebrow||'YOUR PERSONAL SPACE'}</p><h1>{title}</h1>{description&&<p className="muted">{description}</p>}</div>{action}</header>}
export function Empty({children}){return <div className="empty"><span className="empty-mark">✧</span><p>{children}</p></div>}
export function Stat({icon:Icon,label,value,detail}){return <Card className="stat"><span className="stat-icon">{Icon&&<Icon size={20}/>}</span><span className="muted small">{label}</span><strong>{value}</strong>{detail&&<small>{detail}</small>}</Card>}
export function Modal({title,onClose,children}){const ref=useRef();useEffect(()=>{const d=ref.current;d.showModal();const close=e=>{e.preventDefault();onClose();};d.addEventListener('cancel',close);return()=>d.removeEventListener('cancel',close);},[]);return <dialog ref={ref} className="modal"><div className="card-title"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X/></button></div>{children}</dialog>}
export function Progress({value}){return <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}><span style={{width:Math.max(0,Math.min(100,value))+'%'}}/></div>}
export function Select({label,options,...props}){return <label>{label}<select {...props}>{options.map(o=><option key={typeof o==='string'?o:o.value} value={typeof o==='string'?o:o.value}>{typeof o==='string'?o:o.label}</option>)}</select></label>}
