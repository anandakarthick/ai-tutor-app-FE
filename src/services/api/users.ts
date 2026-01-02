/**
 * Users API Service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, {STORAGE_KEYS} from './client';
import {ENDPOINTS} from './config';
import type {ApiResponse, User} from '../../types/api';

export const usersApi = {
  /**
   * Get user by ID
   */
  getById: async (id: string) => {
    console.log('[usersApi] Fetching user by ID:', id);
    const response = await apiClient.get<ApiResponse<User>>(
      ENDPOINTS.USERS.GET(id)
    );
    console.log('[usersApi] GetById response:', response.data);
    return response.data;
  },

  /**
   * Update user profile
   */
  update: async (id: string, data: {fullName?: string; email?: string; profileImageUrl?: string}) => {
    console.log('[usersApi] Updating user:', id);
    console.log('[usersApi] Update data:', data);
    
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        ENDPOINTS.USERS.UPDATE(id),
        data
      );
      console.log('[usersApi] Update response:', response.data);
      
      // Update stored user if successful
      if (response.data.success && response.data.data) {
        console.log('[usersApi] Updating stored user');
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(response.data.data)
        );
      }
      
      return response.data;
    } catch (error: any) {
      console.log('[usersApi] Update error:', error);
      console.log('[usersApi] Error response:', error.response?.data);
      throw error;
    }
  },
};

export default usersApi;
