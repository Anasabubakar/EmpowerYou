'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import Loading from './loading';

export default function RootPage() {
  const { authStatus } = useAppContext();
    const router = useRouter();

      useEffect(() => {
          if (authStatus === 'loading') {
            // Wait until the authentication status is determined
            return;
          }

          if (authStatus === 'authenticated') {
              router.replace('/dashboard');
          } else {
              router.replace('/onboarding');
          }
      }, [authStatus, router]);

    // Render a loading component while the authentication check and redirection are in progress.
    // This ensures the page always returns a valid component, preventing 404 errors.
    return <Loading />;
}
