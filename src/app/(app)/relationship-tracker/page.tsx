'use client';

import { useMemo, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const ratings = [
  { value: '1', emoji: '😞', label: 'Poor' },
  { value: '2', emoji: '😕', label: 'Not great' },
  { value: '3', emoji: '😐', label: 'Okay' },
  { value: '4', emoji: '😊', label: 'Good' },
  { value: '5', emoji: '💖', label: 'Very Sweet' },
];

function EmojiRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex justify-between rounded-2xl border border-border/60 bg-background/70 p-4"
      >
        {ratings.map((rating) => (
          <div key={rating.value} className="flex flex-col items-center gap-2">
            <RadioGroupItem
              value={rating.value}
              id={`${label}-rating-${rating.value}`}
              className="sr-only"
            />
            <Label
              htmlFor={`${label}-rating-${rating.value}`}
              className={cn(
                'flex flex-col items-center gap-1 cursor-pointer p-2 rounded-xl transition-all',
                value === rating.value && 'ring-2 ring-primary bg-primary/10'
              )}
            >
              <span className="text-3xl transition-transform hover:scale-125">
                {rating.emoji}
              </span>
              <span className="text-xs text-muted-foreground">{rating.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

export default function RelationshipTrackerPage() {
  const { anasReflection, setAnasReflection } = useAppContext();
  const { toast } = useToast();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const [myBehavior, setMyBehavior] = useState(anasReflection.myBehavior);
  const [hisBehavior, setHisBehavior] = useState(anasReflection.hisBehavior);
  const [progressLog, setProgressLog] = useState(anasReflection.progressLog || '');
  const [supportMoment, setSupportMoment] = useState(anasReflection.supportMoment || '');
  const [needs, setNeeds] = useState(anasReflection.needs || '');
  const [plans, setPlans] = useState(anasReflection.plans || '');

  const myLabel = useMemo(
    () => ratings.find((r) => r.value === myBehavior)?.label || 'Not set',
    [myBehavior]
  );
  const hisLabel = useMemo(
    () => ratings.find((r) => r.value === hisBehavior)?.label || 'Not set',
    [hisBehavior]
  );

  const steps = [
    {
      title: 'How I acted today',
      description: 'Start with your own behavior and energy.',
      content: (
        <EmojiRating
          label="How I acted today"
          value={myBehavior}
          onChange={setMyBehavior}
        />
      ),
      isValid: Boolean(myBehavior),
    },
    {
      title: 'How they showed up',
      description: myBehavior
        ? `You rated yourself \"${myLabel}\". How did they show up today?`
        : 'How did they show up today?',
      content: (
        <EmojiRating
          label="How they acted today"
          value={hisBehavior}
          onChange={setHisBehavior}
        />
      ),
      isValid: Boolean(hisBehavior),
    },
    {
      title: 'What stood out',
      description:
        myBehavior && hisBehavior
          ? `You felt \"${myLabel}\" and they felt \"${hisLabel}\". What moment captured that?`
          : 'What moment captured the vibe today?',
      content: (
        <div className="space-y-2">
          <Label htmlFor="progress-log">Daily Progress Log</Label>
          <Textarea
            id="progress-log"
            placeholder="Log your progress in areas of your relationship..."
            rows={4}
            value={progressLog}
            onChange={(e) => setProgressLog(e.target.value)}
          />
        </div>
      ),
      isValid: progressLog.trim().length > 0,
    },
    {
      title: 'What felt supportive',
      description: progressLog
        ? `In the middle of "${progressLog}", what felt supportive or tender?`
        : 'What felt supportive or tender today?',
      content: (
        <div className="space-y-2">
          <Label htmlFor="support-moment">Supportive Moment</Label>
          <Textarea
            id="support-moment"
            placeholder="A gesture, word, or choice that helped..."
            rows={3}
            value={supportMoment}
            onChange={(e) => setSupportMoment(e.target.value)}
          />
        </div>
      ),
      isValid: supportMoment.trim().length > 0,
    },
    {
      title: 'What I need next',
      description: supportMoment
        ? `After "${supportMoment}", what do you need next to feel cared for?`
        : 'What do you need next to feel cared for?',
      content: (
        <div className="space-y-2">
          <Label htmlFor="needs">Needs & Boundaries</Label>
          <Textarea
            id="needs"
            placeholder="Name one need or boundary that matters..."
            rows={3}
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
          />
        </div>
      ),
      isValid: needs.trim().length > 0,
    },
    {
      title: 'What comes next',
      description: needs
        ? `Based on "${needs}", what is one action you want to take next?`
        : 'What is one action you want to take next?',
      content: (
        <div className="space-y-2">
          <Label htmlFor="plans">Plans and Future Actions</Label>
          <Textarea
            id="plans"
            placeholder="What are your plans related to these interactions or areas of progress?"
            rows={3}
            value={plans}
            onChange={(e) => setPlans(e.target.value)}
          />
        </div>
      ),
      isValid: plans.trim().length > 0,
    },
  ];

  const currentStep = steps[stepIndex];

  const handleSave = () => {
    setAnasReflection({
      myBehavior,
      hisBehavior,
      progressLog,
      supportMoment,
      needs,
      plans,
    });
    toast({
      title: 'Reflection Saved',
      description: 'Your reflection has been saved.',
      action: (
        <Button variant="outline" size="sm" onClick={() => setIsReportOpen(true)}>
          View Report
        </Button>
      ),
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Connection
        </div>
        <h1 className="text-4xl font-headline font-semibold">Relationship Tracker</h1>
        <p className="text-muted-foreground max-w-xl">
          A private place to reflect on how things feel between you.
        </p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="grid w-full grid-cols-2 md:max-w-sm">
          <TabsTrigger value="daily">Daily Reflection</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Today&apos;s Reflection</CardTitle>
              <CardDescription>
                Each question builds on what you just shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm">
                <span className="font-medium">Step {stepIndex + 1} of {steps.length}</span>
                <span className="text-muted-foreground">{currentStep.title}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                {currentStep.content}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={stepIndex === 0}
                >
                  Back
                </Button>
                {stepIndex < steps.length - 1 ? (
                  <Button
                    onClick={() => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))}
                    disabled={!currentStep.isValid}
                  >
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSave} disabled={!currentStep.isValid}>
                    Save Reflection
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="summary">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Weekly Summary</CardTitle>
              <CardDescription>
                A look back at your reflections from this week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Summary feature coming soon. Consistent logging will help generate meaningful insights here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weekly Relationship Report</DialogTitle>
            <DialogDescription>
              Here's a summary of your recent reflections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="flex justify-between">
              <p className="font-medium">My average behavior:</p>
              <p>{ratings.find(r => r.value === anasReflection.myBehavior)?.label} ({anasReflection.myBehavior}/5)</p>
            </div>
            <div className="flex justify-between">
              <p className="font-medium">Their average behavior:</p>
              <p>{ratings.find(r => r.value === anasReflection.hisBehavior)?.label} ({anasReflection.hisBehavior}/5)</p>
            </div>
            <div>
              <p className="font-medium mb-2">Highlights from your logs:</p>
              <p className="text-muted-foreground italic border-l-2 pl-4">
                &quot;{anasReflection.progressLog}&quot;
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">What felt supportive:</p>
              <p className="text-muted-foreground italic border-l-2 pl-4">
                &quot;{anasReflection.supportMoment}&quot;
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Needs &amp; boundaries:</p>
              <p className="text-muted-foreground italic border-l-2 pl-4">
                &quot;{anasReflection.needs}&quot;
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Your plans moving forward:</p>
              <p className="text-muted-foreground italic border-l-2 pl-4">
                &quot;{anasReflection.plans}&quot;
              </p>
            </div>
            <p className="text-xs text-center pt-4 text-muted-foreground">This is a summary of your latest entry. Keep logging for more detailed weekly trends.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsReportOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
