export function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function shiftDate(day,n){const d=new Date(day+'T12:00:00');d.setDate(d.getDate()+n);return localDate(d);}
export function dateValid(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;return localDate(new Date(v+'T12:00:00'))===v;}
export function timeValid(v){return typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);}
