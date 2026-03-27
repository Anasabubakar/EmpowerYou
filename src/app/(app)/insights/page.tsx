'use client';

import { useState } from 'react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generatePersonalizedInsights } from '@/ai/flows/generate-personalized-insights';
import { generateShareableSummary } from '@/ai/flows/generate-shareable-summary';
import type { GenerateShareableSummaryInput } from '@/ai/flows/generate-shareable-summary';
import { Loader2, Sparkles, Lightbulb, ClipboardList, TrendingUp, Share2, ClipboardCopy } from 'lucide-react';
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
        <div className={`p-3 rounded-2xl ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
}

export default function InsightsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [insights, setInsights] =
    useState<GeneratePersonalizedInsightsOutput | null>(null);
  const [shareableSummary, setShareableSummary] = useState<string>('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const {
    userName,
    goals,
    tasks,
    cycleInfo,
    loggedSymptoms,
    healthMetrics,
    diaryEntries,
    anasReflection,
    chatHistory,
    companionName,
  } = useAppContext();

  const getTodaysChat = () => {
    return chatHistory.slice(-10);
  };

  const handleGenerate = async () => {
    if (!userName) return;
    setLoading(true);
    setInsights(null);

    const input: GeneratePersonalizedInsightsInput = {
      userName: userName || 'friend',
      currentDate: new Date().toISOString(),
      wantsNeedsData: goals.map(g => ({
        ...g,
        deadline: g.deadline.toISOString(),
        createdAt: g.createdAt
      })),
      menstrualCycleData: {
        ...cycleInfo,
        predictedDate: cycleInfo.predictedDate.toISOString(),
        lastPeriodDate: cycleInfo.lastPeriodDate?.toISOString(),
        loggedSymptoms
      },
      taskData: tasks.map(t => ({ ...t, createdAt: t.createdAt })),
      healthMetricsData: healthMetrics.map(m => ({ ...m, createdAt: m.createdAt })),
      diaryEntries: diaryEntries.slice(-7),
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

  const handleShare = async () => {
    if (!userName) return;
    setShareLoading(true);

    const input: GenerateShareableSummaryInput = {
      userName: userName || 'friend',
      wantsNeedsData: goals.map(g => ({
        ...g,
        deadline: g.deadline.toISOString(),
        createdAt: g.createdAt,
      })),
      menstrualCycleData: {
        ...cycleInfo,
        predictedDate: cycleInfo.predictedDate.toISOString(),
        lastPeriodDate: cycleInfo.lastPeriodDate?.toISOString(),
        loggedSymptoms,
      },
      taskData: tasks.map(t => ({
        ...t,
        createdAt: t.createdAt,
      })),
      healthMetricsData: healthMetrics.map(m => ({
        ...m,
        createdAt: m.createdAt,
      })),
      diaryEntries: diaryEntries.slice(-1),
      partnerReflectionData: anasReflection,
      companionChat: getTodaysChat(),
      companionName: companionName,
    };

    try {
      const result = await generateShareableSummary(input);
      setShareableSummary(result.summary);
      setIsShareDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error creating summary',
        description: 'I had trouble putting together the summary for you. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setShareLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableSummary);
    toast({
      title: 'Copied to clipboard',
      description: "You can now paste this into any app you'd like.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Insight
        </div>
        <h1 className="text-4xl font-headline font-semibold">Your Personal Reflections</h1>
        <p className="text-muted-foreground max-w-xl">
          Let the AI connect the dots and reflect the patterns back to you.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerate} disabled={loading || !userName} size="lg">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate My Report
          </Button>
          <Button onClick={handleShare} disabled={shareLoading || !userName} size="lg" variant="outline">
            {shareLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            Share My Day
          </Button>
        </div>
      </div>

      {insights && (
        <div className="grid grid-cols-1 gap-6 pt-2 lg:grid-cols-1">
          <InsightCard
            icon={TrendingUp}
            title="Observations & Trends"
            content={insights.insights}
            iconBgColor="bg-accent/20"
            iconColor="text-accent"
          />
          <InsightCard
            icon={ClipboardList}
            title="High-Level Summary"
            content={insights.summary}
            iconBgColor="bg-primary/20"
            iconColor="text-primary"
          />
          <InsightCard
            icon={Lightbulb}
            title="Actionable Advice"
            content={insights.advice}
            iconBgColor="bg-secondary/60"
            iconColor="text-foreground"
          />
        </div>
      )}
      {!insights && !loading && (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-2xl mt-6 bg-background/60">
          <Sparkles className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Ready for your reflections?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click the button above and let the AI share what it sees.</p>
        </div>
      )}

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>A Glimpse Into Your Day</DialogTitle>
            <DialogDescription>
              Here is a summary of your day to share. You can copy it and send it in any app you'd like.
            </DialogDescription>
          </DialogHeader>
          <Card className="max-h-[50vh] overflow-y-auto">
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap text-sm">{shareableSummary}</p>
            </CardContent>
          </Card>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Close</Button>
            <Button onClick={copyToClipboard}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copy Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
