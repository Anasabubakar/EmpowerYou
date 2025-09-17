'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CycleTrackerPage() {
  const { toast } = useToast();
  const [range, setRange] = useState<DateRange | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
  const symptoms = ["Cramps", "Bloating", "Headache", "Mood Swings", "Fatigue", "Acne"];

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };
  
  const handleLogPeriod = () => {
    if (range?.from && range?.to) {
       toast({
        title: "Period Logged",
        description: `Your period from ${format(range.from, 'PPP')} to ${format(range.to, 'PPP')} has been logged.`,
      });
    } else {
       toast({
        title: "Incomplete Selection",
        description: "Please select a start and end date for your period.",
        variant: "destructive",
      });
    }
  }
  
  const handleLogSymptoms = () => {
    if(selectedSymptoms.length > 0) {
        toast({
            title: "Symptoms Logged",
            description: `Logged symptoms: ${selectedSymptoms.join(', ')}`,
        });
    } else {
        toast({
            title: "No Symptoms Selected",
            description: "Please select at least one symptom to log.",
            variant: "destructive",
        });
    }
  }

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
              selected={range}
              onSelect={setRange}
              className="rounded-md border"
            />
             <Button className="mt-4" onClick={handleLogPeriod}>Log Period Dates</Button>
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
              <Badge 
                key={symptom} 
                variant={selectedSymptoms.includes(symptom) ? 'default' : 'outline'}
                onClick={() => handleSymptomToggle(symptom)}
                className={cn("text-lg p-2 cursor-pointer transition-colors", {
                  "bg-primary text-primary-foreground": selectedSymptoms.includes(symptom),
                  "hover:bg-accent": !selectedSymptoms.includes(symptom)
                })}>
                {symptom}
              </Badge>
            ))}
          </div>
          <Button className="mt-4" onClick={handleLogSymptoms}>Save Symptoms</Button>
        </CardContent>
      </Card>
    </div>
  );
}
