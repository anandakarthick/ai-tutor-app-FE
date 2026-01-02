/**
 * API Client with E2E Encryption
 * Axios instance with automatic encryption/decryption for all API calls
 */

import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG, ENDPOINTS} from './config';
import encryptionService from '../EncryptionService';

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@ai_tutor_access_token',
  REFRESH_TOKEN: '@ai_tutor_refresh_token',
  USER: '@ai_tutor_user',
  STUDENT: '@ai_tutor_current_student',
  SESSION_ID: '@ai_tutor_session_id',
  FCM_TOKEN: '@ai_tutor_fcm_token',
  ENCRYPTION_ENABLED: '@ai_tutor_encryption_enabled',
};

// Session terminated callback
let onSessionTerminated: (() => void) | null = null;

export const setSessionTerminatedCallback = (callback: () => void) => {
  onSessionTerminated = callback;
};

// Encryption state
let isEncryptionEnabled = true; // Enable by default
let isHandshakeComplete = false;
let serverPublicKey: string | null = null;

// Endpoints that should NOT be encrypted (public endpoints)
const UNENCRYPTED_ENDPOINTS = [
  '/auth/handshake',
  '/auth/public-key',
];

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

/**
 * Initialize encryption and perform handshake with server
 */
export const initializeEncryption = async (): Promise<boolean> => {
  try {
    console.log('🔐 Initializing E2E encryption...');
    
    // Initialize encryption service
    await encryptionService.initialize();
    
    if (!encryptionService.isReady()) {
      console.warn('⚠️ Encryption service failed to initialize');
      isEncryptionEnabled = false;
      return false;
    }

    // Perform handshake with server
    const clientPublicKey = encryptionService.getPublicKey();
    
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.HANDSHAKE}`,
      { clientPublicKey }
    );

    if (response.data.success && response.data.data) {
      serverPublicKey = response.data.data.serverPublicKey;
      isEncryptionEnabled = response.data.data.encryptionEnabled !== false;
      
      if (serverPublicKey) {
        await encryptionService.setServerPublicKey(serverPublicKey);
      }
      
      isHandshakeComplete = true;
      await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTION_ENABLED, isEncryptionEnabled ? 'true' : 'false');
      
      console.log(`✅ E2E encryption ${isEncryptionEnabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('⚠️ E2E handshake failed, continuing without encryption:', error);
    isEncryptionEnabled = false;
    return false;
  }
};

/**
 * Check if endpoint should be encrypted
 */
const shouldEncryptEndpoint = (url: string): boolean => {
  if (!isEncryptionEnabled || !isHandshakeComplete) return false;
  return !UNENCRYPTED_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

/**
 * Encrypt request data
 */
const encryptRequestData = (data: any): any => {
  if (!encryptionService.isReady() || !encryptionService.hasServerKey()) {
    return data;
  }
  
  try {
    const encryptedPayload = encryptionService.encryptObject(data);
    return {
      encrypted: true,
      payload: encryptedPayload,
    };
  } catch (error) {
    console.error('Request encryption failed:', error);
    return data;
  }
};

/**
 * Decrypt response data
 */
const decryptResponseData = (data: any): any => {
  if (!data?.encrypted || !data?.payload) {
    return data;
  }
  
  if (!encryptionService.isReady()) {
    console.warn('Cannot decrypt: encryption not ready');
    return data;
  }
  
  try {
    return encryptionService.decryptObject(data.payload);
  } catch (error) {
    console.error('Response decryption failed:', error);
    return data;
  }
};

// Request interceptor - Add auth token and encrypt
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Encrypt request body if applicable
    const url = config.url || '';
    if (config.data && shouldEncryptEndpoint(url) && config.method !== 'get') {
      if (__DEV__) {
        console.log(`🔐 Encrypting request: ${config.method?.toUpperCase()} ${url}`);
      }
      config.data = encryptRequestData(config.data);
      config.headers['X-Encryption-Enabled'] = 'true';
    }
    
    if (__DEV__) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Decrypt and handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    }
    
    // Decrypt response if encrypted
    if (response.data?.encrypted) {
      if (__DEV__) {
        console.log(`🔓 Decrypting response: ${response.config.url}`);
      }
      response.data = decryptResponseData(response.data);
    }
    
    return response;
  },
  async (error: AxiosError<{code?: string; message?: string; encrypted?: boolean; payload?: any}>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean};

    if (__DEV__) {
      console.log(`❌ API Error: ${originalRequest?.url} - ${error.response?.status}`);
      console.log('Error details:', error.response?.data);
    }

    // Decrypt error response if encrypted
    if (error.response?.data?.encrypted) {
      error.response.data = decryptResponseData(error.response.data);
    }

    // Handle SESSION_TERMINATED
    if (error.response?.status === 401 && error.response?.data?.code === 'SESSION_TERMINATED') {
      console.log('🚫 Session terminated - logged in on another device');
      
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.STUDENT,
        STORAGE_KEYS.SESSION_ID,
      ]);
      
      if (onSessionTerminated) {
        onSessionTerminated();
      }
      
      return Promise.reject(error);
    }

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      const skipRefreshCodes = ['SESSION_TERMINATED', 'INVALID_TOKEN', 'NO_TOKEN'];
      if (skipRefreshCodes.includes(error.response?.data?.code || '')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
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

        let responseData = response.data;
        if (responseData.encrypted) {
          responseData = decryptResponseData(responseData);
        }

        const {accessToken, refreshToken: newRefreshToken} = responseData.data;
        
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        
        if (refreshError.response?.data?.code === 'SESSION_TERMINATED') {
          if (onSessionTerminated) {
            onSessionTerminated();
          }
        }
        
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

// Helper functions
export const setAuthTokens = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

export const clearAuthTokens = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER,
    STORAGE_KEYS.STUDENT,
    STORAGE_KEYS.SESSION_ID,
  ]);
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  return !!token;
};

export const isEncryptionReady = (): boolean => {
  return isEncryptionEnabled && isHandshakeComplete && encryptionService.isReady();
};

export const getEncryptionStatus = () => ({
  enabled: isEncryptionEnabled,
  handshakeComplete: isHandshakeComplete,
  serviceReady: encryptionService.isReady(),
  hasServerKey: encryptionService.hasServerKey(),
});

export default apiClient;
