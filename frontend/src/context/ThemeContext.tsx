import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  playerDisc: string;
  aiDisc: string;
  boardColor: string;
  boardSlot: string;
  success: string;
  error: string;
  warning: string;
}

const lightTheme: ThemeColors = {
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceLight: '#E2E8F0',
  primary: '#3B82F6',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#CBD5E1',
  playerDisc: '#EF4444',
  aiDisc: '#FBBF24',
  boardColor: '#1E40AF',
  boardSlot: '#1E3A5F',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
};

const darkTheme: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  primary: '#3B82F6',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  border: '#334155',
  playerDisc: '#EF4444',
  aiDisc: '#FBBF24',
  boardColor: '#1E40AF',
  boardSlot: '#1E3A5F',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
};

interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@connect4_theme';
const SOUND_STORAGE_KEY = '@connect4_sound';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const savedSound = await AsyncStorage.getItem(SOUND_STORAGE_KEY);
      
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleSound = async () => {
    const newSound = !soundEnabled;
    setSoundEnabled(newSound);
    try {
      await AsyncStorage.setItem(SOUND_STORAGE_KEY, newSound.toString());
    } catch (error) {
      console.error('Error saving sound setting:', error);
    }
  };

  const colors = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme, soundEnabled, toggleSound }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
