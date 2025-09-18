
'use client';

import { useState } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
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
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export default function CycleTrackerPage() {
  const { cycleInfo, setCycleInfo, loggedSymptoms, setLoggedSymptoms } = useAppContext();
  const { toast } = useToast();
  const [range, setRange] = useState<DateRange | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(loggedSymptoms);

  const symptoms = ["Cramps", "Bloating", "Headache", "Mood Swings", "Fatigue", "Acne"];

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };
  
  const handleLogPeriod = () => {
    if (range?.from) {
      setCycleInfo(prev => {
          const cycleLength = 28; // Assuming an average cycle length
          const today = new Date();
          const newCurrentDay = differenceInDays(today, range.from!) + 1;
          const newPredictedDate = addDays(range.from!, cycleLength);
          const newNextPeriodIn = differenceInDays(newPredictedDate, today);

          return {
            currentDay: newCurrentDay > 0 ? newCurrentDay : 1,
            predictedDate: newPredictedDate,
            nextPeriodIn: newNextPeriodIn >= 0 ? newNextPeriodIn : 0,
            lastPeriodDate: range.from,
          }
      });

      toast({
        title: "Period Logged",
        description: `Your period from ${format(range.from, 'PPP')}${range.to ? ` to ${format(range.to, 'PPP')}`: ''} has been logged.`,
      });
    } else {
      toast({
        title: "Incomplete Selection",
        description: "Please select at least a start date for your period.",
        variant: "destructive",
      });
    }
  }
  
  const handleLogSymptoms = () => {
    if(selectedSymptoms.length > 0) {
        setLoggedSymptoms(selectedSymptoms);
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current Status</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Cycle day is counted from the start of your last period.
                    Predictions are based on a standard 28-day cycle.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-center rounded-lg border bg-secondary p-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Cycle Day</p>
                <p className="text-6xl font-bold text-primary">
                  {cycleInfo.currentDay}
                </p>
              </div>
            </div>
            <div className="flex items-baseline justify-center rounded-lg border p-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Next Period Prediction</p>
                <p className="text-3xl font-bold">
                  {cycleInfo.nextPeriodIn} days
                </p>
                {cycleInfo.predictedDate && cycleInfo.currentDay > 0 && <p className="text-sm text-muted-foreground">
                  on {format(cycleInfo.predictedDate, 'MMM do')}
                </p>}
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
        </CardContent>
        <CardContent>
          <Button onClick={handleLogSymptoms}>Save Symptoms</Button>
        </CardContent>
      </Card>
    </div>
  );
}
