
'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Button variant="ghost" className="justify-start gap-2" onClick={logout}>
      <LogOut className="h-5 w-5 text-muted-foreground" />
      <span className="text-foreground">Logout</span>
    </Button>
  );
}
