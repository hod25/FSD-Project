import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReduxProvider } from '@/shared/ui/components';
import './globals.css';

// Load fonts
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

// SEO Metadata
export const metadata: Metadata = {
  title: 'ProSafe',
  description: 'Live helmet detection powered by YOLO & FastAPI',
  icons: {
    icon: '/pro-icon.png',
    shortcut: '/pro-icon.png',
    apple: '/pro-icon.png',
  },
};

// Root layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
