export type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  reminderAt?: string | null;
  reminderEnabled?: boolean;
};

export type Goal = {
  id: string;
  title: string;
  category: 'want' | 'need';
  progress: number;
  deadline: Date;
  description?: string;
  createdAt: string;
};

export type CycleInfo = {
  currentDay: number;
  nextPeriodIn: number;
  predictedDate: Date;
  lastPeriodDate?: Date;
  lastPeriodEndDate?: Date;
};

export type HealthMetric = {
  date: string;
  mood: number;
  energy: number;
  sleepHours?: number;
  waterIntake?: number;
  steps?: number;
  stressLevel?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  createdAt: string;
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
  supportMoment: string;
  needs: string;
  plans: string;
};

export type DiaryEntry = {
  dailyRemark: string;
  diaryEntry: string;
  gratitude: string;
  challenge: string;
  tomorrowFocus: string;
  wantsNeedsProgress: string;
  mood: string;
  energyLevels: string;
  partnerReflection: string;
  createdAt: string;
};

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};
