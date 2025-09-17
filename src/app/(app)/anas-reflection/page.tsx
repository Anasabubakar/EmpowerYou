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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';

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
              className="flex flex-col items-center gap-1 cursor-pointer"
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

export default function AnasReflectionPage() {
  const { anasReflection, setAnasReflection } = useAppContext();
  const { toast } = useToast();
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
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Progress with Anas</h1>
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
                How did things go with Anas today?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmojiRating
                label="How I acted today"
                value={myBehavior}
                onChange={setMyBehavior}
              />
              <EmojiRating
                label="How he acted today"
                value={hisBehavior}
                onChange={setHisBehavior}
              />
              <div className="space-y-2">
                <Label htmlFor="progress-log">Daily Progress Log</Label>
                <Textarea
                  id="progress-log"
                  placeholder="Log your progress in areas where Anas is providing guidance..."
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
    </div>
  );
}
