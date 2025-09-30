'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import Loading from './loading';

export default function RootPage() {
  const { authStatus } = useAppContext();
    const router = useRouter();

      useEffect(() => {
          if (authStatus === 'loading') return;

          if (authStatus === 'authenticated') {
              router.replace('/dashboard');
          } else {
              router.replace('/onboarding');
          }
      }, [authStatus, router]);

    // Render a loading component while the redirection is happening.
    return <Loading />;
}
