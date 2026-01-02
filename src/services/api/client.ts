/**
 * API Client
 * Axios instance with interceptors for authentication
 * Supports single device login with session management
 */

import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG, ENDPOINTS} from './config';

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@ai_tutor_access_token',
  REFRESH_TOKEN: '@ai_tutor_refresh_token',
  USER: '@ai_tutor_user',
  STUDENT: '@ai_tutor_current_student',
  SESSION_ID: '@ai_tutor_session_id',
  FCM_TOKEN: '@ai_tutor_fcm_token',
};

// Session terminated callback - set by AuthContext
let onSessionTerminated: (() => void) | null = null;

export const setSessionTerminatedCallback = (callback: () => void) => {
  onSessionTerminated = callback;
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in dev mode
    if (__DEV__) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and session termination
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error: AxiosError<{code?: string; message?: string}>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean};

    if (__DEV__) {
      console.log(`❌ API Error: ${originalRequest?.url} - ${error.response?.status}`);
      console.log('Error details:', error.response?.data);
    }

    // Handle SESSION_TERMINATED - User logged in on another device
    if (error.response?.status === 401 && error.response?.data?.code === 'SESSION_TERMINATED') {
      console.log('🚫 Session terminated - logged in on another device');
      
      // Clear all auth data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.STUDENT,
        STORAGE_KEYS.SESSION_ID,
      ]);
      
      // Notify the app about session termination
      if (onSessionTerminated) {
        onSessionTerminated();
      }
      
      return Promise.reject(error);
    }

    // Handle 401 - Token expired (not session terminated)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for certain error codes
      const skipRefreshCodes = ['SESSION_TERMINATED', 'INVALID_TOKEN', 'NO_TOKEN'];
      if (skipRefreshCodes.includes(error.response?.data?.code || '')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for token refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {refreshToken}
        );

        const {accessToken, refreshToken: newRefreshToken} = response.data.data;
        
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        
        // Check if refresh failed due to session termination
        if (refreshError.response?.data?.code === 'SESSION_TERMINATED') {
          if (onSessionTerminated) {
            onSessionTerminated();
          }
        }
        
        // Clear all auth data
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
          STORAGE_KEYS.STUDENT,
          STORAGE_KEYS.SESSION_ID,
        ]);
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper to set auth tokens
export const setAuthTokens = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

// Helper to clear auth tokens
export const clearAuthTokens = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER,
    STORAGE_KEYS.STUDENT,
    STORAGE_KEYS.SESSION_ID,
  ]);
};

// Helper to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  return !!token;
};

export default apiClient;
