
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Task, Goal, HealthMetric, CycleInfo, DiaryEntry, AnasReflection } from '@/lib/types';
import { mockTasks, mockGoals, mockHealthMetrics, mockCycleInfo, mockAnasReflection } from '@/lib/data';

// Helper function to get initial state from localStorage
function getInitialState<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      // Special handling for dates inside Goal objects
      if (key === 'empoweryou-goals') {
        const parsed = JSON.parse(item);
        return parsed.map((goal: any) => ({
          ...goal,
          deadline: new Date(goal.deadline),
        })) as T;
      }
      // Special handling for dates inside CycleInfo object
      if (key === 'empoweryou-cycleInfo' && item) {
        const parsed = JSON.parse(item);
        return {
          ...parsed,
          predictedDate: new Date(parsed.predictedDate),
        } as T;
      }
      return JSON.parse(item);
    }
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
  }
  return defaultValue;
}


interface AppContextType {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  healthMetrics: HealthMetric[];
  setHealthMetrics: React.Dispatch<React.SetStateAction<HealthMetric[]>>;
  cycleInfo: CycleInfo;
  setCycleInfo: React.Dispatch<React.SetStateAction<CycleInfo>>;
  loggedSymptoms: string[];
  setLoggedSymptoms: React.Dispatch<React.SetStateAction<string[]>>;
  diaryEntries: DiaryEntry[];
  setDiaryEntries: React.Dispatch<React.SetStateAction<DiaryEntry[]>>;
  anasReflection: AnasReflection;
  setAnasReflection: React.Dispatch<React.SetStateAction<AnasReflection>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState<string>(() => getInitialState('empoweryou-userName', 'Rodeeyah'));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('empoweryou-tasks', mockTasks));
  const [goals, setGoals] = useState<Goal[]>(() => getInitialState('empoweryou-goals', mockGoals));
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(() => getInitialState('empoweryou-healthMetrics', mockHealthMetrics));
  const [cycleInfo, setCycleInfo] = useState<CycleInfo>(() => getInitialState('empoweryou-cycleInfo', mockCycleInfo));
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>(() => getInitialState('empoweryou-loggedSymptoms', []));
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => getInitialState('empoweryou-diaryEntries', []));
  const [anasReflection, setAnasReflection] = useState<AnasReflection>(() => getInitialState('empoweryou-anasReflection', mockAnasReflection));
  
  useEffect(() => {
    try {
      window.localStorage.setItem('empoweryou-userName', JSON.stringify(userName));
      window.localStorage.setItem('empoweryou-tasks', JSON.stringify(tasks));
      window.localStorage.setItem('empoweryou-goals', JSON.stringify(goals));
      window.localStorage.setItem('empoweryou-healthMetrics', JSON.stringify(healthMetrics));
      window.localStorage.setItem('empoweryou-cycleInfo', JSON.stringify(cycleInfo));
      window.localStorage.setItem('empoweryou-loggedSymptoms', JSON.stringify(loggedSymptoms));
      window.localStorage.setItem('empoweryou-diaryEntries', JSON.stringify(diaryEntries));
      window.localStorage.setItem('empoweryou-anasReflection', JSON.stringify(anasReflection));
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
    }
  }, [userName, tasks, goals, healthMetrics, cycleInfo, loggedSymptoms, diaryEntries, anasReflection]);


  return (
    <AppContext.Provider value={{
      userName, setUserName,
      tasks, setTasks,
      goals, setGoals,
      healthMetrics, setHealthMetrics,
      cycleInfo, setCycleInfo,
      loggedSymptoms, setLoggedSymptoms,
      diaryEntries, setDiaryEntries,
      anasReflection, setAnasReflection
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
