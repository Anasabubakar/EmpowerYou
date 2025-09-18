
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
import { useAuth } from '@/context/auth-context';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const {
    userName,
    setUserName,
    setTasks,
    setGoals,
    setHealthMetrics,
    setDiaryEntries,
  } = useAppContext();
  
  const { user } = useAuth();

  const [name, setName] = useState(userName);

  const handleClearData = () => {
    // This will be replaced with Firestore data deletion in the future
    setTasks([]);
    setGoals([]);
    setHealthMetrics([]);
    setDiaryEntries([]);
    toast({
      title: 'Local Data Cleared',
      description: 'All local application data has been removed.',
      variant: 'destructive',
    });
  };
  
  const handleNameChange = () => {
    setUserName(name);
    toast({
      title: 'Name Updated',
      description: `Your name has been updated to ${name}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
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
            Manage your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex gap-2">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"/>
                <Button onClick={handleNameChange}>Save</Button>
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? 'No email associated'} disabled />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage your application data. Note: this currently only clears local data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Local Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  your data from the application's local storage. Cloud-synced data will not be affected.
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
