
'use client';
import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/app-logo';
import { Nav } from '@/components/nav';
import { AppProvider } from '@/context/app-context';
import { ThemeProvider } from '@/context/theme-context';
import { LogoutButton } from '@/components/logout-button';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
        <AppProvider>
          <SidebarProvider>
            <Sidebar className="bg-background border-r">
              <SidebarHeader className="p-4">
                <AppLogo />
              </SidebarHeader>
              <SidebarContent>
                <Nav />
              </SidebarContent>
              <SidebarFooter className="p-4">
                <LogoutButton />
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="p-4 flex items-center md:hidden border-b fixed top-0 left-0 right-0 bg-background z-10 h-16">
                 <SidebarTrigger />
                 <h2 className="text-lg font-bold ml-4">EmpowerYou</h2>
              </header>
              <main className="min-h-screen bg-background pt-16 md:pt-0">
                  <div className="p-4 sm:p-6 lg:p-8">{children}</div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </AppProvider>
    </ThemeProvider>
  );
}
