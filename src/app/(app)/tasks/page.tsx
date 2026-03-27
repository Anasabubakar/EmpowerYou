'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Ellipsis, PlusCircle, Sparkles, Bell, BellOff, AlarmClock } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { toDate } from '@/lib/date-utils';

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
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(task.reminderEnabled));
  const [reminderAt, setReminderAt] = useState(task.reminderAt || '');

  useEffect(() => {
    setText(task.text);
    setReminderEnabled(Boolean(task.reminderEnabled));
    setReminderAt(task.reminderAt || '');
  }, [task]);

  const toLocalInputValue = (isoValue: string) => {
    if (!isoValue) return '';
    const date = new Date(isoValue);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const fromLocalInputValue = (value: string) => {
    if (!value) return '';
    return new Date(value).toISOString();
  };

  const handleSave = () => {
    onSave({
      ...task,
      text,
      reminderEnabled,
      reminderAt: reminderEnabled && reminderAt ? fromLocalInputValue(reminderAt) : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Keep it simple and clear.
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-reminder" className="text-right">
              Reminder
            </Label>
            <div className="col-span-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Switch
                  id="task-reminder"
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
                <span className="text-sm text-muted-foreground">Notify me</span>
              </div>
              <Input
                type="datetime-local"
                value={toLocalInputValue(reminderAt)}
                onChange={(e) => setReminderAt(e.target.value)}
                disabled={!reminderEnabled}
                className="sm:w-[220px]"
              />
            </div>
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
  const reminderLabel = useMemo(() => {
    if (!task.reminderEnabled || !task.reminderAt) return null;
    const date = toDate(task.reminderAt);
    return date ? date.toLocaleString() : null;
  }, [task.reminderEnabled, task.reminderAt]);

  const handlePriorityChange = (priority: string) => {
    onUpdate({ ...task, priority: priority as Task['priority'] });
  };

  const handleSaveEdit = (updatedTask: Task) => {
    onUpdate(updatedTask);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/70 p-4 transition-colors hover:bg-secondary/40">
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
        {reminderLabel && (
          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <AlarmClock className="h-3.5 w-3.5" />
            {reminderLabel}
          </span>
        )}
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
  const [newTaskReminderEnabled, setNewTaskReminderEnabled] = useState(false);
  const [newTaskReminderAt, setNewTaskReminderAt] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const reminderTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem('taskNotificationsEnabled');
    setNotificationsEnabled(stored === 'true');
  }, []);

  useEffect(() => {
    Object.values(reminderTimers.current).forEach((timerId) => clearTimeout(timerId));
    reminderTimers.current = {};

    if (!notificationsEnabled) return;
    if (typeof Notification === 'undefined') {
      toast({
        title: 'Notifications not supported',
        description: 'Your browser does not support notifications.',
        variant: 'destructive',
      });
      return;
    }
    if (Notification.permission === 'denied') {
      localStorage.setItem('taskNotificationsEnabled', 'false');
      setNotificationsEnabled(false);
      toast({
        title: 'Notifications blocked',
        description: 'Enable notifications in your browser settings to receive reminders.',
        variant: 'destructive',
      });
      return;
    }

    tasks.forEach((task) => {
      const reminderDate = toDate(task.reminderAt);
      if (!task.reminderEnabled || !reminderDate || task.completed) return;
      const remindAt = reminderDate.getTime();
      const delay = remindAt - Date.now();
      if (delay <= 0) return;
      const timerId = window.setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Task reminder', {
            body: task.text,
          });
        }
        toast({
          title: 'Task reminder',
          description: task.text,
        });
      }, delay);
      reminderTimers.current[task.id] = timerId;
    });
  }, [tasks, notificationsEnabled, toast]);

  const toLocalInputValue = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const fromLocalInputValue = (value: string) => {
    if (!value) return '';
    return new Date(value).toISOString();
  };

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') {
      toast({
        title: 'Notifications not supported',
        description: 'Your browser does not support notifications.',
        variant: 'destructive',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('taskNotificationsEnabled', 'true');
      setNotificationsEnabled(true);
      toast({
        title: 'Notifications enabled',
        description: 'You will receive task reminders.',
      });
    } else {
      localStorage.setItem('taskNotificationsEnabled', 'false');
      setNotificationsEnabled(false);
      toast({
        title: 'Notifications blocked',
        description: 'Enable notifications in your browser settings to receive reminders.',
        variant: 'destructive',
      });
    }
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newTaskItem: Task = {
        id: String(Date.now()),
        text: newTask.trim(),
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        reminderEnabled: newTaskReminderEnabled,
        reminderAt: newTaskReminderEnabled && newTaskReminderAt
          ? fromLocalInputValue(newTaskReminderAt)
          : null,
      };
      setTasks([newTaskItem, ...tasks]);
      setNewTask('');
      setNewTaskReminderEnabled(false);
      setNewTaskReminderAt('');
      toast({
        title: 'Task Added',
        description: `Added "${newTask.trim()}" to your list.`,
      });
      if (newTaskReminderEnabled && !notificationsEnabled) {
        toast({
          title: 'Reminder saved',
          description: 'Enable notifications to receive browser alerts.',
        });
      }
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
        title: 'One less thing to do',
        description: `You finished it. Well done.`,
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
  };

  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const upcomingReminders = useMemo(
    () =>
      tasks
        .filter((task) => task.reminderEnabled && task.reminderAt && !task.completed)
        .map((task) => ({ ...task, reminderAt: task.reminderAt as string }))
        .filter((task) => {
          const d = toDate(task.reminderAt);
          return d ? d.getTime() > Date.now() : false;
        })
        .sort((a, b) => (toDate(a.reminderAt)?.getTime() ?? 0) - (toDate(b.reminderAt)?.getTime() ?? 0))
        .slice(0, 3),
    [tasks]
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Focus
        </div>
        <h1 className="text-4xl font-headline font-semibold">Your Daily Tasks</h1>
        <p className="text-muted-foreground max-w-xl">
          Build a calm rhythm. One task at a time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>To-Do List</CardTitle>
          <CardDescription>
            {pendingTasks > 0
              ? `You have ${pendingTasks} things left today.`
              : 'All done. You can rest now.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Task Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get a browser reminder when a task is due.
                </p>
              </div>
              <Button
                variant={notificationsEnabled ? 'outline' : 'default'}
                size="sm"
                onClick={requestNotifications}
                className="gap-2"
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="text-sm font-semibold">Upcoming Reminders</p>
            <p className="text-xs text-muted-foreground">Your next scheduled nudges.</p>
            <div className="mt-3 space-y-2">
              {upcomingReminders.length > 0 ? (
                upcomingReminders.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="line-clamp-1">{task.text}</span>
                    <span className="text-xs text-muted-foreground">
                      {toDate(task.reminderAt) ? format(toDate(task.reminderAt)!, 'PPP p') : ''}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No reminders scheduled yet.</p>
              )}
            </div>
          </div>
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
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border/60 p-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={newTaskReminderEnabled}
                onCheckedChange={setNewTaskReminderEnabled}
                id="new-task-reminder"
              />
              <Label htmlFor="new-task-reminder" className="text-sm">
                Remind me about this task
              </Label>
            </div>
            <Input
              type="datetime-local"
              value={toLocalInputValue(newTaskReminderAt)}
              onChange={(e) => setNewTaskReminderAt(e.target.value)}
              disabled={!newTaskReminderEnabled}
              className="max-w-xs"
            />
          </div>
          <div className="space-y-3">
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
              <div className="text-center text-muted-foreground p-8 rounded-2xl border border-dashed">
                <p>Quiet space.</p>
                <p className="text-sm">Add a task to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
