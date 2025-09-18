
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { useAppContext } from '@/context/app-context';


export default function RootPage() {
    const router = useRouter();
    const { onboarded } = useAppContext();

    useEffect(() => {
        if (onboarded) {
            router.replace('/dashboard');
        } else if (onboarded === false) {
            router.replace('/onboarding');
        }
    }, [onboarded, router]);

    return <Loading />;
}

