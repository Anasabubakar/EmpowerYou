
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AppProvider, useAppContext } from '@/context/app-context';
import { ArrowRight, LogIn } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import type { Task, Goal } from '@/lib/types';
import { addDays, differenceInDays } from 'date-fns';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

function OnboardingContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    user,
    setOnboarded, 
    setGoals, 
    setTasks: setTasksContext, 
    setCycleInfo 
  } = useAppContext();

  const [wants, setWants] = useState('');
  const [needs, setNeeds] = useState('');
  const [tasks, setTasksState] = useState('');
  const [cycleDate, setCycleDate] = useState<Date | undefined>(new Date());

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: 'Sign In Failed',
        description: 'Could not sign you in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleContinue = () => {
    if (!user) {
      toast({
        title: 'Not Signed In',
        description: 'Please sign in with Google to continue.',
        variant: 'destructive',
      });
      return;
    }

    const wantsArray: Goal[] = wants.split('\n').filter(t => t.trim() !== '').map((text, i) => ({
        id: `g_want_${Date.now()}_${i}`,
        title: text.trim(),
        category: 'want',
        progress: 0,
        deadline: new Date(new Date().setDate(new Date().getDate() + 30)),
        description: '',
        createdAt: new Date().toISOString(),
    }));

    const needsArray: Goal[] = needs.split('\n').filter(t => t.trim() !== '').map((text, i) => ({
        id: `g_need_${Date.now()}_${i}`,
        title: text.trim(),
        category: 'need',
        progress: 0,
        deadline: new Date(new Date().setDate(new Date().getDate() + 30)),
        description: '',
        createdAt: new Date().toISOString(),
    }));

    setGoals([...wantsArray, ...needsArray]);
    
    const tasksArray: Task[] = tasks.split('\n').filter(t => t.trim() !== '').map((text, i) => ({
        id: `t_${Date.now()}_${i}`,
        text: text.trim(),
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
    }));

    setTasksContext(tasksArray);

    if (cycleDate) {
      const cycleLength = 28;
      const today = new Date();
      const newCurrentDay = differenceInDays(today, cycleDate) + 1;
      const newPredictedDate = addDays(cycleDate, cycleLength);
      const newNextPeriodIn = differenceInDays(newPredictedDate, today);

      setCycleInfo({
        currentDay: newCurrentDay > 0 ? newCurrentDay : 1,
        predictedDate: newPredictedDate,
        nextPeriodIn: newNextPeriodIn > 0 ? newNextPeriodIn : 0,
        lastPeriodDate: cycleDate
      });
    }

    if (setOnboarded) setOnboarded(true);

    toast({
      title: `Welcome, ${user.displayName}!`,
      description: "You're all set up and ready to go.",
    });

    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <AppLogo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to EmpowerYou
          </h1>
          <p className="text-sm text-muted-foreground">
            A safe space for your thoughts, dreams, and well-being.
          </p>
        </div>

        {!user ? (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Let's Get Started</CardTitle>
                    <CardDescription>Sign in with your Google account to create your secure and personal space.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={handleSignIn} size="lg">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        ) : (
            <Card>
            <CardHeader>
                <CardTitle>Welcome, {user.displayName}!</CardTitle>
                <CardDescription>
                This information will help personalize your experience. You can skip any step.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="wants">What are some things you want to achieve?</Label>
                    <Textarea
                        id="wants"
                        placeholder="e.g., Learn a new skill (one per line)"
                        value={wants}
                        onChange={(e) => setWants(e.target.value)}
                        rows={3}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="needs">What are your essential needs or goals?</Label>
                    <Textarea
                        id="needs"
                        placeholder="e.g., Improve sleep quality (one per line)"
                        value={needs}
                        onChange={(e) => setNeeds(e.target.value)}
                        rows={3}
                    />
                </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="tasks">What are some tasks you need to do?</Label>
                <Textarea
                    id="tasks"
                    placeholder="e.g., Finish project proposal (one per line)"
                    value={tasks}
                    onChange={(e) => setTasksState(e.target.value)}
                    rows={3}
                />
                </div>
                
                <div className="space-y-4 flex flex-col items-center">
                    <Label>When did your last menstrual cycle start? (Optional)</Label>
                    <Calendar
                        mode="single"
                        selected={cycleDate}
                        onSelect={setCycleDate}
                        className="rounded-md border"
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    />
                </div>

            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleContinue}>
                Continue to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
            </Card>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AppProvider>
      <OnboardingContent />
    </AppProvider>
  );
}
