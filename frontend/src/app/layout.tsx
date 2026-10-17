import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'ESTATEVO — Real Estate CRM & Sales Pipeline Management',
  description:
    'High-velocity Real Estate CRM for builders, developers, and brokers. Information-dense lead intelligence, automated follow-ups, and sales tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
