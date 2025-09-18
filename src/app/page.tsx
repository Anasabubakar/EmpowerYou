
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { AppProvider, useAppContext } from '@/context/app-context';

function RootPageContent() {
    const router = useRouter();
    const { onboarded } = useAppContext();

    useEffect(() => {
        // We wait until the onboarded status is definitively known from localStorage.
        if (onboarded === undefined) {
            return; // Still loading the state
        }
        
        if (onboarded) {
            router.replace('/dashboard');
        } else {
            router.replace('/onboarding');
        }
    }, [onboarded, router]);

    // Show a loading screen while we determine the onboarding status.
    return <Loading />;
}


export default function RootPage() {
    return (
        <AppProvider>
            <RootPageContent />
        </AppProvider>
    );
}
