/**
 * Authentication API Service
 * With FCM token support and single device login
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import apiClient, {setAuthTokens, clearAuthTokens, STORAGE_KEYS} from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  User,
  LoginResponse,
  RegisterData,
  AuthTokens,
} from '../../types/api';

// Get device info for tracking (simple version without external dependency)
const getDeviceInfo = (): string => {
  return `${Platform.OS} ${Platform.Version}`;
};

export const authApi = {
  /**
   * Send OTP to phone number
   */
  sendOtp: async (phone: string, purpose: 'login' | 'registration' = 'login') => {
    const response = await apiClient.post<ApiResponse<{phone: string; otp?: string}>>(
      ENDPOINTS.AUTH.SEND_OTP,
      {phone, purpose}
    );
    return response.data;
  },

  /**
   * Verify OTP
   */
  verifyOtp: async (phone: string, otp: string) => {
    const response = await apiClient.post<ApiResponse<{verified: boolean}>>(
      ENDPOINTS.AUTH.VERIFY_OTP,
      {phone, otp}
    );
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData & {fcmToken?: string}) => {
    const deviceInfo = getDeviceInfo();
    
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.AUTH.REGISTER,
      {
        ...data,
        deviceInfo,
      }
    );
    
    if (response.data.success && response.data.data) {
      const {tokens, user, sessionId} = response.data.data;
      await setAuthTokens(tokens.accessToken, tokens.refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      if (sessionId) {
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      }
    }
    
    return response.data;
  },

  /**
   * Login with phone and OTP
   */
  loginWithOtp: async (phone: string, otp: string, fcmToken?: string) => {
    const deviceInfo = getDeviceInfo();
    
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      {
        phone,
        otp,
        fcmToken,
        deviceInfo,
      }
    );
    
    if (response.data.success && response.data.data) {
      const {tokens, user, sessionId} = response.data.data;
      await setAuthTokens(tokens.accessToken, tokens.refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      if (sessionId) {
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      }
    }
    
    return response.data;
  },

  /**
   * Login with email and password
   */
  loginWithPassword: async (email: string, password: string, fcmToken?: string) => {
    const deviceInfo = getDeviceInfo();
    
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.AUTH.LOGIN_PASSWORD,
      {
        email,
        password,
        fcmToken,
        deviceInfo,
      }
    );
    
    if (response.data.success && response.data.data) {
      const {tokens, user, sessionId} = response.data.data;
      await setAuthTokens(tokens.accessToken, tokens.refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      if (sessionId) {
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      }
    }
    
    return response.data;
  },

  /**
   * Validate session - check if current session is still active
   */
  validateSession: async () => {
    try {
      const response = await apiClient.post<ApiResponse<{valid: boolean; reason?: string}>>(
        ENDPOINTS.AUTH.VALIDATE_SESSION
      );
      return response.data;
    } catch (error: any) {
      // If we get SESSION_TERMINATED error, return invalid
      if (error.response?.data?.code === 'SESSION_TERMINATED') {
        return {
          success: true,
          data: {
            valid: false,
            reason: 'SESSION_TERMINATED_ON_OTHER_DEVICE',
          },
        };
      }
      throw error;
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      ENDPOINTS.AUTH.REFRESH_TOKEN,
      {refreshToken}
    );
    
    if (response.data.success && response.data.data) {
      await setAuthTokens(
        response.data.data.accessToken,
        response.data.data.refreshToken
      );
    }
    
    return response.data;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse<{user: User; sessionId?: string}>>(
      ENDPOINTS.AUTH.ME
    );
    
    if (response.data.success && response.data.data) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(response.data.data.user)
      );
    }
    
    return response.data;
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {refreshToken});
    } catch (error) {
      // Continue with logout even if API call fails
      console.log('Logout API error:', error);
    } finally {
      await clearAuthTokens();
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    }
  },

  /**
   * Update FCM token
   */
  updateFcmToken: async (fcmToken: string) => {
    const response = await apiClient.post<ApiResponse<{subscribedTopics: string[]}>>(
      ENDPOINTS.AUTH.FCM_TOKEN,
      {fcmToken}
    );
    return response.data;
  },

  /**
   * Remove FCM token
   */
  removeFcmToken: async () => {
    const response = await apiClient.delete(ENDPOINTS.AUTH.FCM_TOKEN);
    return response.data;
  },

  /**
   * Get stored user from local storage
   */
  getStoredUser: async (): Promise<User | null> => {
    const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get stored session ID
   */
  getStoredSessionId: async (): Promise<string | null> => {
    return AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },
};

export default authApi;
