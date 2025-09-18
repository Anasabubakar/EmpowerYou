
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Task, Goal, HealthMetric, CycleInfo, DiaryEntry, AnasReflection, ChatMessage } from '@/lib/types';

// Helper function to get initial state from localStorage
function getInitialState<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      if (key === 'empoweryou-onboarded') {
        return JSON.parse(item) as T;
      }
      // Special handling for dates inside Goal objects
      if (key === 'empoweryou-goals' && item) {
        const parsed = JSON.parse(item);
        if (!Array.isArray(parsed)) return defaultValue;
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
          lastPeriodDate: parsed.lastPeriodDate ? new Date(parsed.lastPeriodDate) : undefined,
        } as T;
      }
      return JSON.parse(item);
    }
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
  }
  return defaultValue;
}

const initialCycleInfo: CycleInfo = {
  currentDay: 0,
  nextPeriodIn: 0,
  predictedDate: new Date(),
};

const initialAnasReflection: AnasReflection = {
  myBehavior: '3',
  hisBehavior: '3',
  progressLog: '',
  plans: '',
};

interface AppContextType {
  onboarded?: boolean;
  setOnboarded: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  companionName: string;
  setCompanionName: React.Dispatch<React.SetStateAction<string>>;
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
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [onboarded, setOnboarded] = useState<boolean | undefined>(undefined);
  const [userName, setUserName] = useState<string>(() => getInitialState('empoweryou-userName', ''));
  const [companionName, setCompanionName] = useState<string>(() => getInitialState('empoweryou-companionName', 'Alex'));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('empoweryou-tasks', []));
  const [goals, setGoals] = useState<Goal[]>(() => getInitialState('empoweryou-goals', []));
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(() => getInitialState('empoweryou-healthMetrics', []));
  const [cycleInfo, setCycleInfo] = useState<CycleInfo>(() => getInitialState('empoweryou-cycleInfo', initialCycleInfo));
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>(() => getInitialState('empoweryou-loggedSymptoms', []));
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => getInitialState('empoweryou-diaryEntries', []));
  const [anasReflection, setAnasReflection] = useState<AnasReflection>(() => getInitialState('empoweryou-anasReflection', initialAnasReflection));
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => getInitialState('empoweryou-chatHistory', []));
  
  useEffect(() => {
    const storedOnboarded = getInitialState('empoweryou-onboarded', false);
    setOnboarded(storedOnboarded);
  }, []);

  useEffect(() => {
    try {
      if (onboarded !== undefined) {
        window.localStorage.setItem('empoweryou-onboarded', JSON.stringify(onboarded));
      }
      window.localStorage.setItem('empoweryou-userName', JSON.stringify(userName));
      window.localStorage.setItem('empoweryou-companionName', JSON.stringify(companionName));
      window.localStorage.setItem('empoweryou-tasks', JSON.stringify(tasks));
      window.localStorage.setItem('empoweryou-goals', JSON.stringify(goals));
      window.localStorage.setItem('empoweryou-healthMetrics', JSON.stringify(healthMetrics));
      window.localStorage.setItem('empoweryou-cycleInfo', JSON.stringify(cycleInfo));
      window.localStorage.setItem('empoweryou-loggedSymptoms', JSON.stringify(loggedSymptoms));
      window.localStorage.setItem('empoweryou-diaryEntries', JSON.stringify(diaryEntries));
      window.localStorage.setItem('empoweryou-anasReflection', JSON.stringify(anasReflection));
      window.localStorage.setItem('empoweryou-chatHistory', JSON.stringify(chatHistory));
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
    }
  }, [onboarded, userName, companionName, tasks, goals, healthMetrics, cycleInfo, loggedSymptoms, diaryEntries, anasReflection, chatHistory]);


  return (
    <AppContext.Provider value={{
      onboarded, setOnboarded,
      userName, setUserName,
      companionName, setCompanionName,
      tasks, setTasks,
      goals, setGoals,
      healthMetrics, setHealthMetrics,
      cycleInfo, setCycleInfo,
      loggedSymptoms, setLoggedSymptoms,
      diaryEntries, setDiaryEntries,
      anasReflection, setAnasReflection,
      chatHistory, setChatHistory
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
