/**
 * Auth Context
 * Authentication state management with API integration
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi, STORAGE_KEYS} from '../services/api';
import type {User, RegisterData} from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (phone: string, otp: string) => Promise<boolean>;
  loginWithPassword: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  sendOtp: (phone: string, purpose?: 'login' | 'registration') => Promise<{success: boolean; otp?: string}>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  updateFcmToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = await authApi.getStoredUser();
      
      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
        
        // Refresh user data from server
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.log('Failed to refresh user:', error);
        }
      }
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = useCallback(
    async (phone: string, purpose: 'login' | 'registration' = 'login') => {
      try {
        const response = await authApi.sendOtp(phone, purpose);
        if (response.success) {
          return {success: true, otp: response.data?.otp}; // OTP returned only in dev mode
        }
        return {success: false};
      } catch (error: any) {
        console.log('Send OTP error:', error);
        Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
        return {success: false};
      }
    },
    []
  );

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    try {
      const response = await authApi.verifyOtp(phone, otp);
      return response.success && response.data?.verified;
    } catch (error: any) {
      console.log('Verify OTP error:', error);
      // Don't show alert here - let the screen handle it
      return false;
    }
  }, []);

  const login = useCallback(async (phone: string, otp: string) => {
    try {
      const response = await authApi.loginWithOtp(phone, otp);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error: any) {
      console.log('Login error:', error);
      
      // Extract error info
      const errorCode = error.response?.data?.code || '';
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      // Create custom error with code attached
      const customError = new Error(errorMessage);
      (customError as any).code = errorCode;
      
      // Throw error so screen can handle it
      // This includes USER_NOT_FOUND, INVALID_OTP, OTP_EXPIRED, etc.
      throw customError;
    }
  }, []);

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await authApi.loginWithPassword(email, password);
        if (response.success && response.data) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          return true;
        }
        return false;
      } catch (error: any) {
        console.log('Login error:', error);
        Alert.alert(
          'Login Failed',
          error.response?.data?.message || 'Invalid email or password'
        );
        return false;
      }
    },
    []
  );

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error: any) {
      console.log('Register error:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Could not create account'
      );
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('Refresh user error:', error);
    }
  }, []);

  const updateFcmToken = useCallback(async (token: string) => {
    try {
      await authApi.updateFcmToken(token);
    } catch (error) {
      console.log('Update FCM token error:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        loginWithPassword,
        register,
        logout,
        sendOtp,
        verifyOtp,
        refreshUser,
        updateFcmToken,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
