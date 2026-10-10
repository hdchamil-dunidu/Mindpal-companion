import './globals.css';
import Provider from '@/components/Provider';
export const metadata={title:{default:'MindPal — A Brighter You',template:'%s · MindPal'},description:'Your personal study, wellbeing and everyday life companion.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'MindPal'},icons:{icon:'/icon-192.png',apple:'/icon-192.png'}};
export const viewport={width:'device-width',initialScale:1,themeColor:'#151124'};
export default function RootLayout({children}){return <html lang="en"><body><Provider>{children}</Provider></body></html>}
