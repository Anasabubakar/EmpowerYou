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
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { AppProvider } from '@/context/app-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
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
            <Button variant="ghost" className="justify-start gap-2">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="p-4 flex items-center md:hidden border-b">
             <SidebarTrigger />
             <h2 className="text-lg font-bold ml-4">EmpowerYou</h2>
          </header>
          <main className="min-h-screen bg-background">
              <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  );
}
