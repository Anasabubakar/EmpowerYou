
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Task, Goal, HealthMetric, CycleInfo, DiaryEntry, AnasReflection, ChatMessage, User } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Loading from '@/app/(app)/loading';

// Helper function to get a dynamic storage key
const getStorageKey = (baseKey: string, user: User | null): string => {
  if (user) {
    return `empoweryou-${user.uid}-${baseKey}`;
  }
  return `empoweryou-anonymous-${baseKey}`;
};


// Helper function to get initial state from localStorage
function getInitialState<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
        // Special handling for dates inside Goal objects
      if (key.includes('-goals') && item) {
        const parsed = JSON.parse(item);
        if (!Array.isArray(parsed)) return defaultValue;
        return parsed.map((goal: any) => ({
          ...goal,
          deadline: new Date(goal.deadline),
          createdAt: goal.createdAt ? goal.createdAt : new Date().toISOString(), // Fallback for old data
        })) as T;
      }
       // Special handling for dates inside Task objects
      if (key.includes('-tasks') && item) {
        const parsed = JSON.parse(item);
        if (!Array.isArray(parsed)) return defaultValue;
        return parsed.map((task: any) => ({
          ...task,
          createdAt: task.createdAt ? task.createdAt : new Date().toISOString(), // Fallback for old data
        })) as T;
      }
       // Special handling for dates inside HealthMetric objects
      if (key.includes('-healthMetrics') && item) {
        const parsed = JSON.parse(item);
        if (!Array.isArray(parsed)) return defaultValue;
        return parsed.map((metric: any) => ({
          ...metric,
          createdAt: metric.createdAt ? metric.createdAt : new Date().toISOString(), // Fallback for old data
        })) as T;
      }
      // Special handling for dates inside CycleInfo object
      if (key.includes('-cycleInfo') && item) {
        const parsed = JSON.parse(item);
        if (!parsed.lastPeriodDate) {
          return {
            ...parsed,
            predictedDate: new Date(parsed.predictedDate),
            lastPeriodDate: undefined,
          } as T;
        }
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
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [onboarded, setOnboarded] = useState<boolean | undefined>(undefined);
  const [userName, setUserName] = useState<string>('');
  const [companionName, setCompanionName] = useState<string>('Companion');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo>(initialCycleInfo);
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [anasReflection, setAnasReflection] = useState<AnasReflection>(initialAnasReflection);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Effect for auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  // Effect to load data from localStorage when user or authLoading state changes
  useEffect(() => {
    if (authLoading) return;

    const onboardedKey = getStorageKey('onboarded', user);
    setOnboarded(getInitialState(onboardedKey, false));
    setUserName(user?.displayName || '');
    setCompanionName(getInitialState(getStorageKey('companionName', user), 'Companion'));
    setTasks(getInitialState(getStorageKey('tasks', user), []));
    setGoals(getInitialState(getStorageKey('goals', user), []));
    setHealthMetrics(getInitialState(getStorageKey('healthMetrics', user), []));
    setCycleInfo(getInitialState(getStorageKey('cycleInfo', user), initialCycleInfo));
    setLoggedSymptoms(getInitialState(getStorageKey('loggedSymptoms', user), []));
    setDiaryEntries(getInitialState(getStorageKey('diaryEntries', user), []));
    setAnasReflection(getInitialState(getStorageKey('anasReflection', user), initialAnasReflection));
    setChatHistory(getInitialState(getStorageKey('chatHistory', user), []));
  }, [user, authLoading]);
  
  // Effect to save data to localStorage whenever it changes
  useEffect(() => {
    if (authLoading) return;

    try {
      if (onboarded !== undefined) {
        window.localStorage.setItem(getStorageKey('onboarded', user), JSON.stringify(onboarded));
      }
      window.localStorage.setItem(getStorageKey('companionName', user), companionName);
      window.localStorage.setItem(getStorageKey('tasks', user), JSON.stringify(tasks));
      window.localStorage.setItem(getStorageKey('goals', user), JSON.stringify(goals));
      window.localStorage.setItem(getStorageKey('healthMetrics', user), JSON.stringify(healthMetrics));
      window.localStorage.setItem(getStorageKey('cycleInfo', user), JSON.stringify(cycleInfo));
      window.localStorage.setItem(getStorageKey('loggedSymptoms', user), JSON.stringify(loggedSymptoms));
      window.localStorage.setItem(getStorageKey('diaryEntries', user), JSON.stringify(diaryEntries));
      window.localStorage.setItem(getStorageKey('anasReflection', user), JSON.stringify(anasReflection));
      window.localStorage.setItem(getStorageKey('chatHistory', user), JSON.stringify(chatHistory));
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
    }
  }, [user, authLoading, onboarded, companionName, tasks, goals, healthMetrics, cycleInfo, loggedSymptoms, diaryEntries, anasReflection, chatHistory]);

  if (authLoading) {
    return <Loading />;
  }

  return (
    <AppContext.Provider value={{
      user,
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
