import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { Bell, Search, MoreVertical, Zap, ShieldAlert, LogOut, UserCircle } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { useRouter } from 'next/navigation';

export default function Header({ title }) {
    const isMobile = useMobile();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <h1 className={styles.title}>{title}</h1>
            </div>

            <div className={styles.right}>
                <div className={styles.search}>
                    <Search size={16} strokeWidth={1.5} />
                    <input type="text" placeholder="Pesquisar..." />
                </div>

                <button className={styles.iconButton}>
                    <Bell size={20} strokeWidth={1.5} />
                    <span className={styles.badge} />
                </button>

                {isMobile && (
                    <div className={styles.menuWrapper} ref={menuRef}>
                        <button
                            className={styles.iconButton}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <MoreVertical size={20} strokeWidth={2} />
                        </button>

                        {isMenuOpen && (
                            <div className={styles.dropdown}>
                                <div className={styles.menuHeader}>
                                    <span>Mais Opções</span>
                                </div>
                                <Link href="/integration" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                                    <Zap size={18} />
                                    Integrações
                                </Link>
                                <Link href="/blacklist" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                                    <ShieldAlert size={18} />
                                    Lista de Bloqueio
                                </Link>
                                <div className={styles.divider} />
                                <Link href="/profile" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                                    <UserCircle size={18} />
                                    Meu Perfil
                                </Link>
                                <button onClick={handleLogout} className={`${styles.menuItem} ${styles.logout}`}>
                                    <LogOut size={18} />
                                    Sair do Sistema
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
