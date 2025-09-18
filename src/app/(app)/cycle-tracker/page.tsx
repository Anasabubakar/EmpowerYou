
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
  CardFooter,
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
import { suggestSymptomRelief } from '@/ai/flows/suggest-symptom-relief';
import { predictNextCycles } from '@/ai/flows/predict-next-cycles';
import { Loader2, Sparkles } from 'lucide-react';

export default function CycleTrackerPage() {
  const { cycleInfo, setCycleInfo, loggedSymptoms, setLoggedSymptoms } = useAppContext();
  const { toast } = useToast();
  const [range, setRange] = useState<DateRange | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(loggedSymptoms);

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [aiPredictions, setAiPredictions] = useState<string[]>([]);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);

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
        nextPeriodIn: newNextPeriodIn > 0 ? newNextPeriodIn : 0,
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
    if(selectedSymptoms.length > 0) {
        setLoggedSymptoms(selectedSymptoms);
        toast({
            title: "Symptoms Logged",
            description: `Logged symptoms: ${selectedSymptoms.join(', ')}`,
        });

        setLoadingSuggestions(true);
        setIsSuggestionOpen(true);
        try {
          const result = await suggestSymptomRelief(selectedSymptoms);
          setAiSuggestions(result.suggestions);
        } catch (error) {
          console.error("Failed to get suggestions", error);
          setAiSuggestions("Could not load suggestions at this time.");
        } finally {
          setLoadingSuggestions(false);
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
        title: "No Period Date",
        description: "Please log your last period date first.",
        variant: "destructive",
      });
      return;
    }
    setLoadingPredictions(true);
    setIsPredictionOpen(true);
    try {
      const result = await predictNextCycles({lastPeriodDate: cycleInfo.lastPeriodDate.toISOString()});
      setAiPredictions(result.predictedDates);
    } catch (error) {
      console.error("Failed to get predictions", error);
      setAiPredictions([]);
    } finally {
      setLoadingPredictions(false);
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
          <CardFooter>
            <Button className="w-full" onClick={handlePredictCycles}>
              <Sparkles className="mr-2 h-4 w-4" />
              Predict Future Cycles
            </Button>
          </CardFooter>
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
          <Button className="mt-4" onClick={handleLogSymptoms}>Save Symptoms & Get Advice</Button>
        </CardContent>
      </Card>
      
      {/* AI Suggestions Dialog */}
      <Dialog open={isSuggestionOpen} onOpenChange={setIsSuggestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI-Powered Suggestions</DialogTitle>
            <DialogDescription>
              Based on your logged symptoms, here are some gentle, non-medical suggestions for relief.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingSuggestions ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <p>Generating suggestions...</p>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{aiSuggestions}</p>
            )}
          </div>
          <DialogFooter>
             <Button onClick={() => setIsSuggestionOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Predictions Dialog */}
      <Dialog open={isPredictionOpen} onOpenChange={setIsPredictionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Future Cycle Predictions</DialogTitle>
            <DialogDescription>
              Here are the AI-predicted start dates for your next few cycles.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingPredictions ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <p>Calculating predictions...</p>
              </div>
            ) : (
              <ul className="space-y-2 list-disc list-inside">
                {aiPredictions.map((date, index) => <li key={index}>{date}</li>)}
              </ul>
            )}
          </div>
          <DialogFooter>
             <Button onClick={() => setIsPredictionOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
