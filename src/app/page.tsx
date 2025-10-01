'use client';

import Loading from './loading';

export default function RootPage() {
    // This page is now a placeholder.
    // The routing logic is handled by AppGate in the root layout.
    // This ensures that the user is always directed to the correct
    // page without seeing a flash of content.
    return <Loading />;
}
