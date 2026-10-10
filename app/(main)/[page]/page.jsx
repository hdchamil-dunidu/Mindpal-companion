import {notFound} from 'next/navigation';import MindPal from '@/components/MindPal';
const pages=['dashboard','mood','tasks','calendar','focus','breathing','finance','progress','mood-progress','chat','customize','profile'];
export default async function Page({params}){const {page}=await params;if(!pages.includes(page))notFound();return <MindPal page={page}/>}
