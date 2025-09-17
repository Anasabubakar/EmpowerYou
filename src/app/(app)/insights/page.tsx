'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generatePersonalizedInsights } from '@/ai/flows/generate-personalized-insights';
import { Loader2, Sparkles, Lightbulb, ClipboardList, TrendingUp } from 'lucide-react';
import type { GeneratePersonalizedInsightsOutput } from '@/ai/flows/generate-personalized-insights';

const dummyData = {
  wantsNeedsData:
    'User is working on learning guitar (25% progress) and getting 8 hours of sleep (70% progress).',
  menstrualCycleData: 'Currently on day 14 of the cycle. No major symptoms reported.',
  taskData: 'Completed 2 of 4 tasks today. High priority task is still pending.',
  healthMetricsData:
    'Mood has been fluctuating between 3 and 5. Energy levels seem to correlate with mood.',
  diaryEntries:
    'User felt productive today but a bit stressed about the remaining tasks. Mentioned feeling happy after talking to a friend.',
  anasProgressData:
    'User feels good about recent interactions with Anas, rating her own behavior as 4/5 and his as 5/5.',
};

export default function InsightsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] =
    useState<GeneratePersonalizedInsightsOutput | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setInsights(null);
    try {
      const result = await generatePersonalizedInsights(dummyData);
      setInsights(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights. Please try again.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-headline font-bold">Insights &amp; Reports</h1>
        <p className="text-muted-foreground max-w-xl">
          Let&apos;s analyze your data to uncover trends, provide personalized insights,
          and help you on your growth journey.
        </p>
        <Button onClick={handleGenerate} disabled={loading} className="mt-4">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate My Report
        </Button>
      </div>

      {insights && (
        <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
               <div className="p-3 rounded-full bg-accent/20">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{insights.insights}</p>
            </CardContent>
          </Card>
           <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
               <div className="p-3 rounded-full bg-primary/20">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{insights.summary}</p>
            </CardContent>
          </Card>
           <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
               <div className="p-3 rounded-full bg-secondary-foreground/10">
                <Lightbulb className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle>Actionable Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{insights.advice}</p>
            </CardContent>
          </Card>
        </div>
      )}
       {!insights && !loading && (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg mt-6">
          <Sparkles className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Ready for your insights?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click the button above to generate your personalized report.</p>
        </div>
      )}
    </div>
  );
}
