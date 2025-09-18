'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Task, Goal, HealthMetric, CycleInfo, DiaryEntry, AnasReflection, ChatMessage } from '@/lib/types';
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
      if (key === 'goals' && item) {
        const parsed = JSON.parse(item);
        if (!Array.isArray(parsed)) return defaultValue;
        return parsed.map((goal: any) => ({
          ...goal,
          deadline: new Date(goal.deadline),
          createdAt: goal.createdAt ? goal.createdAt : new Date().toISOString(), // Fallback for old data
        })) as T;
      }
       // Special handling for dates inside Task objects
      if (key === 'tasks' && item) {
        const parsed = JSON.parse(item);
        if (!Array.isArray(parsed)) return defaultValue;
        return parsed.map((task: any) => ({
          ...task,
          createdAt: task.createdAt ? task.createdAt : new Date().toISOString(), // Fallback for old data
        })) as T;
      }
       // Special handling for dates inside HealthMetric objects
      if (key === 'healthMetrics' && item) {
        const parsed = JSON.parse(item);
        if (!Array.isArray(parsed)) return defaultValue;
        return parsed.map((metric: any) => ({
          ...metric,
          createdAt: metric.createdAt ? metric.createdAt : new Date().toISOString(), // Fallback for old data
        })) as T;
      }
      // Special handling for dates inside CycleInfo object
      if (key === 'cycleInfo' && item) {
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
  const [userName, setUserName] = useState<string>('');
  const [companionName, setCompanionName] = useState<string>('Companion');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo>(mockCycleInfo);
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [anasReflection, setAnasReflection] = useState<AnasReflection>(mockAnasReflection);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  // Load data from localStorage on initial client render
  useEffect(() => {
    setOnboarded(getInitialState('onboarded', false));
    setUserName(getInitialState('userName', ''));
    setCompanionName(getInitialState('companionName', 'Companion'));
    setTasks(getInitialState('tasks', mockTasks));
    setGoals(getInitialState('goals', mockGoals));
    setHealthMetrics(getInitialState('healthMetrics', mockHealthMetrics));
    setCycleInfo(getInitialState('cycleInfo', mockCycleInfo));
    setLoggedSymptoms(getInitialState('loggedSymptoms', []));
    setDiaryEntries(getInitialState('diaryEntries', []));
    setAnasReflection(getInitialState('anasReflection', mockAnasReflection));
    setChatHistory(getInitialState('chatHistory', []));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    // We don't want to save the initial undefined state
    if (onboarded === undefined) return;
    try {
      localStorage.setItem('onboarded', JSON.stringify(onboarded));
      localStorage.setItem('userName', userName);
      localStorage.setItem('companionName', companionName);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('goals', JSON.stringify(goals));
      localStorage.setItem('healthMetrics', JSON.stringify(healthMetrics));
      localStorage.setItem('cycleInfo', JSON.stringify(cycleInfo));
      localStorage.setItem('loggedSymptoms', JSON.stringify(loggedSymptoms));
      localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
      localStorage.setItem('anasReflection', JSON.stringify(anasReflection));
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
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
      chatHistory, setChatHistory,
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
