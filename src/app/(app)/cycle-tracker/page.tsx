'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, differenceInDays, addDays, isValid } from 'date-fns';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  CalendarPlus,
  Loader2,
  Sparkles,
  Bot,
  Droplets,
  ArrowRight,
  ChevronDown,
  Activity,
  Thermometer,
  Zap,
  Brain,
  Frown,
  SmilePlus,
  RefreshCw,
  TrendingUp,
  X,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { predictNextCycles } from '@/ai/flows/predict-next-cycles';
import { suggestSymptomRelief } from '@/ai/flows/suggest-symptom-relief';

const CYCLE_LENGTH = 28;

const SYMPTOMS = [
  { name: 'Cramps', icon: Zap, color: 'text-orange-500' },
  { name: 'Bloating', icon: Activity, color: 'text-blue-500' },
  { name: 'Headache', icon: Brain, color: 'text-purple-500' },
  { name: 'Mood Swings', icon: Frown, color: 'text-pink-500' },
  { name: 'Fatigue', icon: Thermometer, color: 'text-amber-500' },
  { name: 'Acne', icon: SmilePlus, color: 'text-red-500' },
];

function CycleRing({ currentDay, totalDays }: { currentDay: number; totalDays: number }) {
  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(currentDay / totalDays, 1);
  const strokeDashoffset = circumference - progress * circumference;

  const phaseLabel = currentDay <= 5
    ? 'Menstrual'
    : currentDay <= 13
      ? 'Follicular'
      : currentDay <= 16
        ? 'Ovulation'
        : 'Luteal';

  const phaseColor = currentDay <= 5
    ? 'hsl(var(--destructive))'
    : currentDay <= 13
      ? 'hsl(var(--primary))'
      : currentDay <= 16
        ? 'hsl(var(--accent))'
        : 'hsl(var(--secondary-foreground))';

  return (
    <div className="relative flex items-center justify-center" role="img" aria-label={`Cycle day ${currentDay} of ${totalDays}, currently in the ${phaseLabel} phase`}>
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={phaseColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-4xl font-bold tabular-nums" style={{ color: phaseColor }}>
          {currentDay}
        </span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Day of {totalDays}
        </span>
        <span
          className="mt-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${phaseColor}20`, color: phaseColor }}
        >
          {phaseLabel}
        </span>
      </div>
    </div>
  );
}

export default function CycleTrackerPage() {
  const { cycleInfo, setCycleInfo, loggedSymptoms, setLoggedSymptoms } = useAppContext();
  const { toast } = useToast();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(loggedSymptoms);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [isSymptomsLoading, setIsSymptomsLoading] = useState(false);
  const [predictedDates, setPredictedDates] = useState<string[]>([]);
  const [symptomSuggestions, setSymptomSuggestions] = useState('');
  const [isPredictionDialogOpen, setIsPredictionDialogOpen] = useState(false);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [logStep, setLogStep] = useState<'start' | 'end'>('start');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const resetLogFlow = () => {
    setLogStep('start');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const hasLoggedPeriod = cycleInfo.currentDay > 0;

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    setSelectedSymptoms(loggedSymptoms);
  }, [loggedSymptoms]);

  const safePredictedDate = useMemo(() => {
    if (!cycleInfo.predictedDate) return new Date();
    return cycleInfo.predictedDate instanceof Date && isValid(cycleInfo.predictedDate)
      ? cycleInfo.predictedDate
      : new Date(cycleInfo.predictedDate);
  }, [cycleInfo.predictedDate]);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleLogPeriod = () => {
    if (startDate && endDate) {
      const newCurrentDay = differenceInDays(currentDate, startDate) + 1;
      const newPredictedDate = addDays(startDate, CYCLE_LENGTH);
      const newNextPeriodIn = differenceInDays(newPredictedDate, currentDate);

      setCycleInfo({
        currentDay: newCurrentDay > 0 ? newCurrentDay : 1,
        predictedDate: newPredictedDate,
        nextPeriodIn: newNextPeriodIn >= 0 ? newNextPeriodIn : 0,
        lastPeriodDate: startDate,
        lastPeriodEndDate: endDate,
      });

      setIsLogSheetOpen(false);
      resetLogFlow();
      toast({
        title: 'Period logged',
        description: `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`,
      });
    } else {
      toast({
        title: 'Select both dates',
        description: 'Pick a start and end date for your period.',
        variant: 'destructive',
      });
    }
  };

  const handleLogSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: 'No symptoms selected',
        description: 'Select at least one symptom to get suggestions.',
        variant: 'destructive',
      });
      return;
    }

    setLoggedSymptoms(selectedSymptoms);
    toast({
      title: 'Symptoms logged',
      description: `Saved: ${selectedSymptoms.join(', ')}.`,
    });

    setIsSymptomsLoading(true);
    try {
      const result = await suggestSymptomRelief(selectedSymptoms);
      setSymptomSuggestions(result.suggestions);
      setIsSuggestionDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Could not get suggestions',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSymptomsLoading(false);
    }
  };

  const handlePredictCycles = async () => {
    if (!cycleInfo.lastPeriodDate) {
      toast({
        title: 'Log your period first',
        description: 'We need your last period date to predict future cycles.',
        variant: 'destructive',
      });
      return;
    }

    setIsPredictionLoading(true);
    try {
      const result = await predictNextCycles({
        lastPeriodDate: cycleInfo.lastPeriodDate.toISOString(),
      });
      setPredictedDates(result.predictedDates);
      setIsPredictionDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Prediction unavailable',
        description: 'Could not predict cycles right now. Try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsPredictionLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Droplets className="h-3 w-3 text-primary" />
          Rhythm
        </div>
        <h1 className="text-3xl font-headline font-semibold">Cycle Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Track your cycle, log symptoms, and understand your body better.
        </p>
      </div>

      {/* Empty state: no period logged yet */}
      {!hasLoggedPeriod && (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/[0.03]">
          <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5">
                <CalendarPlus className="h-10 w-10 text-primary" aria-hidden="true" />
              </div>
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-bounce">
                1
              </span>
            </div>

            <div className="space-y-2 max-w-sm">
              <h2 className="text-xl font-semibold">Log your period to get started</h2>
              <p className="text-sm text-muted-foreground">
                Pick your period start and end dates. We&rsquo;ll track your cycle day and predict what&rsquo;s next.
              </p>
            </div>

            <Button
              size="lg"
              className="gap-2 text-base font-semibold px-8 py-6 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
              onClick={() => { resetLogFlow(); setIsLogSheetOpen(true); }}
              aria-label="Open calendar to log your period start and end dates"
            >
              <CalendarPlus className="h-5 w-5" />
              Log Period Dates
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ChevronDown className="h-3 w-3 animate-bounce" />
              <span>Tap the button or scroll down to use the calendar</span>
              <ChevronDown className="h-3 w-3 animate-bounce" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active state: period has been logged */}
      {hasLoggedPeriod && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Cycle ring */}
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <CycleRing currentDay={cycleInfo.currentDay} totalDays={CYCLE_LENGTH} />

              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  Next period in{' '}
                  <span className="font-semibold text-foreground">{cycleInfo.nextPeriodIn} days</span>
                </p>
                {isValid(safePredictedDate) && (
                  <p className="text-xs text-muted-foreground">
                    Expected around {format(safePredictedDate, 'MMMM d')}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={() => { resetLogFlow(); setIsLogSheetOpen(true); }}
                aria-label="Update your period start and end dates"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Update Period Date
              </Button>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="flex flex-col gap-4">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cycle Predictions</CardTitle>
                <CardDescription className="text-xs">
                  See estimated dates for your next cycles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-xl"
                  onClick={handlePredictCycles}
                  disabled={isPredictionLoading}
                  aria-label="Generate AI predictions for next cycles"
                >
                  {isPredictionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  Predict Next Cycles
                </Button>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Last Logged</CardTitle>
                <CardDescription className="text-xs">
                  {cycleInfo.lastPeriodDate
                    ? (() => {
                        const start = cycleInfo.lastPeriodDate instanceof Date
                          ? cycleInfo.lastPeriodDate
                          : new Date(cycleInfo.lastPeriodDate);
                        const end = cycleInfo.lastPeriodEndDate
                          ? (cycleInfo.lastPeriodEndDate instanceof Date
                              ? cycleInfo.lastPeriodEndDate
                              : new Date(cycleInfo.lastPeriodEndDate))
                          : null;
                        return end
                          ? `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
                          : format(start, 'MMMM d, yyyy');
                      })()
                    : 'No date recorded'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Based on a {CYCLE_LENGTH}-day cycle average.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Calendar always visible for quick access */}
      {!hasLoggedPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarPlus className="h-4 w-4 text-primary" aria-hidden="true" />
              Quick Log
            </CardTitle>
            <CardDescription>
              Pick your period start and end dates directly here:
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* Step indicators */}
            <div className="flex items-center gap-3 w-full max-w-xs" aria-label="Logging progress">
              <div className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                logStep === 'start'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/10 text-primary'
              )}>
                {logStep === 'start' ? <span className="h-4 w-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">1</span> : <Check className="h-3.5 w-3.5" />}
                Start Date
              </div>
              <div className="h-px flex-1 bg-border" />
              <div className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                logStep === 'end'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}>
                <span className="h-4 w-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">2</span>
                End Date
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {logStep === 'start'
                ? 'When did your last period start?'
                : 'When did it end?'
              }
            </p>

            <Calendar
              mode="single"
              selected={logStep === 'start' ? startDate : endDate}
              onSelect={(date) => {
                if (!date) return;
                if (logStep === 'start') {
                  setStartDate(date);
                  setLogStep('end');
                } else {
                  if (date >= startDate!) {
                    setEndDate(date);
                  }
                }
              }}
              className="rounded-2xl border"
              aria-label={logStep === 'start' ? 'Select your last period start date' : 'Select your last period end date'}
            />

            {(startDate || endDate) && (
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                {startDate && (
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
                    <span className="text-primary">Start:</span>
                    {format(startDate, 'MMM d, yyyy')}
                    {logStep === 'end' && (
                      <button
                        onClick={() => { setStartDate(undefined); setLogStep('start'); }}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        aria-label="Change start date"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                )}
                {endDate && (
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
                    <span className="text-primary">End:</span>
                    {format(endDate, 'MMM d, yyyy')}
                    <button
                      onClick={() => setEndDate(undefined)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      aria-label="Change end date"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2 w-full max-w-xs">
              {logStep === 'end' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl gap-1.5"
                  onClick={() => { setLogStep('start'); setStartDate(undefined); setEndDate(undefined); }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                className="flex-1 rounded-xl gap-1.5"
                onClick={handleLogPeriod}
                disabled={!startDate || !endDate}
                aria-label={startDate && endDate ? `Log period from ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d')}` : 'Select both start and end dates to log'}
              >
                <Droplets className="h-3.5 w-3.5" />
                Log Period
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symptoms section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
            How are you feeling?
          </CardTitle>
          <CardDescription>
            Tap any symptoms you&rsquo;re experiencing to log them and get relief suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            role="group"
            aria-label="Select symptoms you are experiencing"
          >
            {SYMPTOMS.map(({ name, icon: Icon, color }) => {
              const isSelected = selectedSymptoms.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSymptomToggle(name)}
                  aria-pressed={isSelected}
                  aria-label={`${name} symptom${isSelected ? ', selected' : ''}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                      : 'border-border/60 bg-background text-muted-foreground hover:border-border hover:bg-muted/40'
                  )}
                >
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isSelected ? color : 'text-muted-foreground/50')}
                    aria-hidden="true"
                  />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleLogSymptoms}
            disabled={isSymptomsLoading}
            className="w-full gap-2 rounded-xl sm:w-auto"
            aria-label={`Log ${selectedSymptoms.length} selected symptoms and get AI suggestions`}
          >
            {isSymptomsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            Get Relief Suggestions
            {selectedSymptoms.length > 0 && (
              <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                {selectedSymptoms.length}
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Log period sheet (mobile-friendly bottom sheet) */}
      <Sheet open={isLogSheetOpen} onOpenChange={(open) => { setIsLogSheetOpen(open); if (!open) resetLogFlow(); }}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl px-0">
          <div className="px-6 pb-6 space-y-5">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <Droplets className="h-5 w-5 text-primary" aria-hidden="true" />
                Log Your Period
              </SheetTitle>
              <SheetDescription>
                {logStep === 'start'
                  ? 'Step 1 of 2: When did your last period start?'
                  : 'Step 2 of 2: When did it end?'
                }
              </SheetDescription>
            </SheetHeader>

            {/* Step indicators */}
            <div className="flex items-center gap-3" aria-label="Logging progress">
              <div className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                logStep === 'start'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/10 text-primary'
              )}>
                {logStep === 'start'
                  ? <span className="h-4 w-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">1</span>
                  : <Check className="h-3.5 w-3.5" />
                }
                Start
              </div>
              <div className={cn('h-px flex-1 transition-colors', logStep === 'end' ? 'bg-primary' : 'bg-border')} />
              <div className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                logStep === 'end'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}>
                <span className="h-4 w-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">2</span>
                End
              </div>
            </div>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={logStep === 'start' ? startDate : endDate}
                onSelect={(date) => {
                  if (!date) return;
                  if (logStep === 'start') {
                    setStartDate(date);
                    setLogStep('end');
                  } else {
                    if (date >= startDate!) {
                      setEndDate(date);
                    }
                  }
                }}
                className="rounded-2xl border mx-auto"
                aria-label={logStep === 'start' ? 'Select your last period start date' : 'Select your last period end date'}
              />
            </div>

            {(startDate || endDate) && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {startDate && (
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium">
                    <span className="text-primary">Start:</span>
                    {format(startDate, 'MMM d, yyyy')}
                    {logStep === 'end' && !endDate && (
                      <button
                        onClick={() => { setStartDate(undefined); setLogStep('start'); }}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        aria-label="Change start date"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                )}
                {endDate && (
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium">
                    <span className="text-primary">End:</span>
                    {format(endDate, 'MMM d, yyyy')}
                    <button
                      onClick={() => setEndDate(undefined)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      aria-label="Change end date"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {logStep === 'end' ? (
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl gap-1.5"
                  onClick={() => { setLogStep('start'); setStartDate(undefined); setEndDate(undefined); }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => { setIsLogSheetOpen(false); resetLogFlow(); }}
                >
                  Cancel
                </Button>
              )}
              <Button
                className="flex-1 gap-2 rounded-xl"
                onClick={handleLogPeriod}
                disabled={!startDate || !endDate}
                aria-label={startDate && endDate ? `Log period from ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d')}` : 'Select both dates to log'}
              >
                <Droplets className="h-4 w-4" />
                Log Period
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Your data is stored securely and only visible to you.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Prediction dialog */}
      <Dialog open={isPredictionDialogOpen} onOpenChange={setIsPredictionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" aria-hidden="true" />
              Future Predictions
            </DialogTitle>
            <DialogDescription>
              Estimated cycle dates to help you plan ahead.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="space-y-3" aria-label="Predicted cycle dates">
              {predictedDates.map((date, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{date}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              These are estimates based on a {CYCLE_LENGTH}-day cycle. Your body is unique.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPredictionDialogOpen(false)} className="rounded-xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Symptom suggestions dialog */}
      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="text-primary h-5 w-5" aria-hidden="true" />
              Relief Suggestions
            </DialogTitle>
            <DialogDescription>
              Gentle ideas to help you feel better.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap text-sm leading-relaxed max-h-[50vh] overflow-y-auto">
            {symptomSuggestions}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSuggestionDialogOpen(false)} className="rounded-xl">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
