
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ellipsis, PlusCircle } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const priorityColors = {
  high: 'bg-red-200 text-red-800',
  medium: 'bg-yellow-200 text-yellow-800',
  low: 'bg-green-200 text-green-800',
};

const priorities: Task['priority'][] = ['low', 'medium', 'high'];

function EditTaskDialog({
  task,
  onSave,
  open,
  onOpenChange,
}: {
  task: Task;
  onSave: (updatedTask: Task) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [text, setText] = useState(task.text);

  const handleSave = () => {
    onSave({ ...task, text });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-text" className="text-right">
              Task
            </Label>
            <Input
              id="task-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (updatedTask: Task) => void;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handlePriorityChange = (priority: string) => {
    onUpdate({ ...task, priority: priority as Task['priority'] });
  };
  
  const handleSaveEdit = (updatedTask: Task) => {
    onUpdate(updatedTask);
    setIsEditDialogOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
        />
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            'flex-grow text-sm font-medium cursor-pointer break-words',
            task.completed && 'text-muted-foreground line-through'
          )}
        >
          {task.text}
        </label>
        <Badge
          variant="outline"
          className={cn(
            'hidden sm:inline-flex border-transparent capitalize',
            priorityColors[task.priority]
          )}
        >
          {task.priority}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Set Priority</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={task.priority}
                  onValueChange={handlePriorityChange}
                >
                  {priorities.map((p) => (
                    <DropdownMenuRadioItem key={p} value={p} className="capitalize">
                      {p}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <EditTaskDialog
        task={task}
        onSave={handleSaveEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}

export default function TaskManagerPage() {
  const { tasks, setTasks } = useAppContext();
  const { toast } = useToast();
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newTaskItem: Task = {
        id: String(Date.now()),
        text: newTask.trim(),
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
      };
      setTasks([newTaskItem, ...tasks]);
      setNewTask('');
      toast({
        title: 'Task Added',
        description: `Added "${newTask.trim()}" to your list.`,
      });
    }
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const completed = !task.completed;
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed } : t
      )
    );
    
    if (completed) {
      toast({
        title: 'One less thing to do!',
        description: `You are amazing for finishing that.`,
      });
    }
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((task) => task.id === id);
    setTasks(tasks.filter((task) => task.id !== id));
    if (taskToDelete) {
      toast({
        title: 'Task Removed',
        description: `Removed "${taskToDelete.text}" from your list.`,
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
     toast({
        title: 'Task Updated',
        description: `Your task has been updated.`,
      });
  }

  const pendingTasks = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Your Daily Tasks</h1>
        <p className="text-muted-foreground">
          Let's organize your day. You can handle anything.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>To-Do List</CardTitle>
          <CardDescription>
            {pendingTasks > 0
              ? `You have ${pendingTasks} more things to conquer. You've got this.`
              : "You've completed all your tasks! You're incredible! 🎉"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="What's next on your mind?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="flex-grow text-base"
            />
            <Button onClick={handleAddTask} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
          <div className="space-y-2">
             {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onUpdate={handleUpdateTask}
                  />
                ))
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    <p>It looks quiet here.</p>
                    <p className="text-sm">What's the first thing on your mind for today?</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
