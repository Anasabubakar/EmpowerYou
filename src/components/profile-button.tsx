
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function ProfileButton() {
  const {
    userName,
    setTasks,
    setGoals,
    setHealthMetrics,
    setDiaryEntries,
    setOnboarded,
    setCycleInfo,
    setLoggedSymptoms,
    setAnasReflection,
    setChatHistory,
  } = useAppContext();
  
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };
  
  const handleSignOut = () => {
    localStorage.clear();
    setTasks([]);
    setGoals([]);
    setHealthMetrics([]);
    setDiaryEntries([]);
    if(setOnboarded) setOnboarded(false); // Make sure setOnboarded is called
    setCycleInfo({ currentDay: 0, nextPeriodIn: 0, predictedDate: new Date(), lastPeriodDate: undefined });
    setLoggedSymptoms([]);
    setAnasReflection({ myBehavior: '3', hisBehavior: '3', progressLog: '', plans: '' });
    setChatHistory([]);
    

    toast({
      title: 'Signed Out',
      description: 'You have been signed out. The app will now reload.',
    });
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-auto w-full items-center justify-start gap-3 p-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">{userName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsAlertOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your local data and you will need to start fresh. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
