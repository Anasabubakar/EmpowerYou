
'use client';
import React, { useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/app-logo';
import { Nav } from '@/components/nav';
import { AppProvider, useAppContext } from '@/context/app-context';
import { ThemeProvider } from '@/context/theme-context';
import { useRouter } from 'next/navigation';
import Loading from './loading';
import { ProfileButton } from '@/components/profile-button';


function AppContent({ children }: { children: React.ReactNode }) {
  const { user, onboarded } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
        router.push('/onboarding');
    } else if (user && onboarded === false) {
      router.push('/onboarding');
    }
  }, [user, onboarded, router]);

  if (!user || onboarded === false) {
    return <Loading />;
  }
  
  return (
    <SidebarProvider>
      <Sidebar className="bg-background border-r">
        <SidebarHeader className="p-4">
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <Nav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <ProfileButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="p-4 flex items-center md:hidden border-b fixed top-0 left-0 right-0 bg-background z-10 h-16">
           <SidebarTrigger />
           <div className="ml-4 flex items-center gap-2">
            <AppLogo />
           </div>
        </header>
        <main className="min-h-screen bg-background pt-16 md:pt-0">
            <div className="p-4 sm:p-6 lg:p-8 animate-fade-in-up">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
        <AppProvider>
          <AppContent>{children}</AppContent>
        </AppProvider>
    </ThemeProvider>
  );
}
