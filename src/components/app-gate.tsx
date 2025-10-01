
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import Loading from '@/app/loading';

/**
 * AppGate is a component that acts as a gatekeeper for the application.
 * It checks the user's authentication status and directs them to the
 * appropriate page. It's rendered in the root layout and ensures that
 * state is consistent across the entire app.
 */
export function AppGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { authStatus } = useAppContext();

    useEffect(() => {
        if (authStatus === 'loading') {
            return; // Still loading the auth status
        }

        const isAuthPage = pathname === '/onboarding';

        if (authStatus === 'authenticated' && isAuthPage) {
            router.replace('/dashboard');
        } else if (authStatus === 'unauthenticated' && !isAuthPage) {
            router.replace('/onboarding');
        }
    }, [authStatus, pathname, router]);

    if (authStatus === 'loading') {
        return <Loading />;
    }

    const isAuthPage = pathname === '/onboarding';
    if (authStatus === 'authenticated' && isAuthPage) {
        return <Loading />; // Show loading while redirecting to dashboard
    }
    if (authStatus === 'unauthenticated' && !isAuthPage) {
        return <Loading />; // Show loading while redirecting to onboarding
    }

    return <>{children}</>;
}
