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
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Ellipsis, PlusCircle } from 'lucide-react';
import { mockTasks } from '@/lib/data';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

const priorityColors = {
  high: 'bg-red-200 text-red-800',
  medium: 'bg-yellow-200 text-yellow-800',
  low: 'bg-green-200 text-green-800',
};

function TaskItem({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary">
      <Checkbox id={`task-${task.id}`} checked={task.completed} />
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          'flex-grow text-sm font-medium',
          task.completed && 'text-muted-foreground line-through'
        )}
      >
        {task.text}
      </label>
      <Badge
        className={cn(
          'hidden sm:inline-flex',
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
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Set Priority</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function TaskManagerPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newTaskItem: Task = {
        id: String(Date.now()),
        text: newTask.trim(),
        completed: false,
        priority: 'medium',
      };
      setTasks([newTaskItem, ...tasks]);
      setNewTask('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Task Manager</h1>
        <p className="text-muted-foreground">
          Organize your day and stay on top of your responsibilities.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>To-Do List</CardTitle>
          <CardDescription>
            You have {tasks.filter((t) => !t.completed).length} pending tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' &amp;&amp; handleAddTask()}
            />
            <Button onClick={handleAddTask}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
