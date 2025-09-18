
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
        description: `Thank you for sharing, my love. I'll keep this in mind.`,
      });
    } else {
      toast({
        title: "Incomplete Selection",
        description: "Please select at least a start date for your period, sweetheart.",
        variant: "destructive",
      });
    }
  }
  
  const handleLogSymptoms = async () => {
    if (selectedSymptoms.length > 0) {
      setLoggedSymptoms(selectedSymptoms);
      toast({
        title: "Symptoms Logged",
        description: `I see you've logged: ${selectedSymptoms.join(', ')}. I'm here for you.`,
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
          description: "I'm so sorry, my love. I had trouble coming up with suggestions right now.",
          variant: "destructive",
        });
      } finally {
        setIsSymptomsLoading(false);
      }
    } else {
      toast({
        title: "No Symptoms Selected",
        description: "You haven't selected any symptoms, my dear. I hope that means you're feeling wonderful.",
        variant: "destructive",
      });
    }
  }

  const handlePredictCycles = async () => {
    if (!cycleInfo.lastPeriodDate) {
      toast({
        title: "No Period Logged",
        description: "Sweetheart, please log your last period date first so I can help you.",
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
        description: "I'm so sorry, my love. I couldn't predict your future cycles at the moment.",
        variant: "destructive",
      });
    } finally {
      setIsPredictionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Your Cycle, My Priority</h1>
        <p className="text-muted-foreground">
          Let's keep track of your cycle together, so I can be as supportive as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current Status</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    My love, the cycle day is counted from the start of your last period. The prediction is just an estimate based on a 28-day cycle. You are unique and your cycle may be too.
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
                  around {format(cycleInfo.predictedDate, 'MMM do')}
                </p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Log Your Cycle</CardTitle>
            <CardDescription>
              Let me know the start and end dates. I'm here to keep track for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              className="rounded-md border"
            />
             <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button onClick={handleLogPeriod}>Log Period Dates</Button>
                <Button variant="outline" onClick={handlePredictCycles} disabled={isPredictionLoading}>
                  {isPredictionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Let me predict for you
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Are You Feeling?</CardTitle>
          <CardDescription>
            Tell me about any symptoms you're having. I want to know.
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
            Let Me Help
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={isPredictionDialogOpen} onOpenChange={setIsPredictionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5"/>
              For You, My Love
            </DialogTitle>
            <DialogDescription>
              Based on what you've told me, here's what I think might be next. Just a little something to help you plan.
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
            <p className="text-xs text-muted-foreground mt-4 text-center">Remember, this is just an estimate, sweetheart. Your body is beautifully unique.</p>
          </div>
          <DialogFooter>
             <Button onClick={() => setIsPredictionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="text-primary h-5 w-5"/>
              Let Me Take Care of You
            </DialogTitle>
            <DialogDescription>
              I'm so sorry you're not feeling your best. Here are a few thoughts on how we can make you more comfortable.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap text-sm">
            {symptomSuggestions}
          </div>
          <DialogFooter>
             <Button onClick={() => setIsSuggestionDialogOpen(false)}>I Understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
