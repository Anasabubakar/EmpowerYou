
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Loader2, Sparkles, Bot } from 'lucide-react';
import { predictNextCycles } from '@/ai/flows/predict-next-cycles';
import { suggestSymptomRelief } from '@/ai/flows/suggest-symptom-relief';

export default function CycleTrackerPage() {
  const { cycleInfo, setCycleInfo, loggedSymptoms, setLoggedSymptoms } = useAppContext();
  const { toast } = useToast();
  const [range, setRange] = useState<DateRange | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(loggedSymptoms);
  
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [isSymptomsLoading, setIsSymptomsLoading] = useState(false);
  const [predictedDates, setPredictedDates] = useState<string[]>([]);
  const [symptomSuggestions, setSymptomSuggestions] = useState('');
  
  const [isPredictionDialogOpen, setIsPredictionDialogOpen] = useState(false);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);

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
      const cycleLength = 28; // Assuming an average cycle length
      const today = new Date();
      const newCurrentDay = differenceInDays(today, range.from) + 1;
      const newPredictedDate = addDays(range.from, cycleLength);
      const newNextPeriodIn = differenceInDays(newPredictedDate, today);

      setCycleInfo({
        currentDay: newCurrentDay > 0 ? newCurrentDay : 1,
        predictedDate: newPredictedDate,
        nextPeriodIn: newNextPeriodIn >= 0 ? newNextPeriodIn : 0,
        lastPeriodDate: range.from,
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
  
  const handleLogSymptoms = async () => {
    if (selectedSymptoms.length > 0) {
      setLoggedSymptoms(selectedSymptoms);
      toast({
        title: "Symptoms Logged",
        description: `Logged symptoms: ${selectedSymptoms.join(', ')}`,
      });
      
      setIsSymptomsLoading(true);
      try {
        const result = await suggestSymptomRelief(selectedSymptoms);
        setSymptomSuggestions(result.suggestions);
        setIsSuggestionDialogOpen(true);
      } catch (error) {
        console.error(error);
        toast({
          title: "AI Error",
          description: "Could not get symptom suggestions.",
          variant: "destructive",
        });
      } finally {
        setIsSymptomsLoading(false);
      }
    } else {
      toast({
        title: "No Symptoms Selected",
        description: "Please select at least one symptom to log.",
        variant: "destructive",
      });
    }
  }

  const handlePredictCycles = async () => {
    if (!cycleInfo.lastPeriodDate) {
      toast({
        title: "No Period Logged",
        description: "Please log your last period date first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsPredictionLoading(true);
    try {
      const result = await predictNextCycles({ lastPeriodDate: cycleInfo.lastPeriodDate.toISOString() });
      setPredictedDates(result.predictedDates);
      setIsPredictionDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Error",
        description: "Could not predict future cycles.",
        variant: "destructive",
      });
    } finally {
      setIsPredictionLoading(false);
    }
  };

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
             <div className="flex gap-2 mt-4">
                <Button onClick={handleLogPeriod}>Log Period Dates</Button>
                <Button variant="outline" onClick={handlePredictCycles} disabled={isPredictionLoading}>
                  {isPredictionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Predict Future Cycles
                </Button>
             </div>
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
          <Button onClick={handleLogSymptoms} disabled={isSymptomsLoading}>
            {isSymptomsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            Save & Get AI Advice
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={isPredictionDialogOpen} onOpenChange={setIsPredictionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI-Powered Cycle Prediction</DialogTitle>
            <DialogDescription>
              Based on your last cycle, here are the predicted start dates for your next three periods.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="space-y-2">
              {predictedDates.map((date, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">Prediction {index + 1}:</span>
                  <span>{date}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-4 text-center">This is an estimate. Your actual cycle may vary.</p>
          </div>
          <DialogFooter>
             <Button onClick={() => setIsPredictionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI-Powered Symptom Relief</DialogTitle>
            <DialogDescription>
              Here are some gentle, non-medical suggestions for your symptoms.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap text-sm">
            {symptomSuggestions}
          </div>
          <DialogFooter>
             <Button onClick={() => setIsSuggestionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
