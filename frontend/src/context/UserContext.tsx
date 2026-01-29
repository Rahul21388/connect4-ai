import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData, getUser, createUser } from '../firebase/firestore';

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@connect4_username';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored username on app load
  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUsername) {
        const userData = await getUser(storedUsername);
        if (userData) {
          setUser(userData);
        } else {
          // User was deleted from Firebase, clear local storage
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error checking stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if user exists
      let userData = await getUser(username);
      
      if (!userData) {
        // Create new user
        userData = await createUser(username);
      }
      
      // Store username locally
      await AsyncStorage.setItem(USER_STORAGE_KEY, username);
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    if (user?.username) {
      const userData = await getUser(user.username);
      if (userData) {
        setUser(userData);
      }
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
const capitaliseWords = (text: string) => {
  return text
    .trim()
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
