
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

export function ProfileButton() {
  const {
    userName,
    profilePicture,
    setProfilePicture,
    setTasks,
    setGoals,
    setHealthMetrics,
    setDiaryEntries,
    setOnboarded,
    setCycleInfo,
    setLoggedSymptoms,
    setRelationshipTracker,
    setChatHistory,
  } = useAppContext();
  
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };
  
  const handleSignOut = () => {
    localStorage.clear();
    setTasks([]);
    setGoals([]);
    setHealthMetrics([]);
    setDiaryEntries([]);
    setProfilePicture(null);
    setCycleInfo({ currentDay: 0, nextPeriodIn: 0, predictedDate: new Date(), lastPeriodDate: undefined });
    setLoggedSymptoms([]);
    setRelationshipTracker({ myBehavior: '3', hisBehavior: '3', progressLog: '', plans: '' });
    setChatHistory([]);
    if(setOnboarded) setOnboarded(false);

    toast({
      title: 'Signed Out',
      description: 'You have been signed out. The app will now reload.',
    });
    setTimeout(() => window.location.reload(), 1500);
  };
  
  const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        toast({
          title: 'Profile Picture Updated',
          description: 'Your new picture has been saved.',
        });
      };
      reader.readAsDataURL(file);
    }
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
              <AvatarImage src={profilePicture || undefined} alt={userName} />
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
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            <span>Upload Picture</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePictureUpload}
              className="hidden"
              accept="image/*"
            />
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
