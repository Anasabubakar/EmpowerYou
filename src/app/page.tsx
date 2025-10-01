'use client';

import Loading from './loading';
import { useAppContext } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const { authStatus } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/dashboard');
    } else if (authStatus === 'unauthenticated') {
      router.replace('/onboarding');
    }
  }, [authStatus, router]);
  
  return <Loading />;
}
