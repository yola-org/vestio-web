import type { Metadata } from 'next';
import NotificationProvider from '@/components/shared/NotificationProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vestio',
  description: 'La communauté marocaine où chaque dressing trouve une nouvelle histoire.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
