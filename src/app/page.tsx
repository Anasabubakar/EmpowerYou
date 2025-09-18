
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { AppProvider, useAppContext } from '@/context/app-context';

function RootPageContent() {
    const router = useRouter();
    const { user, onboarded } = useAppContext();

    useEffect(() => {
        if (user) {
            if (onboarded) {
                router.replace('/dashboard');
            } else {
                router.replace('/onboarding');
            }
        } else if (user === null) {
            // If user is not logged in, you might want to show a landing page
            // or redirect to a login page. For now, we go to onboarding which handles sign in.
            router.replace('/onboarding');
        }
    }, [user, onboarded, router]);

    return <Loading />;
}


export default function RootPage() {
    return (
        <AppProvider>
            <RootPageContent />
        </AppProvider>
    );
}
