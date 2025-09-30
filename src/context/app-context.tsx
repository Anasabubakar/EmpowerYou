'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Task, Goal, HealthMetric, CycleInfo, DiaryEntry, AnasReflection, ChatMessage } from '@/lib/types';
import { mockTasks, mockGoals, mockHealthMetrics, mockCycleInfo, mockAnasReflection } from '@/lib/data';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Helper function to get initial state from localStorage for non-user-specific data
function getInitialState<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

interface AppContextType {
  authStatus: AuthStatus;
  user: User | null;
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  companionName: string;
  setCompanionName: (name: string) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  healthMetrics: HealthMetric[];
  setHealthMetrics: (metrics: HealthMetric[]) => void;
  cycleInfo: CycleInfo;
  setCycleInfo: (info: CycleInfo) => void;
  loggedSymptoms: string[];
  setLoggedSymptoms: (symptoms: string[]) => void;
  diaryEntries: DiaryEntry[];
  setDiaryEntries: (entries: DiaryEntry[]) => void;
  anasReflection: AnasReflection;
  setAnasReflection: (reflection: AnasReflection) => void;
  chatHistory: ChatMessage[];
  setChatHistory: (history: ChatMessage[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const [userName, setUserName] = useState<string>('');
  const [companionName, _setCompanionName] = useState<string>('Companion');
  const [tasks, _setTasks] = useState<Task[]>([]);
  const [goals, _setGoals] = useState<Goal[]>([]);
  const [healthMetrics, _setHealthMetrics] = useState<HealthMetric[]>([]);
  const [cycleInfo, _setCycleInfo] = useState<CycleInfo>(mockCycleInfo);
  const [loggedSymptoms, _setLoggedSymptoms] = useState<string[]>([]);
  const [diaryEntries, _setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [anasReflection, _setAnasReflection] = useState<AnasReflection>(mockAnasReflection);
  const [chatHistory, _setChatHistory] = useState<ChatMessage[]>([]);
  
  // Firestore data management
  const writeToDb = useCallback(debounce(async (userId: string, data: any) => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId), data);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  }, 1000), []);


  // --- Wrapped setters that write to Firestore ---
  const setTasks = (newTasks: Task[]) => { _setTasks(newTasks); if(user) writeToDb(user.uid, { tasks: newTasks }); };
  const setGoals = (newGoals: Goal[]) => { _setGoals(newGoals); if(user) writeToDb(user.uid, { goals: newGoals }); };
  const setHealthMetrics = (newMetrics: HealthMetric[]) => { _setHealthMetrics(newMetrics); if(user) writeToDb(user.uid, { healthMetrics: newMetrics }); };
  const setCycleInfo = (newInfo: CycleInfo) => { _setCycleInfo(newInfo); if(user) writeToDb(user.uid, { cycleInfo: JSON.parse(JSON.stringify(newInfo)) }); };
  const setLoggedSymptoms = (newSymptoms: string[]) => { _setLoggedSymptoms(newSymptoms); if(user) writeToDb(user.uid, { loggedSymptoms: newSymptoms }); };
  const setDiaryEntries = (newEntries: DiaryEntry[]) => { _setDiaryEntries(newEntries); if(user) writeToDb(user.uid, { diaryEntries: newEntries }); };
  const setAnasReflection = (newReflection: AnasReflection) => { _setAnasReflection(newReflection); if(user) writeToDb(user.uid, { anasReflection: newReflection }); };
  const setChatHistory = (newHistory: ChatMessage[]) => { _setChatHistory(newHistory); if(user) writeToDb(user.uid, { chatHistory: newHistory }); };
  const setCompanionName = (newName: string) => { 
    _setCompanionName(newName);
    if(user) writeToDb(user.uid, { companionName: newName }); 
    localStorage.setItem('companionName', newName); // Also save to local storage for consistency
  };
  

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthStatus('authenticated');
        // Load user data from Firestore
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.userName || currentUser.displayName || '');
          _setCompanionName(data.companionName || 'Companion');
          _setTasks(data.tasks || []);
          _setGoals((data.goals || []).map((g: any) => ({...g, deadline: new Date(g.deadline.seconds * 1000)})));
          _setHealthMetrics(data.healthMetrics || []);
          if(data.cycleInfo) {
            _setCycleInfo({ ...data.cycleInfo, predictedDate: new Date(data.cycleInfo.predictedDate.seconds * 1000), lastPeriodDate: data.cycleInfo.lastPeriodDate ? new Date(data.cycleInfo.lastPeriodDate.seconds * 1000) : undefined });
          } else {
             _setCycleInfo(mockCycleInfo);
          }
          _setLoggedSymptoms(data.loggedSymptoms || []);
          _setDiaryEntries(data.diaryEntries || []);
          _setAnasReflection(data.anasReflection || mockAnasReflection);
          _setChatHistory(data.chatHistory || []);
        } else {
          // If no doc, create one
          const initialData = {
            userName: currentUser.displayName || '',
            email: currentUser.email,
            createdAt: new Date().toISOString(),
            companionName: 'Companion',
            tasks: mockTasks,
            goals: mockGoals,
            healthMetrics: mockHealthMetrics,
            cycleInfo: JSON.parse(JSON.stringify(mockCycleInfo)),
            loggedSymptoms: [],
            diaryEntries: [],
            anasReflection: mockAnasReflection,
            chatHistory: [],
          };
          await setDoc(docRef, initialData);
          setUserName(initialData.userName);
          // Set local state with mock data
          _setCompanionName(initialData.companionName);
          _setTasks(initialData.tasks);
          _setGoals(initialData.goals);
          _setHealthMetrics(initialData.healthMetrics);
          _setCycleInfo(mockCycleInfo);
          _setLoggedSymptoms(initialData.loggedSymptoms);
          _setDiaryEntries(initialData.diaryEntries);
          _setAnasReflection(initialData.anasReflection);
          _setChatHistory(initialData.chatHistory);
        }
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
        // Reset state to defaults when logged out
        setUserName('');
        _setCompanionName('Companion');
        _setTasks([]);
        _setGoals([]);
        _setHealthMetrics([]);
        _setCycleInfo(mockCycleInfo);
        _setLoggedSymptoms([]);
        _setDiaryEntries([]);
        _setAnasReflection(mockAnasReflection);
        _setChatHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Use localStorage for non-sensitive, non-user specific data like companion name preference
  useEffect(() => {
    const savedCompanionName = getInitialState('companionName', 'Companion');
    _setCompanionName(savedCompanionName);
  }, []);
  
  return (
    <AppContext.Provider value={{
      authStatus, user,
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
