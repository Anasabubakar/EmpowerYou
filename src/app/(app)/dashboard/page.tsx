
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
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/context/app-context';
import { HealthMetric } from '@/lib/types';
import { useEffect, useState } from 'react';

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
        <h1 className="text-3xl font-headline font-bold">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">Here&apos;s a snapshot of your day.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Wants &amp; Needs Progress
            </CardTitle>
            <HeartHandshake className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length} Active Goals</div>
            <p className="text-xs text-muted-foreground">
              You are making great progress!
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
            <CardTitle className="text-sm font-medium">Tasks for Today</CardTitle>
            <ListTodo className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks}/{totalTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0 ? `${totalTasks - completedTasks} tasks remaining` : "No tasks for today."}
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
            <CardTitle className="text-sm font-medium">Menstrual Cycle</CardTitle>
            <Droplets className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Day {cycleInfo.currentDay}</div>
            <p className="text-xs text-muted-foreground">
              Next period in {cycleInfo.nextPeriodIn} days
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
          <CardTitle>Reflection for Today</CardTitle>
          <CardDescription>
            What have you done today that your future self will thank you for?
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
                <span>Daily diary and reflection completed.</span>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground italic">
              You have not submitted anything here yet.
            </p>
          )}
          <Link href="/diary">
            <Button className="mt-4">{latestDiaryEntry ? "View Today's Entry" : "Add Today's Entry"}</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Health Metrics</CardTitle>
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
            <CardTitle className="text-sm font-medium">Personalized Insights</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">
              Unlock trends and advice by generating your first AI-powered report.
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
