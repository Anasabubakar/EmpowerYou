'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockGoals } from '@/lib/data';
import type { Goal } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal.title}</CardTitle>
        <CardDescription>
          Deadline: {format(goal.deadline, 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
        <div className="flex items-center gap-2">
          <Progress value={goal.progress} />
          <span className="text-sm font-medium text-foreground">
            {goal.progress}%
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Edit Goal</Button>
      </CardFooter>
    </Card>
  );
}

export default function WantsNeedsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

  const wants = goals.filter((g) => g.category === 'want');
  const needs = goals.filter((g) => g.category === 'need');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Wants &amp; Needs</h1>
          <p className="text-muted-foreground">
            Define, track, and achieve your goals.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add a New Goal</DialogTitle>
              <DialogDescription>
                Turn your desires and needs into actionable goals.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="wants">
        <TabsList className="grid w-full grid-cols-2 md:w-1/3">
          <TabsTrigger value="wants">Wants</TabsTrigger>
          <TabsTrigger value="needs">Needs</TabsTrigger>
        </TabsList>
        <TabsContent value="wants">
          <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
            {wants.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
             {wants.length === 0 &amp;&amp; <p className="text-muted-foreground col-span-full">No wants defined yet. Add a new goal to get started!</p>}
          </div>
        </TabsContent>
        <TabsContent value="needs">
          <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
            {needs.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
             {needs.length === 0 &amp;&amp; <p className="text-muted-foreground col-span-full">No needs defined yet. Add a new goal to get started!</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
