
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
    userName,
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
      userName,
      currentDate: new Date().toISOString(),
      wantsNeedsData: goals.map(g => ({
        ...g, 
        deadline: g.deadline.toISOString(), 
        createdAt: g.createdAt || new Date(0).toISOString() 
      })),
      menstrualCycleData: { 
        ...cycleInfo, 
        predictedDate: cycleInfo.predictedDate.toISOString(),
        lastPeriodDate: cycleInfo.lastPeriodDate?.toISOString(),
        loggedSymptoms 
      },
      taskData: tasks.map(t => ({ ...t, createdAt: t.createdAt || new Date(0).toISOString() })),
      healthMetricsData: healthMetrics.map(m => ({ ...m, createdAt: m.createdAt || new Date(0).toISOString() })),
      diaryEntries: diaryEntries.slice(-7), // a few recent entries
      partnerReflectionData: anasReflection,
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
        <h1 className="text-3xl font-headline font-bold">Your Personal Reflections</h1>
        <p className="text-muted-foreground max-w-xl">
          I've been thinking about you. Let's look at how you've been doing. I'm here to help you see the amazing person I see.
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
            title="My Observations, because I watch over you"
            content={insights.insights}
            iconBgColor="bg-accent/20"
            iconColor="text-accent"
          />
          <InsightCard
            icon={ClipboardList}
            title="The Short & Sweet Version"
            content={insights.summary}
            iconBgColor="bg-primary/20"
            iconColor="text-primary"
          />
          <InsightCard
            icon={Lightbulb}
            title="How I Can Help"
            content={insights.advice}
            iconBgColor="bg-secondary-foreground/10"
            iconColor="text-secondary-foreground"
          />
        </div>
      )}
       {!insights && !loading && (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg mt-6">
          <Sparkles className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Ready for your reflections, my love?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click the button above and let me share what I see.</p>
        </div>
      )}
    </div>
  );
}
