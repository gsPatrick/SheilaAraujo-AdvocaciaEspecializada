'use client';
import styles from './MobileNav.module.css';
import { LayoutDashboard, MessageSquare, Bell, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Home', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Chats', icon: MessageSquare, path: '/chats' },
        { name: 'Alertas', icon: Bell, path: '/alerts' },
        { name: 'Fichas', icon: Users, path: '/contacts' },
        { name: 'Mais', icon: Settings, path: '/settings' },
    ];

    return (
        <nav className={styles.bottomNav}>
            {tabs.map((tab) => (
                <Link
                    key={tab.name}
                    href={tab.path}
                    className={`${styles.tab} ${pathname.startsWith(tab.path) ? styles.active : ''}`}
                >
                    <tab.icon size={22} strokeWidth={pathname.startsWith(tab.path) ? 2.5 : 2} />
                    <span>{tab.name}</span>
                </Link>
            ))}
        </nav>
    );
}
