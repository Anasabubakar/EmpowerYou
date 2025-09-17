export type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
};

export type Goal = {
  id: string;
  title: string;
  category: 'want' | 'need';
  progress: number;
  deadline: Date;
  description?: string;
};

export type HealthMetric = {
  date: string;
  mood: number;
  energy: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
};

export type CycleLog = {
  startDate: Date;
  endDate: Date;
  symptoms: string[];
};
