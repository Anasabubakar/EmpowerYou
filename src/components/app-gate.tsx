
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import Loading from '@/app/loading';

/**
 * AppGate is a component that acts as a gatekeeper for the application.
 * It checks the user's onboarding status and directs them to the
 * appropriate page. It's rendered in the root layout and ensures that
 * state is consistent across the entire app.
 */
export function AppGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { onboarded } = useAppContext();

    useEffect(() => {
        // Wait until the onboarding status is definitively known.
        if (onboarded === undefined) {
            return; // Still loading the state, show the loading screen.
        }

        const isOnboardingPage = pathname === '/onboarding';

        // If the user is onboarded, they should not be on the onboarding page.
        // Redirect them to the dashboard.
        if (onboarded && isOnboardingPage) {
            router.replace('/dashboard');
        }

        // If the user is NOT onboarded, they should be on the onboarding page.
        // Redirect them there unless they are already on it.
        if (!onboarded && !isOnboardingPage) {
            router.replace('/onboarding');
        }

    }, [onboarded, pathname, router]);

    // While we determine the state, show a loading screen.
    if (onboarded === undefined) {
        return <Loading />;
    }
    
    // If the user is not onboarded and is trying to access other pages,
    // they will be redirected by the useEffect. Rendering the children here
    // might cause a flash of content, so we can show a loading screen
    // until the redirect is complete.
    if (!onboarded && pathname !== '/onboarding') {
        return <Loading />;
    }
    
    // If the user is onboarded and tries to go to /onboarding, they
    // will be redirected. Show loading until that happens.
    if (onboarded && pathname === '/onboarding') {
        return <Loading />;
    }


    // Once the status is clear and they are on the correct path, render the children.
    return <>{children}</>;
}
