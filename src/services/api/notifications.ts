/**
 * Notifications API Service
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {ApiResponse, PaginatedResponse, Notification} from '../../types/api';

export const notificationsApi = {
  /**
   * Get notifications
   */
  getAll: async (params?: {page?: number; limit?: number; unreadOnly?: boolean}) => {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      ENDPOINTS.NOTIFICATIONS.LIST,
      {params}
    );
    return response.data;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    const response = await apiClient.get<ApiResponse<{count: number}>>(
      ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markRead: async (id: string) => {
    const response = await apiClient.put(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return response.data;
  },

  /**
   * Mark all as read
   */
  markAllRead: async () => {
    const response = await apiClient.put(ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return response.data;
  },

  /**
   * Delete notification
   */
  delete: async (id: string) => {
    const response = await apiClient.delete(ENDPOINTS.NOTIFICATIONS.DELETE(id));
    return response.data;
  },

  /**
   * Send test notification
   */
  test: async () => {
    const response = await apiClient.post(ENDPOINTS.NOTIFICATIONS.TEST);
    return response.data;
  },

  /**
   * Subscribe to topics
   */
  subscribe: async (topics: string[]) => {
    const response = await apiClient.post<
      ApiResponse<{topic: string; success: boolean}[]>
    >(ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, {topics});
    return response.data;
  },

  /**
   * Unsubscribe from topics
   */
  unsubscribe: async (topics: string[]) => {
    const response = await apiClient.post<
      ApiResponse<{topic: string; success: boolean}[]>
    >(ENDPOINTS.NOTIFICATIONS.UNSUBSCRIBE, {topics});
    return response.data;
  },
};

export default notificationsApi;
