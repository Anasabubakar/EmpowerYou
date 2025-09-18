
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { AppProvider, useAppContext } from '@/context/app-context';

function RootPageContent() {
    const router = useRouter();
    const { onboarded } = useAppContext();

    useEffect(() => {
        if (onboarded === true) {
            router.replace('/dashboard');
        } else if (onboarded === false) {
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
