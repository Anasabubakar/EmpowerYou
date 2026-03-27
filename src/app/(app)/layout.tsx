
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
import { ProfileButton } from '@/components/profile-button';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar className="bg-background/80 backdrop-blur border-r border-border/60">
        <SidebarHeader className="p-4">
          <AppLogo />
        </SidebarHeader>
        <SidebarContent className="px-3">
          <Nav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <ProfileButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="overflow-x-hidden">
        <header className="p-4 flex items-center md:hidden border-b border-border/60 fixed top-0 left-0 right-0 bg-background/80 backdrop-blur z-10 h-16">
          <SidebarTrigger />
          <div className="ml-4 flex items-center gap-2">
            <AppLogo />
          </div>
        </header>
        <main className="min-h-screen pt-16 md:pt-0">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10 animate-fade-in-up">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
