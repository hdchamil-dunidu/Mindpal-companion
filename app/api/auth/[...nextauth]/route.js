import NextAuth from 'next-auth';
import {authOptions} from '@/lib/auth';
const handler=(NextAuth.default || NextAuth)(authOptions);
export {handler as GET,handler as POST};
