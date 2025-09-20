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
        if (onboarded === undefined) {
            return; // Still loading the onboarding status
        }

        const isPublicPage = pathname === '/onboarding' || pathname === '/';

        if (onboarded && isPublicPage) {
            router.replace('/dashboard');
        } else if (!onboarded && !isPublicPage) {
            router.replace('/onboarding');
        }
    }, [onboarded, pathname, router]);

    // While loading state or during redirection, show a loading screen.
    if (onboarded === undefined) {
        return <Loading />;
    }
    
    const isPublicPage = pathname === '/onboarding' || pathname === '/';
    if (onboarded && isPublicPage) {
        return <Loading />; // Show loading while redirecting to dashboard
    }
    if (!onboarded && !isPublicPage) {
        return <Loading />; // Show loading while redirecting to onboarding
    }

    return <>{children}</>;
}
