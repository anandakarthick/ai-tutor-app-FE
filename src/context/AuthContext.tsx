/**
 * Auth Context
 * Authentication state management with API integration
 * Supports E2E encryption, single device login and FCM token management
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {Alert, AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {
  authApi,
  STORAGE_KEYS,
  setSessionTerminatedCallback,
  initializeEncryption,
  getEncryptionStatus,
} from '../services/api';
import type {User, RegisterData} from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  sessionTerminated: boolean;
  encryptionReady: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  loginWithPassword: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  sendOtp: (phone: string, purpose?: 'login' | 'registration') => Promise<{success: boolean; otp?: string}>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  updateFcmToken: (token: string) => Promise<void>;
  updateLocalUser: (userData: Partial<User>) => void;
  clearSessionTerminated: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [sessionTerminated, setSessionTerminated] = useState(false);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const appState = useRef(AppState.currentState);

  // Handle session terminated from API client
  const handleSessionTerminated = useCallback(() => {
    console.log('[AuthContext] Session terminated - logging out');
    setSessionTerminated(true);
    setUser(null);
    setIsAuthenticated(false);
    
    Alert.alert(
      'Session Ended',
      'You have been logged out because you signed in on another device. Only one device can be active at a time.',
      [{text: 'OK', onPress: () => setSessionTerminated(false)}]
    );
  }, []);

  // Set the callback for session terminated
  useEffect(() => {
    setSessionTerminatedCallback(handleSessionTerminated);
  }, [handleSessionTerminated]);

  // Get FCM token
  const getFcmToken = async (): Promise<string | null> => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        console.log('[AuthContext] FCM Token:', token?.substring(0, 20) + '...');
        return token;
      }
      console.log('[AuthContext] FCM permission not granted');
      return null;
    } catch (error) {
      console.log('[AuthContext] FCM token error:', error);
      return null;
    }
  };

  // Initialize encryption and check auth on mount
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Step 1: Initialize E2E encryption
      console.log('[AuthContext] Initializing E2E encryption...');
      const encryptionSuccess = await initializeEncryption();
      setEncryptionReady(encryptionSuccess);
      
      const status = getEncryptionStatus();
      console.log('[AuthContext] Encryption status:', status);
      
      // Step 2: Check authentication
      await checkAuth();
    } catch (error) {
      console.log('[AuthContext] Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle app state changes - validate session when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      isAuthenticated
    ) {
      console.log('[AuthContext] App came to foreground - validating session');
      try {
        const response = await authApi.validateSession();
        if (response.success && response.data && !response.data.valid) {
          handleSessionTerminated();
        }
      } catch (error) {
        console.log('[AuthContext] Session validation error:', error);
      }
    }
    appState.current = nextAppState;
  };

  const checkAuth = async () => {
    try {
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
        } catch (error: any) {
          if (error.response?.data?.code === 'SESSION_TERMINATED') {
            handleSessionTerminated();
          } else {
            console.log('Failed to refresh user:', error);
          }
        }
      }
    } catch (error) {
      console.log('Auth check error:', error);
    }
  };

  const sendOtp = useCallback(
    async (phone: string, purpose: 'login' | 'registration' = 'login') => {
      try {
        const response = await authApi.sendOtp(phone, purpose);
        if (response.success) {
          return {success: true, otp: response.data?.otp};
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
      return false;
    }
  }, []);

  const login = useCallback(async (phone: string, otp: string) => {
    try {
      // Get FCM token before login
      const fcmToken = await getFcmToken();
      
      const response = await authApi.loginWithOtp(phone, otp, fcmToken || undefined);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        if (response.data.previousSessionTerminated) {
          console.log('[AuthContext] Previous session was terminated');
        }
        
        return true;
      }
      return false;
    } catch (error: any) {
      console.log('Login error:', error);
      
      const errorCode = error.response?.data?.code || '';
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      const customError = new Error(errorMessage);
      (customError as any).code = errorCode;
      
      throw customError;
    }
  }, []);

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      try {
        const fcmToken = await getFcmToken();
        
        const response = await authApi.loginWithPassword(email, password, fcmToken || undefined);
        if (response.success && response.data) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          
          if (response.data.previousSessionTerminated) {
            console.log('[AuthContext] Previous session was terminated');
          }
          
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
      const fcmToken = await getFcmToken();
      
      const response = await authApi.register({...data, fcmToken: fcmToken || undefined});
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
      setSessionTerminated(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      console.log('[AuthContext] Refreshing user data...');
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        console.log('[AuthContext] User refreshed:', response.data.user);
        setUser(response.data.user);
      }
    } catch (error: any) {
      console.log('[AuthContext] Refresh user error:', error);
      if (error.response?.data?.code === 'SESSION_TERMINATED') {
        handleSessionTerminated();
      }
    }
  }, [handleSessionTerminated]);

  const updateLocalUser = useCallback((userData: Partial<User>) => {
    console.log('[AuthContext] Updating local user:', userData);
    setUser(prev => prev ? {...prev, ...userData} : null);
  }, []);

  const updateFcmToken = useCallback(async (token: string) => {
    try {
      await authApi.updateFcmToken(token);
      await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
    } catch (error) {
      console.log('Update FCM token error:', error);
    }
  }, []);

  const clearSessionTerminated = useCallback(() => {
    setSessionTerminated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        sessionTerminated,
        encryptionReady,
        login,
        loginWithPassword,
        register,
        logout,
        sendOtp,
        verifyOtp,
        refreshUser,
        updateFcmToken,
        updateLocalUser,
        clearSessionTerminated,
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
