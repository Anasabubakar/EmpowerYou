
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
import { ArrowRight } from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { setUserName, setOnboarded } = useAppContext();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim().length < 2) {
      toast({
        title: 'Invalid Name',
        description: 'Please enter a name with at least 2 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (setUserName) setUserName(name);
    if (setOnboarded) setOnboarded(true);

    toast({
      title: `Welcome, ${name}!`,
      description: "You're all set up and ready to go.",
    });

    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <AppLogo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to EmpowerYou
          </h1>
          <p className="text-sm text-muted-foreground">
            Let's get you started. What should we call you?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Name</CardTitle>
            <CardDescription>
              This is how we'll greet you in the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="name" className="sr-only">
                Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleContinue}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
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
