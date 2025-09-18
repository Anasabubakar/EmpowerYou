'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/theme-context';
import { Moon, Sun, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAppContext } from '@/context/app-context';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { companionName, setCompanionName } = useAppContext();
  
  const [cName, setCName] = useState(companionName);

  const handleClearData = () => {
    // We only clear non-auth related data. Auth is handled by signing out.
    localStorage.removeItem('tasks');
    localStorage.removeItem('goals');
    localStorage.removeItem('healthMetrics');
    localStorage.removeItem('cycleInfo');
    localStorage.removeItem('loggedSymptoms');
    localStorage.removeItem('diaryEntries');
    localStorage.removeItem('anasReflection');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('companionName');
    
    toast({
      title: 'Local App Data Cleared',
      description: 'All your personal tracking data has been removed from this browser. Your account is not affected.',
      variant: 'destructive',
    });
    // Reload to reflect cleared state
    setTimeout(() => window.location.reload(), 1500);
  };
  
  const handleCompanionNameChange = () => {
    setCompanionName(cName);
    toast({
      title: 'Companion Name Updated',
      description: `Your companion's name is now ${cName}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Preferences</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-base">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable dark mode for a different visual experience.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-6 w-6" />
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'light')
                }
              />
              <Moon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your personal information. Your name is managed via your Google Account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companion-name">Companion&apos;s Name</Label>
              <div className="flex gap-2">
                <Input id="companion-name" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g., Sage"/>
                <Button onClick={handleCompanionNameChange}>Save</Button>
              </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
           This will clear all non-account related data stored in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Local App Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  your tasks, goals, entries, and other app data from this browser. Your account itself will not be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
