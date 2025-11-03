"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { getAuthToken, saveAuthTokens, removeAuthToken, isTokenExpired } from '@/lib/auth';
import { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const profileData = await api.get<{user: User, bio: string, profile_picture: string | null}>('/users/me/');
      setUser({
        id: profileData.user.id,
        username: profileData.user.username,
        email: profileData.user.email,
        bio: profileData.bio,
        avatarUrl: profileData.profile_picture || `https://picsum.photos/seed/${profileData.user.id}/200/200`
      });
    } catch (error) {
      console.error('Failed to fetch user', error);
      removeAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  
  const refetchUser = () => {
    fetchUser();
  };

  const login = async (email: string, password: string) => {
    try {
      const { access, refresh } = await api.post<{ access: string, refresh: string }>('/auth/login/', { email, password });
      saveAuthTokens(access, refresh);
      await fetchUser();
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await api.post('/auth/register/', { username, email, password });
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
              </div>
          </div>
        </div>
    );
  }


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
