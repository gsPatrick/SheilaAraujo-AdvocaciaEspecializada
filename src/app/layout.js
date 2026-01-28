import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';

export const metadata = {
  title: 'Assistente Jurídico IA',
  description: 'Plataforma de inteligência jurídica especializada',
  icons: {
    icon: '/LOGO.jpeg',
    shortcut: '/LOGO.jpeg',
    apple: '/LOGO.jpeg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
