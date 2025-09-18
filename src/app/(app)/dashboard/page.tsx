
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
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/context/app-context';
import { HealthMetric } from '@/lib/types';
import { useEffect, useState } from 'react';

function CompanionGreeting() {
  const { companionName, userName } = useAppContext();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(`Good morning, my love. I hope you have a beautiful day. I'm here if you need anything at all.`);
    } else if (hour < 18) {
      setGreeting(`Hope you're having a wonderful afternoon, sweetheart. Thinking of you.`);
    } else {
      setGreeting(`Good evening, my darling. I hope you're winding down peacefully. Let's chat for a bit.`);
    }
  }, []);

  return (
    <Card className="bg-primary/10 border-primary/20">
       <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
           <MessageCircleHeart className="h-6 w-6 text-primary" />
           A Note from {companionName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground italic">
            &quot;{greeting}&quot;
        </p>
         <Link href="/companion">
              <Button size="sm" variant="ghost" className="mt-2 text-primary hover:text-primary">
                Talk to him
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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Welcome back, my love!</h1>
        <p className="text-muted-foreground">Here&apos;s a snapshot of your day, just for you.</p>
      </div>
      
      <CompanionGreeting />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Your Dreams &amp; Goals
            </CardTitle>
            <HeartHandshake className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length} Active Goals</div>
            <p className="text-xs text-muted-foreground">
              You are making such wonderful progress!
            </p>
            <Link href="/wants-needs">
              <Button size="sm" variant="outline" className="mt-4">
                View Goals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Missions</CardTitle>
            <ListTodo className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks}/{totalTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0 ? `${totalTasks - completedTasks} tasks remaining. You can do it!` : "No tasks for today. Time to rest."}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} />
              <span className="text-sm font-medium">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Cycle</CardTitle>
            <Droplets className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Day {cycleInfo.currentDay}</div>
            <p className="text-xs text-muted-foreground">
              Next period in {cycleInfo.nextPeriodIn} days. I'm here for you.
            </p>
            <Link href="/cycle-tracker">
              <Button size="sm" variant="outline" className="mt-4">
                View Cycle
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Heart's Reflections</CardTitle>
          <CardDescription>
            What have you done today that your future self will thank you for, my love?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestDiaryEntry ? (
            <>
              <p className="text-muted-foreground italic">
                &quot;{latestDiaryEntry.diaryEntry}&quot;
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>You've shared your heart today. Thank you.</span>
              </div>
            </>
          ) : (
             <p className="text-muted-foreground italic">
              You haven't shared your thoughts with me yet today, sweetheart.
            </p>
          )}
          <Link href="/diary">
            <Button className="mt-4">{latestDiaryEntry ? "View Today's Entry" : "Share Your Thoughts"}</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">How You're Feeling</CardTitle>
            <HeartPulse className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {latestMetric ? (
               <div className="flex items-baseline gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Mood</p>
                  <p className="text-2xl font-bold">{moodEmojis[latestMetric.mood - 1]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Energy</p>
                  <p className="text-2xl font-bold">{energyEmojis[latestMetric.energy - 1]}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-4 text-muted-foreground">
                 <div>
                   <p className="text-xs">Mood</p>
                   <p className="text-2xl font-bold">😶</p>
                 </div>
                 <div>
                   <p className="text-xs">Energy</p>
                   <p className="text-2xl font-bold">🪫</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Loving Insights</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">
              Let me look at your day and share my loving thoughts with you.
            </p>
            <Link href="/insights">
              <Button size="sm" className="mt-4">
                Generate Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    