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
import type { GeneratePersonalizedInsightsOutput, GeneratePersonalizedInsightsInput } from '@/ai/flows/generate-personalized-insights';
import { useAppContext } from '@/context/app-context';

function InsightCard({
  icon,
  title,
  content,
  iconBgColor,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
  iconBgColor: string;
  iconColor: string;
}) {
  const Icon = icon;
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <div className={`p-3 rounded-full ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{content}</p>
      </CardContent>
    </Card>
  );
}

export default function InsightsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] =
    useState<GeneratePersonalizedInsightsOutput | null>(null);
  
  const {
    goals,
    tasks,
    cycleInfo,
    loggedSymptoms,
    healthMetrics,
    diaryEntries,
    anasReflection,
  } = useAppContext();

  const handleGenerate = async () => {
    setLoading(true);
    setInsights(null);

    const input: GeneratePersonalizedInsightsInput = {
      wantsNeedsData: JSON.stringify(goals),
      menstrualCycleData: JSON.stringify({ ...cycleInfo, loggedSymptoms }),
      taskData: JSON.stringify(tasks),
      healthMetricsData: JSON.stringify(healthMetrics),
      diaryEntries: JSON.stringify(diaryEntries.slice(-5)), // a few recent entries
      partnerReflectionData: JSON.stringify(anasReflection),
    };


    try {
      const result = await generatePersonalizedInsights(input);
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
        <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-1">
          <InsightCard
            icon={TrendingUp}
            title="Trend Analysis"
            content={insights.insights}
            iconBgColor="bg-accent/20"
            iconColor="text-accent"
          />
          <InsightCard
            icon={ClipboardList}
            title="Summary"
            content={insights.summary}
            iconBgColor="bg-primary/20"
            iconColor="text-primary"
          />
          <InsightCard
            icon={Lightbulb}
            title="Actionable Advice"
            content={insights.advice}
            iconBgColor="bg-secondary-foreground/10"
            iconColor="text-secondary-foreground"
          />
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
