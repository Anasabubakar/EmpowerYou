
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemePalette =
  | 'classic'
  | 'blush'
  | 'emerald'
  | 'ocean'
  | 'amber'
  | 'slate';

export type ThemeMode = 'light' | 'dark';

const THEME_PALETTES: ThemePalette[] = [
  'classic',
  'blush',
  'emerald',
  'ocean',
  'amber',
  'slate',
];

interface ThemeContextType {
  palette: ThemePalette;
  mode: ThemeMode;
  setPalette: (palette: ThemePalette) => void;
  setMode: (mode: ThemeMode) => void;
  setTheme: (theme: { palette: ThemePalette; mode: ThemeMode }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [palette, setPalette] = useState<ThemePalette>('classic');
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const storedPalette = localStorage.getItem('themePalette') as ThemePalette | null;
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    const legacyTheme = localStorage.getItem('theme');
    const systemMode: ThemeMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    let nextPalette: ThemePalette = 'classic';
    let nextMode: ThemeMode = systemMode;

    if (storedPalette && THEME_PALETTES.includes(storedPalette)) {
      nextPalette = storedPalette;
    } else if (legacyTheme && THEME_PALETTES.includes(legacyTheme as ThemePalette)) {
      nextPalette = legacyTheme as ThemePalette;
    }

    if (storedMode === 'light' || storedMode === 'dark') {
      nextMode = storedMode;
    } else if (legacyTheme === 'light' || legacyTheme === 'dark') {
      nextMode = legacyTheme;
    }

    setPalette(nextPalette);
    setMode(nextMode);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = palette;
    document.documentElement.dataset.mode = mode;
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('themePalette', palette);
    localStorage.setItem('themeMode', mode);
  }, [palette, mode]);

  return (
    <ThemeContext.Provider
      value={{
        palette,
        mode,
        setPalette,
        setMode,
        setTheme: ({ palette: nextPalette, mode: nextMode }) => {
          setPalette(nextPalette);
          setMode(nextMode);
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
