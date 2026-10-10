// Android installed web apps use service-worker notifications instead of the constructor.
export async function browserNotice(title,body){
 if(typeof window==='undefined'||!('Notification'in window)||Notification.permission!=='granted')return;
 try{const registration=await navigator.serviceWorker?.getRegistration();if(registration?.showNotification)await registration.showNotification(title,{body,icon:'/icon-192.png'});else new Notification(title,{body,icon:'/icon-192.png'});}catch{/* In-app feedback remains available when the platform cannot show a notification. */}
}
