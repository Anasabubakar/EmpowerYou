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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

function EditGoalDialog({
  goal,
  children,
  onSave,
}: {
  goal: Goal;
  children: React.ReactNode;
  onSave: (updatedGoal: Goal) => void;
}) {
  const [open, setOpen] = useState(false);
  // To prevent changes in the dialog from affecting the card before saving
  const [editableGoal, setEditableGoal] = useState(goal);

  const handleSave = () => {
    onSave(editableGoal);
    setOpen(false);
  };
  
  // Reset editable goal when dialog is opened with a new goal
  React.useEffect(() => {
    if (open) {
      setEditableGoal(goal);
    }
  }, [open, goal]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Make changes to your goal. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={editableGoal.title}
              onChange={(e) =>
                setEditableGoal({ ...editableGoal, title: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={editableGoal.description}
              onChange={(e) =>
                setEditableGoal({
                  ...editableGoal,
                  description: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Category</Label>
            <RadioGroup
              value={editableGoal.category}
              onValueChange={(value) =>
                setEditableGoal({
                  ...editableGoal,
                  category: value as 'want' | 'need',
                })
              }
              className="col-span-3 flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="want" id="r-want" />
                <Label htmlFor="r-want">Want</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="need" id="r-need" />
                <Label htmlFor="r-need">Need</Label>
              </div>
            </RadioGroup>
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="progress" className="text-right pt-2">
              Progress
            </Label>
            <div className='col-span-3 flex items-center gap-4'>
                 <Slider
                    id="progress"
                    value={[editableGoal.progress]}
                    onValueChange={(value) => setEditableGoal({...editableGoal, progress: value[0]})}
                    max={100}
                    step={1}
                    className="flex-1"
                />
                <span className="text-sm font-medium text-foreground w-12 text-right">
                    {editableGoal.progress}%
                </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GoalCard({ goal, onGoalUpdate }: { goal: Goal; onGoalUpdate: (updatedGoal: Goal) => void; }) {
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
        <EditGoalDialog goal={goal} onSave={onGoalUpdate}>
          <Button variant="outline">Edit Goal</Button>
        </EditGoalDialog>
      </CardFooter>
    </Card>
  );
}

export default function WantsNeedsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

  const wants = goals.filter((g) => g.category === 'want');
  const needs = goals.filter((g) => g.category === 'need');
  
  const handleGoalUpdate = (updatedGoal: Goal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

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
              <GoalCard key={goal.id} goal={goal} onGoalUpdate={handleGoalUpdate} />
            ))}
             {wants.length === 0 && <p className="text-muted-foreground col-span-full">No wants defined yet. Add a new goal to get started!</p>}
          </div>
        </TabsContent>
        <TabsContent value="needs">
          <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
            {needs.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onGoalUpdate={handleGoalUpdate} />
            ))}
             {needs.length === 0 && <p className="text-muted-foreground col-span-full">No needs defined yet. Add a new goal to get started!</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
