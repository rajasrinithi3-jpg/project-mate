import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; department: string; year: string }) => Promise<User>;
  logout: () => Promise<void>;
  quickSwitch: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      clearStoredToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setStoredToken(res.token);
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    department: string;
    year: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setStoredToken(res.token);
      setUser(res.user);
      success('Account created successfully! Welcome to ProjectMate.');
      return res.user;
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      clearStoredToken();
      setUser(null);
      success('Signed out successfully.');
    }
  };

  const quickSwitch = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await api.quickSwitchUser(userId);
      setStoredToken(res.token);
      setUser(res.user);
      success(`Switched account to ${res.user.name}`);
    } catch (err: any) {
      error(err.message || 'Quick switch failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!user) throw new Error('Not logged in');
    try {
      const res = await api.updateProfile(user.id, updates);
      setUser(res.user);
      success('Profile updated successfully.');
      return res.user;
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        quickSwitch,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
