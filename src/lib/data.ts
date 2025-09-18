import type { Task, Goal, HealthMetric, CycleInfo, AnasReflection } from './types';

export const mockTasks: Task[] = [];

export const mockGoals: Goal[] = [];

export const mockHealthMetrics: HealthMetric[] = [];

export const mockAnasReflection: AnasReflection = {
  myBehavior: '3',
  hisBehavior: '3',
  progressLog: '',
  plans: '',
};

export const mockCycleInfo: CycleInfo = {
  currentDay: 0,
  nextPeriodIn: 0,
  predictedDate: new Date(),
};
