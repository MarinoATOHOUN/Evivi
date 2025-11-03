"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { removeAuthToken, saveAuthTokens, getAuthToken } from '@/lib/auth';
import { User } from '@/lib/types';
import { getRecipes } from '@/lib/mock-data';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    const token = getAuthToken();
    if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
    }

    try {
        const userData = await api.get<{user: {id: number, email: string}, bio?: string, profile_picture?: string}>('/users/me/');
        const fullUser: User = {
          id: userData.user.id,
          username: userData.user.email.split('@')[0], // Placeholder, as API doesn't return username in /me/
          email: userData.user.email,
          bio: userData.bio,
          avatarUrl: userData.profile_picture || `https://picsum.photos/seed/${userData.user.id}/200/200`
        };
        setUser(fullUser);
    } catch (error) {
        console.error("Failed to fetch user", error);
        setUser(null);
        removeAuthToken(); // Clean up invalid token
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<{ access: string; refresh: string }>('/auth/login/', { email, password });
      saveAuthTokens(response.access, response.refresh);
      await fetchUser();
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to be caught in the component
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
        const response = await api.post('/auth/register/', { username, email, password });
        return response;
    } catch (error) {
        console.error('Registration failed:', error);
        throw error; // Re-throw to be caught in the component
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refetchUser: fetchUser }}>
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
