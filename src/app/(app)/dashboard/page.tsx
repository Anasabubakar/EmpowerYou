'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle2,
  Droplets,
  HeartHandshake,
  HeartPulse,
  ListTodo,
  TrendingUp,
  MessageCircleHeart,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/context/app-context';
import { HealthMetric } from '@/lib/types';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

function CompanionGreeting() {
  const { companionName } = useAppContext();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(`Good morning. I hope you have a gentle start. I'm here if you need anything at all.`);
    } else if (hour < 18) {
      setGreeting(`Hope your afternoon feels a little lighter. I'm thinking of you.`);
    } else {
      setGreeting(`Good evening. Let's slow things down together for a moment.`);
    }
  }, []);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card/70 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <MessageCircleHeart className="h-5 w-5" />
          </span>
          A Note from {companionName}
        </CardTitle>
        <CardDescription className="text-base">A soft check-in, just for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground italic leading-relaxed">&quot;{greeting}&quot;</p>
        <Link href="/companion">
          <Button size="lg" className="mt-5">
            Chat with your Companion
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { userName, goals, tasks, cycleInfo, healthMetrics, diaryEntries } = useAppContext();
  const [latestMetric, setLatestMetric] = useState<HealthMetric | null>(null);

  useEffect(() => {
    if (healthMetrics.length > 0) {
      setLatestMetric(healthMetrics[healthMetrics.length - 1]);
    }
  }, [healthMetrics]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  const moodEmojis = ['😭', '😟', '😐', '😊', '😁'];
  const energyEmojis = ['😴', '☕', '⚡️', '⚡️⚡️', '🚀'];

  const latestDiaryEntry = diaryEntries.length > 0 ? diaryEntries[diaryEntries.length - 1] : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
            <Sparkles className="h-4 w-4 text-primary" />
            {format(new Date(), 'EEEE, MMM d')}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
            Your sanctuary dashboard
          </span>
        </div>
        <h1 className="text-4xl font-headline font-semibold tracking-tight">
          Welcome back, {userName || 'friend'}.
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Here's a clear, calm snapshot of your day. Breathe, then choose the next gentle step.
        </p>
      </div>

      <CompanionGreeting />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Your Dreams &amp; Goals</CardTitle>
            <HeartHandshake className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{goals.length}</div>
            <p className="text-sm text-muted-foreground">Active goals in motion.</p>
            <Link href="/wants-needs">
              <Button size="sm" variant="outline" className="mt-4">
                View Goals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Your Daily Tasks</CardTitle>
            <ListTodo className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {completedTasks}/{totalTasks}
            </div>
            <p className="text-sm text-muted-foreground">
              {totalTasks > 0
                ? `${totalTasks - completedTasks} tasks remaining.`
                : 'No tasks for today. Rest is productive too.'}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} />
              <span className="text-sm font-medium">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Your Cycle</CardTitle>
            <Droplets className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              Day {cycleInfo.currentDay > 0 ? cycleInfo.currentDay : '-'}
            </div>
            <p className="text-sm text-muted-foreground">
              {cycleInfo.currentDay > 0
                ? `Next period in ${cycleInfo.nextPeriodIn} days.`
                : 'Log your period to see predictions.'}
            </p>
            <Link href="/cycle-tracker">
              <Button size="sm" variant="outline" className="mt-4">
                View Cycle
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Reflections</CardTitle>
            <CardDescription>
              What have you done today that your future self will thank you for?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestDiaryEntry ? (
              <>
                <p className="text-muted-foreground italic leading-relaxed">
                  &quot;{latestDiaryEntry.diaryEntry}&quot;
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>You shared your thoughts today.</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground italic">You haven't shared your thoughts yet today.</p>
            )}
            <Link href="/diary">
              <Button className="mt-4">
                {latestDiaryEntry ? "View Today's Entry" : 'Share Your Thoughts'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">How You're Feeling</CardTitle>
            <HeartPulse className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestMetric ? (
              <div className="flex items-baseline gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Mood</p>
                  <p className="text-3xl font-semibold">{moodEmojis[latestMetric.mood - 1]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Energy</p>
                  <p className="text-3xl font-semibold">{energyEmojis[latestMetric.energy - 1]}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-6 text-muted-foreground">
                <div>
                  <p className="text-xs">Mood</p>
                  <p className="text-3xl font-semibold">😶</p>
                </div>
                <div>
                  <p className="text-xs">Energy</p>
                  <p className="text-3xl font-semibold">🪫</p>
                </div>
              </div>
            )}
            <Link href="/health-metrics">
              <Button size="sm" variant="outline" className="mt-4">
                Log &amp; View
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-card/80 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Personalized Insights</CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-foreground max-w-xl">
            Let the AI gather your signals and reflect them back with clarity and kindness.
          </p>
          <Link href="/insights">
            <Button size="lg">
              Generate Report
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
