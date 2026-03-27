'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/theme-context';
import { Moon, Sun, Trash2, Loader2, LogOut, Sparkles } from 'lucide-react';
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
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { auth } from '@/lib/firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { cn } from '@/lib/utils';

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const { palette, mode, setPalette, setMode } = useTheme();
  const { companionName, setCompanionName, user } = useAppContext();
  const [cName, setCName] = useState(companionName);
  const [loading, setLoading] = useState(false);

  const themeOptions = [
    {
      value: 'classic',
      label: 'Classic',
      description: 'Soft daylight',
      swatches: ['hsl(7 70% 63%)', 'hsl(35 67% 84%)', 'hsl(181 63% 34%)'],
    },
    {
      value: 'blush',
      label: 'Blush (Women)',
      description: 'Warm, feminine',
      swatches: ['hsl(342 72% 56%)', 'hsl(10 55% 90%)', 'hsl(200 70% 45%)'],
    },
    {
      value: 'emerald',
      label: 'Green',
      description: 'Fresh, grounded',
      swatches: ['hsl(152 60% 35%)', 'hsl(85 40% 88%)', 'hsl(190 60% 40%)'],
    },
    {
      value: 'ocean',
      label: 'Ocean',
      description: 'Calm clarity',
      swatches: ['hsl(210 80% 45%)', 'hsl(190 50% 88%)', 'hsl(35 80% 55%)'],
    },
    {
      value: 'amber',
      label: 'Amber',
      description: 'Golden energy',
      swatches: ['hsl(28 90% 52%)', 'hsl(55 65% 86%)', 'hsl(205 70% 45%)'],
    },
    {
      value: 'slate',
      label: 'Slate',
      description: 'Cool, modern calm',
      swatches: ['hsl(220 45% 52%)', 'hsl(220 20% 88%)', 'hsl(190 60% 42%)'],
    },
  ] as const;

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleClearData = () => {
    localStorage.removeItem('theme');
    localStorage.removeItem('themePalette');
    localStorage.removeItem('themeMode');
    localStorage.removeItem('companionName');

    toast({
      title: 'Local Settings Cleared',
      description: 'Your local device settings have been cleared.',
      variant: 'destructive',
    });
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleCompanionNameChange = () => {
    setCompanionName(cName);
    toast({
      title: 'Companion Name Updated',
      description: `Your companion's name is now ${cName}.`,
    });
  };

  const handleChangePassword: SubmitHandler<PasswordFormValues> = async (data) => {
    setLoading(true);
    if (!user || !user.email) {
      toast({ title: 'Error', description: 'Not logged in.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, data.currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, data.newPassword);
      toast({ title: 'Success', description: 'Your password has been updated.' });
      form.reset();
    } catch (error: any) {
      toast({
        title: 'Error Changing Password',
        description: 'Could not update your password. Please check your current password and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Preferences
        </div>
        <h1 className="text-4xl font-headline font-semibold">Preferences</h1>
        <p className="text-muted-foreground max-w-xl">
          Shape your experience. Keep it personal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your personal information. Your name and email are managed via your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companion-name">Companion's Name</Label>
            <div className="flex gap-2">
              <Input id="companion-name" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g., Sage"/>
              <Button onClick={handleCompanionNameChange}>Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password here.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleChangePassword)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Theme &amp; Mode</Label>
              <p className="text-sm text-muted-foreground">Pick a palette, then choose light or dark.</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sun className="h-5 w-5" />
              <Moon className="h-5 w-5" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('light')}
              className={cn(
                'group rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition hover:border-primary/40',
                mode === 'light' && 'border-primary/60 ring-2 ring-primary/20'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Light Mode</p>
                  <p className="text-xs text-muted-foreground">Brighter backgrounds</p>
                </div>
                <Sun className="h-5 w-5 text-primary" />
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode('dark')}
              className={cn(
                'group rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition hover:border-primary/40',
                mode === 'dark' && 'border-primary/60 ring-2 ring-primary/20'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Low-glow focus</p>
                </div>
                <Moon className="h-5 w-5 text-primary" />
              </div>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPalette(option.value)}
                className={cn(
                  'group rounded-2xl border border-border/60 bg-background/70 p-4 text-left transition hover:border-primary/40',
                  palette === option.value && 'border-primary/60 ring-2 ring-primary/20'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="flex gap-1">
                    {option.swatches.map((swatch) => (
                      <span
                        key={swatch}
                        className="h-4 w-4 rounded-full ring-1 ring-border/60"
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Local Settings
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear settings like theme preference from this browser. Your account data in the cloud will not be affected.
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

          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Signing out will end your current session. You can always sign back in.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
