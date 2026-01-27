'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login or dashboard depending on auth status
        // For now, redirect to login
        router.replace('/login');
    }, [router]);

    return <div style={{ background: '#fff', height: '100vh' }} />;
}
