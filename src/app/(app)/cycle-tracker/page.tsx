'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockCycleInfo } from '@/lib/data';

export default function CycleTrackerPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const symptoms = ["Cramps", "Bloating", "Headache", "Mood Swings"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Menstrual Cycle Tracker</h1>
        <p className="text-muted-foreground">
          Monitor your cycle and understand your body better.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-center rounded-lg border bg-secondary p-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Cycle Day</p>
                <p className="text-6xl font-bold text-primary">
                  {mockCycleInfo.currentDay}
                </p>
              </div>
            </div>
            <div className="flex items-baseline justify-center rounded-lg border p-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Next Period Prediction</p>
                <p className="text-3xl font-bold">
                  {mockCycleInfo.nextPeriodIn} days
                </p>
                <p className="text-sm text-muted-foreground">
                  on {format(mockCycleInfo.predictedDate, 'MMM do')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Log Your Cycle</CardTitle>
            <CardDescription>
              Select the start and end dates of your period.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <Calendar
              mode="range"
              selected={{ from: new Date(new Date().setDate(new Date().getDate() - mockCycleInfo.currentDay)), to: new Date(new Date().setDate(new Date().getDate() - mockCycleInfo.currentDay + 4)) }}
              className="rounded-md border"
            />
             <Button className="mt-4">Log Period Dates</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Symptoms</CardTitle>
          <CardDescription>
            Select any symptoms you&apos;re experiencing today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom) => (
              <Badge key={symptom} variant="outline" className="text-lg p-2 cursor-pointer hover:bg-accent">
                {symptom}
              </Badge>
            ))}
          </div>
          <Button className="mt-4">Save Symptoms</Button>
        </CardContent>
      </Card>
    </div>
  );
}
