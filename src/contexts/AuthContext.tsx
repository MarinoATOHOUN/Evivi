"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { removeAuthToken, saveAuthTokens } from '@/lib/auth';
import { User } from '@/lib/types';
import { getRecipes } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
    id: 1,
    username: 'Chef Hypee',
    email: 'chef@evivi.com',
    bio: 'Créateur de saveurs et passionné par la cuisine africaine. Bienvenue sur mon profil !',
    avatarUrl: getRecipes()[0].author.avatarUrl,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth status
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      setUser(mockUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        saveAuthTokens('mock-access-token', 'mock-refresh-token');
        setUser(mockUser);
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  const register = async (username: string, email: string, password: string) => {
    // Simulate API call
     return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };
  
  const refetchUser = () => {
    // No-op in mock mode
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
