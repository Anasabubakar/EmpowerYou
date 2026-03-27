
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import 'react-image-crop/dist/ReactCrop.css';
import { AppProvider } from '@/context/app-context';
import { ThemeProvider } from '@/context/theme-context';

export const metadata: Metadata = {
  title: 'EmpowerYou',
  description: 'A holistic tool for tracking various aspects of your life, promoting self-awareness, organization, and personal growth.',
  icons: {
    icon: '/images/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
      </head>
      <body className="font-body antialiased transition-colors duration-300">
        <ThemeProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
