
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { AppProvider, useAppContext } from '@/context/app-context';

function RootPageContent() {
    const router = useRouter();
    const { onboarded } = useAppContext();

    useEffect(() => {
        // Simple check to see if onboarding is complete.
        // If not, redirect to onboarding. Otherwise, go to dashboard.
        if (onboarded) {
            router.replace('/dashboard');
        } else {
            router.replace('/onboarding');
        }
    }, [onboarded, router]);

    return <Loading />;
}


export default function RootPage() {
    return (
        <AppProvider>
            <RootPageContent />
        </AppProvider>
    );
}
