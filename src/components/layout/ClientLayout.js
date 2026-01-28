'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import MobileNav from '@/components/layout/MobileNav/MobileNav';
import MiniChat from '@/components/MiniChat/MiniChat';
import styles from '@/app/layout.module.css';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login' || pathname === '/';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className={styles.wrapper}>
            <Sidebar />
            <MobileNav />
            <main className={styles.main}>
                <div key={pathname} className="page-transition">
                    {children}
                </div>
            </main>
            {/* Hide MiniChat on Chat-related pages to avoid redundancy */}
            {!pathname.startsWith('/chats') && !pathname.startsWith('/contacts') && <MiniChat />}
        </div>
    );
}
