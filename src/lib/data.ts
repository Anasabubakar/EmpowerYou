import type { Task, Goal, HealthMetric, CycleInfo, AnasReflection } from './types';

export const mockTasks: Task[] = [
  { id: '1', text: 'Finish project proposal', completed: false, priority: 'high' },
  { id: '2', text: 'Go for a 30-min run', completed: true, priority: 'medium' },
  { id: '3', text: 'Read a chapter of a book', completed: false, priority: 'low' },
  { id: '4', text: 'Schedule a dentist appointment', completed: false, priority: 'medium' },
];

export const mockGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Learn to play the guitar',
    category: 'want',
    progress: 25,
    deadline: new Date(new Date().setDate(new Date().getDate() + 90)),
    description: 'Practice for 30 minutes every day.',
  },
  {
    id: 'g2',
    title: 'Get 8 hours of sleep per night',
    category: 'need',
    progress: 70,
    deadline: new Date(new Date().setDate(new Date().getDate() + 30)),
    description: 'Maintain a consistent sleep schedule.',
  },
  {
    id: 'g3',
    title: 'Save $500 for a vacation',
    category: 'want',
    progress: 50,
    deadline: new Date(new Date().setDate(new Date().getDate() + 120)),
    description: 'Set aside $50 from each paycheck.',
  },
];

export const mockHealthMetrics: HealthMetric[] = [
  { date: '7 days ago', mood: 3, energy: 4 },
  { date: '6 days ago', mood: 4, energy: 3 },
  { date: '5 days ago', mood: 5, energy: 5 },
  { date: '4 days ago', mood: 3, energy: 2 },
  { date: '3 days ago', mood: 4, energy: 4 },
  { date: '2 days ago', mood: 2, energy: 3 },
  { date: 'Yesterday', mood: 5, energy: 5 },
];

export const mockAnasReflection: AnasReflection = {
  myBehavior: '4',
  hisBehavior: '5',
  progressLog: 'Had a very productive conversation about future plans.',
  plans: 'Continue to be open and honest in our communication.',
};

export const mockCycleInfo: CycleInfo = {
  currentDay: 14,
  nextPeriodIn: 14,
  predictedDate: new Date(new Date().setDate(new Date().getDate() + 14)),
};
