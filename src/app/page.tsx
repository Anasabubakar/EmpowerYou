
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import Loading from './loading';

export default function RootPage() {
  const { onboarded } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (onboarded !== undefined) {
      if (onboarded) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [onboarded, router]);

  // Render a loading component while the redirection is happening.
  return <Loading />;
}
