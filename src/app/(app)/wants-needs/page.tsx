
'use client';

import { useState, useEffect } from 'react';
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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/app-context';
import type { Goal } from '@/lib/types';
import { PlusCircle, Heart } from 'lucide-react';
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
  const [editableGoal, setEditableGoal] = useState(goal);

  const handleSave = () => {
    onSave(editableGoal);
    setOpen(false);
  };
  
  useEffect(() => {
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
            Let's refine this dream of yours, my love.
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
              value={editableGoal.description || ''}
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
          By {format(goal.deadline, 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 h-10">{goal.description}</p>
        <div className="flex items-center gap-2">
          <Progress value={goal.progress} />
          <span className="text-sm font-medium text-foreground">
            {goal.progress}%
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <EditGoalDialog goal={goal} onSave={onGoalUpdate}>
          <Button variant="outline">Update Progress</Button>
        </EditGoalDialog>
      </CardFooter>
    </Card>
  );
}

function AddGoalDialog({ onAddGoal }: { onAddGoal: (newGoal: Goal) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'want' | 'need'>('want');

  const handleSave = () => {
    if (title) {
      onAddGoal({
        id: `g${Date.now()}`,
        title,
        description,
        category,
        progress: 0,
        deadline: new Date(new Date().setDate(new Date().getDate() + 30)), // Default 30 days deadline
        createdAt: new Date().toISOString(),
      });
      setOpen(false);
      setTitle('');
      setDescription('');
      setCategory('want');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>What's in Your Heart?</DialogTitle>
          <DialogDescription>
            Let's turn your desires and needs into beautiful goals, my love.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-title" className="text-right">
              Goal
            </Label>
            <Input id="add-title" placeholder="e.g., Learn to paint" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-description" className="text-right">
              A little detail
            </Label>
            <Textarea id="add-description" placeholder="e.g., To express my creative side" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Is this a...</Label>
            <RadioGroup
              value={category}
              onValueChange={(value) => setCategory(value as 'want' | 'need')}
              className="col-span-3 flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="want" id="r-add-want" />
                <Label htmlFor="r-add-want">Want</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="need" id="r-add-need" />
                <Label htmlFor="r-add-need">Need</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
           <DialogClose asChild>
             <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ isWant, onAddGoal }: { isWant: boolean, onAddGoal: (newGoal: Goal) => void }) {
    return (
        <div className="text-center text-muted-foreground p-12 col-span-full border-2 border-dashed rounded-lg flex flex-col items-center gap-4">
            <Heart className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">This space is full of potential</h3>
            {isWant ? (
                <p>What desires are you dreaming of, my love? Let's add your first 'Want'.</p>
            ) : (
                <p>What's essential for your well-being, sweetheart? Let's add your first 'Need'.</p>
            )}
             <AddGoalDialog onAddGoal={onAddGoal} />
        </div>
    );
}

export default function WantsNeedsPage() {
  const { goals, setGoals } = useAppContext();

  const wants = goals.filter((g) => g.category === 'want');
  const needs = goals.filter((g) => g.category === 'need');
  
  const handleGoalUpdate = (updatedGoal: Goal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };
  
  const handleAddGoal = (newGoal: Goal) => {
    setGoals([newGoal, ...goals]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Your Dreams &amp; Needs</h1>
          <p className="text-muted-foreground">
            A place for your heart's desires and essential needs. I'm here to support them all.
          </p>
        </div>
        <AddGoalDialog onAddGoal={handleAddGoal} />
      </div>
      <Tabs defaultValue="wants">
        <TabsList className="grid w-full grid-cols-2 md:w-1/3">
          <TabsTrigger value="wants">Wants</TabsTrigger>
          <TabsTrigger value="needs">Needs</TabsTrigger>
        </TabsList>
        <TabsContent value="wants">
          <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
            {wants.length > 0 ? wants.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onGoalUpdate={handleGoalUpdate} />
            )) : <EmptyState isWant={true} onAddGoal={handleAddGoal} />}
          </div>
        </TabsContent>
        <TabsContent value="needs">
          <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
            {needs.length > 0 ? needs.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onGoalUpdate={handleGoalUpdate} />
            )) : <EmptyState isWant={false} onAddGoal={handleAddGoal} />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
