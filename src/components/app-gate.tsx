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
    const { onboarded } = useAppContext();

    useEffect(() => {
        // Wait until the onboarding status is definitively known from localStorage.
        if (onboarded === undefined) {
            return; // State is still loading, do nothing.
        }

        const isOnboardingPage = pathname === '/onboarding';

        // If user is onboarded but on the onboarding page, redirect to dashboard.
        if (onboarded && isOnboardingPage) {
            router.replace('/dashboard');
        }

        // If user is not onboarded and not on the onboarding page, redirect there.
        if (!onboarded && !isOnboardingPage) {
            router.replace('/onboarding');
        }

    }, [onboarded, pathname, router]);

    // While we determine the state from localStorage, show a loading screen.
    if (onboarded === undefined) {
        return <Loading />;
    }
    
    // If a redirect is needed, show loading until Next.js router takes over.
    if (onboarded && pathname !== '/dashboard' && pathname === '/onboarding') {
      return <Loading />;
    }
    if (!onboarded && pathname !== '/onboarding') {
      return <Loading />;
    }

    // Once the status is clear and the user is on the correct path, render the page.
    return <>{children}</>;
}
