'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
import { Loader2, Sparkles } from 'lucide-react';
import type { DiaryEntry } from '@/lib/types';
import { useAppContext } from '@/context/app-context';

type FormValues = Omit<DiaryEntry, 'createdAt'>;

export default function DiaryPage() {
  const { setDiaryEntries } = useAppContext();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setSummary(null);
    
    const diaryEntryWithTimestamp: DiaryEntry = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    try {
      setDiaryEntries((prevEntries) => [...prevEntries, diaryEntryWithTimestamp]);
      // The summarizeDailyProgress flow might need to be updated if its input schema changes
      const result = await summarizeDailyProgress(data);
      setSummary(result.summary);
      toast({
        title: 'Summary Generated',
        description: 'Your daily summary is ready!',
      });
      reset();
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Daily Diary &amp; Reflection</h1>
        <p className="text-muted-foreground">
          Your private space for thoughts, feelings, and growth.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Entry</CardTitle>
            <CardDescription>
              Fill out the fields below to reflect on your day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dailyRemark">Brief of the Day</Label>
              <Input
                id="dailyRemark"
                placeholder="A quick summary of your day..."
                {...register('dailyRemark', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diaryEntry">
                Future Self Reflection: What have you done today that your
                future self will thank you for?
              </Label>
              <Textarea
                id="diaryEntry"
                placeholder="Your detailed thoughts and feelings..."
                rows={6}
                {...register('diaryEntry', { required: true })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="wantsNeedsProgress">Wants &amp; Needs Progress</Label>
                <Input
                    id="wantsNeedsProgress"
                    placeholder="e.g., Practiced guitar for 30 mins"
                    {...register('wantsNeedsProgress')}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Input
                    id="mood"
                    placeholder="e.g., Cheerful, a bit tired"
                    {...register('mood')}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="energyLevels">Energy Levels</Label>
                <Input
                    id="energyLevels"
                    placeholder="e.g., High in the morning, dipped in the afternoon"
                    {...register('energyLevels')}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="partnerReflection">Partner Reflection</Label>
                <Input
                    id="partnerReflection"
                    placeholder="e.g., Had a productive conversation"
                    {...register('partnerReflection')}
                />
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Daily Summary
            </Button>
          </CardFooter>
        </Card>
      </form>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Summary</CardTitle>
            <CardDescription>
              Here are the key insights from your day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
