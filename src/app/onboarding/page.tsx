'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboarded, userName, setUserName } = useAppContext();
  const [name, setName] = useState(userName);
  const { toast } = useToast();

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name.trim());
      setOnboarded(true);
      toast({
        title: `Welcome, ${name.trim()}!`,
        description: "You're all set up and ready to go.",
      });
      router.push('/dashboard');
    } else {
      toast({
        title: 'Please enter your name',
        description: 'I would love to know what to call you.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle>What should I call you?</CardTitle>
            <CardDescription>
              This is the name I&apos;ll use to address you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
              autoFocus
              className="text-base"
            />
            <Button className="w-full" onClick={handleContinue}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
