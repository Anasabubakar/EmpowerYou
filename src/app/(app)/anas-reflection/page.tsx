
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
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const ratings = [
  { value: '1', emoji: '😞', label: 'Poor' },
  { value: '2', emoji: '😕', label: 'Not great' },
  { value: '3', emoji: '😐', label: 'Okay' },
  { value: '4' , emoji: '😊', label: 'Good' },
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
        className="flex justify-between rounded-lg border p-4"
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
                'flex flex-col items-center gap-1 cursor-pointer p-2 rounded-md transition-all',
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
  
  const [myBehavior, setMyBehavior] = useState(anasReflection.myBehavior);
  const [hisBehavior, setHisBehavior] = useState(anasReflection.hisBehavior);
  const [progressLog, setProgressLog] = useState(anasReflection.progressLog);
  const [plans, setPlans] = useState(anasReflection.plans);

  const handleSave = () => {
    setAnasReflection({
      myBehavior,
      hisBehavior,
      progressLog,
      plans,
    });
    toast({
      title: 'Reflection Saved',
      description: "Your reflection has been saved.",
       action: (
        <Button variant="outline" size="sm" onClick={() => setIsReportOpen(true)}>
          View Report
        </Button>
      ),
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Relationship Tracker</h1>
        <p className="text-muted-foreground">
          A private space to reflect on your interactions and personal growth.
        </p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="grid w-full grid-cols-2 md:w-1/3">
          <TabsTrigger value="daily">Daily Reflection</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Today&apos;s Reflection</CardTitle>
              <CardDescription>
                How did things go with your partner today?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmojiRating
                label="How I acted today"
                value={myBehavior}
                onChange={setMyBehavior}
              />
              <EmojiRating
                label="How they acted today"
                value={hisBehavior}
                onChange={setHisBehavior}
              />
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
              <Button onClick={handleSave}>Save Reflection</Button>
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
                Summary feature coming soon. Consistent logging will help generate meaningful insights here!
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
                <p className="font-medium mb-2">Your plans moving forward:</p>
                <p className="text-muted-foreground italic border-l-2 pl-4">
                     &quot;{anasReflection.plans}&quot;
                </p>
             </div>
             <p className="text-xs text-center pt-4 text-muted-foreground">This is a summary of your latest entry. Keep logging for more detailed weekly trends!</p>
          </div>
          <DialogFooter>
             <Button onClick={() => setIsReportOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
