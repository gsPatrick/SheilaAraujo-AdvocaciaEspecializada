'use client';
import styles from './Sidebar.module.css';
import {
    LayoutDashboard, MessageSquare, ShieldAlert,
    Settings, UserCircle, Users, Zap, LogOut, Bell
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const menuItems = [
        { name: 'Painel Central', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Protocolo de Conversa', icon: MessageSquare, path: '/chats' },
        { name: 'Alertas Judiciais', icon: Bell, path: '/alerts' },
        { name: 'Diretório de Contatos', icon: Users, path: '/contacts' },
        { name: 'Módulos e Integrações', icon: Zap, path: '/integration' },
        { name: 'Lista de Bloqueio', icon: ShieldAlert, path: '/blacklist' },
        { name: 'Parâmetros do Sistema', icon: Settings, path: '/settings' },
    ];

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.removeItem('token');
            router.push('/login');
        }, 800);
    };

    return (
        <>
            {isLoggingOut && (
                <div className="logoutOverlay">
                    <div className="loader">Saindo...</div>
                </div>
            )}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <Link href="/dashboard" className={styles.logoLink}>
                        <span className={styles.logoText}>CAROL<span>IA</span></span>
                    </Link>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`${styles.navItem} ${pathname.startsWith(item.path) ? styles.active : ''}`}
                        >
                            <item.icon size={22} strokeWidth={2} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.footer}>
                    <Link href="/profile" className={styles.user}>
                        <UserCircle size={28} strokeWidth={1.5} />
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>Operador Admin</span>
                            <span className={styles.userSub}>Editar Perfil</span>
                        </div>
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={18} />
                        <span>Sair do Sistema</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
