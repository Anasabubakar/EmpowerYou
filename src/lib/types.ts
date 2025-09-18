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

export type CycleInfo = {
  currentDay: number;
  nextPeriodIn: number;
  predictedDate: Date;
  lastPeriodDate?: Date;
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

export type AnasReflection = {
  myBehavior: string;
  hisBehavior: string;
  progressLog: string;
  plans: string;
};

export type DiaryEntry = {
  dailyRemark: string;
  diaryEntry: string;
  wantsNeedsProgress: string;
  mood: string;
  energyLevels: string;
  anasReflection: string;
};
