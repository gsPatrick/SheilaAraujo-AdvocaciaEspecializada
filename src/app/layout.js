'use client';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import MobileNav from '@/components/layout/MobileNav/MobileNav';
import MiniChat from '@/components/MiniChat/MiniChat';
import styles from './layout.module.css';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname === '/';

  if (isLoginPage) {
    return (
      <html lang="pt-br">
        <body>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="pt-br">
      <body>
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
      </body>
    </html>
  );
}
