'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { summarizeDailyProgress } from '@/ai/flows/summarize-daily-progress';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';
import type { DiaryEntry } from '@/lib/types';
import { useAppContext } from '@/context/app-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format, parseISO, differenceInCalendarDays, startOfDay, subDays } from 'date-fns';
import { toDate } from '@/lib/date-utils';

const emptyForm: Omit<DiaryEntry, 'createdAt'> = {
  dailyRemark: '',
  diaryEntry: '',
  gratitude: '',
  challenge: '',
  tomorrowFocus: '',
  wantsNeedsProgress: '',
  mood: '',
  energyLevels: '',
  partnerReflection: '',
};

type Step = {
  key: keyof typeof emptyForm;
  label: (form: typeof emptyForm) => string;
  placeholder: string;
  multiline?: boolean;
  rows?: number;
};

export default function DiaryPage() {
  const { setDiaryEntries, diaryEntries } = useAppContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const snippet = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    return trimmed.length > 70 ? `${trimmed.slice(0, 70)}...` : trimmed;
  };

  const steps: Step[] = [
    {
      key: 'dailyRemark',
      label: () => 'What is the headline of your day?',
      placeholder: 'A short phrase that captures the day...',
    },
    {
      key: 'diaryEntry',
      label: (data) =>
        data.dailyRemark
          ? `You mentioned "${data.dailyRemark}". What feelings or story sit behind that?`
          : 'What feelings or story sit behind your day?',
      placeholder: 'Share the details that matter most to you...',
      multiline: true,
      rows: 5,
    },
    {
      key: 'gratitude',
      label: (data) =>
        data.diaryEntry
          ? `After sharing "${snippet(data.diaryEntry)}", what are you grateful for today?`
          : 'What are you grateful for today?',
      placeholder: 'A person, moment, or small win...',
    },
    {
      key: 'challenge',
      label: (data) =>
        data.gratitude
          ? `With "${snippet(data.gratitude)}" in mind, what felt hardest today?`
          : 'What was the hardest moment today?',
      placeholder: 'Name the challenge and how you responded...',
      multiline: true,
      rows: 4,
    },
    {
      key: 'wantsNeedsProgress',
      label: (data) =>
        data.challenge
          ? `After "${snippet(data.challenge)}", did you make any progress on your wants or needs?`
          : 'Any progress on your wants or needs?',
      placeholder: 'Small steps count...',
    },
    {
      key: 'mood',
      label: (data) =>
        data.wantsNeedsProgress
          ? `Given "${snippet(data.wantsNeedsProgress)}", how would you describe your mood now?`
          : 'How would you describe your mood?',
      placeholder: 'e.g., Hopeful, tired, calm',
    },
    {
      key: 'energyLevels',
      label: (data) =>
        data.mood
          ? `With "${snippet(data.mood)}" in mind, how were your energy levels today?`
          : 'How were your energy levels today?',
      placeholder: 'e.g., High in the morning, dipped later',
    },
    {
      key: 'partnerReflection',
      label: (data) =>
        data.energyLevels
          ? `Did "${snippet(data.energyLevels)}" affect your relationships or partner?`
          : 'How did your relationships feel today?',
      placeholder: 'A quick note on connection...',
    },
    {
      key: 'tomorrowFocus',
      label: (data) =>
        data.partnerReflection
          ? `Given "${snippet(data.partnerReflection)}", what is one focus for tomorrow?`
          : 'What is one focus for tomorrow?',
      placeholder: 'Something gentle and doable...',
    },
  ];

  const currentStep = steps[stepIndex];
  const currentValue = form[currentStep.key];
  const isCurrentValid = String(currentValue).trim().length > 0;

  const sortedEntries = useMemo(
    () =>
      [...diaryEntries].sort(
        (a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)
      ),
    [diaryEntries]
  );

  const uniqueDates = useMemo(() => {
    const set = new Set<string>();
    diaryEntries.forEach((entry) => {
      const d = toDate(entry.createdAt);
      if (d) {
        set.add(format(d, 'yyyy-MM-dd'));
      }
    });
    return Array.from(set).sort();
  }, [diaryEntries]);

  const { currentStreak, longestStreak } = useMemo(() => {
    if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const sorted = uniqueDates
      .map((date) => startOfDay(parseISO(date)))
      .sort((a, b) => a.getTime() - b.getTime());

    let longest = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i += 1) {
      if (differenceInCalendarDays(sorted[i], sorted[i - 1]) === 1) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    const latest = sorted[sorted.length - 1];
    let streakNow = 0;
    let cursor = startOfDay(latest);
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      if (differenceInCalendarDays(cursor, sorted[i]) === 0) {
        streakNow += 1;
        cursor = subDays(cursor, 1);
      } else if (differenceInCalendarDays(cursor, sorted[i]) > 0) {
        break;
      }
    }

    return { currentStreak: streakNow, longestStreak: longest };
  }, [uniqueDates]);

  const topMoodWords = useMemo(() => {
    const freq = new Map<string, number>();
    diaryEntries.forEach((entry) => {
      entry.mood
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((word) => word.length > 2)
        .forEach((word) => freq.set(word, (freq.get(word) || 0) + 1));
    });
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [diaryEntries]);

  const topGratitudeWords = useMemo(() => {
    const freq = new Map<string, number>();
    diaryEntries.forEach((entry) => {
      entry.gratitude
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((word) => word.length > 2)
        .forEach((word) => freq.set(word, (freq.get(word) || 0) + 1));
    });
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [diaryEntries]);

  const handleChange = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!isCurrentValid) return;
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    const hasAll = steps.every((step) => String(form[step.key]).trim().length > 0);
    if (!hasAll) {
      toast({
        title: 'Almost there',
        description: 'Please answer each reflection step before generating your summary.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setSummary(null);

    const diaryEntryWithTimestamp: DiaryEntry = {
      ...form,
      createdAt: new Date().toISOString(),
    };

    try {
      setDiaryEntries((prevEntries) => [...prevEntries, diaryEntryWithTimestamp]);
      const result = await summarizeDailyProgress(form);
      setSummary(result.summary);
      toast({
        title: 'Summary Generated',
        description: 'Your daily summary is ready.',
      });
      setForm(emptyForm);
      setStepIndex(0);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate summary. Please try again.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Reflection
        </div>
        <h1 className="text-4xl font-headline font-semibold">Daily Diary &amp; Reflection</h1>
        <p className="text-muted-foreground max-w-xl">
          A private place to record the day and gently reflect.
        </p>
      </div>

      <Tabs defaultValue="new" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:max-w-lg">
          <TabsTrigger value="new">New Entry</TabsTrigger>
          <TabsTrigger value="library">Diary Library</TabsTrigger>
          <TabsTrigger value="growth">Review Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Guided Reflection</CardTitle>
              <CardDescription>
                Each question follows what you just shared to keep your reflection focused.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm">
                <span className="font-medium">Step {stepIndex + 1} of {steps.length}</span>
                <span className="text-muted-foreground">{currentStep.key}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor={currentStep.key}>{currentStep.label(form)}</Label>
                {currentStep.multiline ? (
                  <Textarea
                    id={currentStep.key}
                    placeholder={currentStep.placeholder}
                    rows={currentStep.rows || 4}
                    value={form[currentStep.key]}
                    onChange={(e) => handleChange(currentStep.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={currentStep.key}
                    placeholder={currentStep.placeholder}
                    value={form[currentStep.key]}
                    onChange={(e) => handleChange(currentStep.key, e.target.value)}
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={handleBack} disabled={stepIndex === 0}>
                Back
              </Button>
              {stepIndex < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={!isCurrentValid}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !isCurrentValid} size="lg">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Daily Summary
                </Button>
              )}
            </CardFooter>
          </Card>

          {summary && (
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-card/80 to-transparent">
              <CardHeader>
                <CardTitle>AI-Powered Summary</CardTitle>
                <CardDescription>
                  Here are the key reflections from your day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{summary}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Diary Library</CardTitle>
              <CardDescription>
                Revisit previous reflections and see your journey in words.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedEntries.length === 0 ? (
                <div className="text-center text-muted-foreground p-8 rounded-2xl border border-dashed">
                  <BookOpen className="mx-auto mb-2 h-8 w-8" />
                  <p>No entries yet.</p>
                  <p className="text-sm">Write your first reflection to build your library.</p>
                </div>
              ) : (
                sortedEntries.map((entry) => (
                  <div
                    key={entry.createdAt}
                    className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {toDate(entry.createdAt) ? format(toDate(entry.createdAt)!, 'PPP') : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.dailyRemark}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsDialogOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-secondary/60 px-2 py-1">Mood: {entry.mood}</span>
                      <span className="rounded-full bg-secondary/60 px-2 py-1">Energy: {entry.energyLevels}</span>
                      <span className="rounded-full bg-secondary/60 px-2 py-1">Gratitude: {entry.gratitude}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Consistency</CardTitle>
                <CardDescription>Track how often you check in.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-3xl font-semibold">{diaryEntries.length}</p>
                <p className="text-sm text-muted-foreground">Total entries</p>
                <div className="pt-4 space-y-1 text-sm">
                  <p>Current streak: <span className="font-semibold">{currentStreak} days</span></p>
                  <p>Longest streak: <span className="font-semibold">{longestStreak} days</span></p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mood Signals</CardTitle>
                <CardDescription>Words you use most often.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topMoodWords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Log a few entries to reveal patterns.</p>
                ) : (
                  topMoodWords.map(([word, count]) => (
                    <div key={word} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{word}</span>
                      <span className="text-xs text-muted-foreground">{count}x</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Focus</CardTitle>
                <CardDescription>What you are leaning into now.</CardDescription>
              </CardHeader>
              <CardContent>
                {sortedEntries[0] ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tomorrow focus</p>
                      <p className="text-sm font-medium">{sortedEntries[0].tomorrowFocus}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Challenge</p>
                      <p className="text-sm text-muted-foreground">{sortedEntries[0].challenge}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Start a new entry to see growth highlights here.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gratitude Themes</CardTitle>
                <CardDescription>Words that show up often.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topGratitudeWords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Log gratitude to see themes.</p>
                ) : (
                  topGratitudeWords.map(([word, count]) => (
                    <div key={word} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{word}</span>
                      <span className="text-xs text-muted-foreground">{count}x</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle>{toDate(selectedEntry.createdAt) ? format(toDate(selectedEntry.createdAt)!, 'PPP') : ''}</DialogTitle>
                <DialogDescription>{selectedEntry.dailyRemark}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">Story</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedEntry.diaryEntry}</p>
                </div>
                <div>
                  <p className="font-medium">Gratitude</p>
                  <p className="text-muted-foreground">{selectedEntry.gratitude}</p>
                </div>
                <div>
                  <p className="font-medium">Challenge</p>
                  <p className="text-muted-foreground">{selectedEntry.challenge}</p>
                </div>
                <div>
                  <p className="font-medium">Wants &amp; Needs Progress</p>
                  <p className="text-muted-foreground">{selectedEntry.wantsNeedsProgress}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="font-medium">Mood</p>
                    <p className="text-muted-foreground">{selectedEntry.mood}</p>
                  </div>
                  <div>
                    <p className="font-medium">Energy</p>
                    <p className="text-muted-foreground">{selectedEntry.energyLevels}</p>
                  </div>
                  <div>
                    <p className="font-medium">Relationships</p>
                    <p className="text-muted-foreground">{selectedEntry.partnerReflection}</p>
                  </div>
                  <div>
                    <p className="font-medium">Tomorrow Focus</p>
                    <p className="text-muted-foreground">{selectedEntry.tomorrowFocus}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)} variant="outline">Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
