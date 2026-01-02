/**
 * Settings API Service
 */

import apiClient from './client';
import type {ApiResponse} from '../../types/api';

export interface NotificationPreferences {
  masterEnabled: boolean;
  studyReminders: boolean;
  quizAlerts: boolean;
  achievements: boolean;
  newContent: boolean;
  tips: boolean;
  promotions: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  supportHours: string;
  socialMedia: {
    twitter: string;
    instagram: string;
    facebook: string;
    youtube: string;
  };
}

export interface AppInfo {
  version: string;
  buildNumber: string;
  minVersion: string;
  forceUpdate: boolean;
  updateMessage: string;
  playStoreUrl: string;
  appStoreUrl: string;
  privacyPolicyUrl: string;
  termsUrl: string;
}

export const settingsApi = {
  /**
   * Get notification preferences
   */
  getNotificationPreferences: async () => {
    const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
      '/settings/notifications'
    );
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (preferences: Partial<NotificationPreferences>) => {
    const response = await apiClient.put<ApiResponse<NotificationPreferences>>(
      '/settings/notifications',
      preferences
    );
    return response.data;
  },

  /**
   * Get FAQs
   */
  getFaqs: async () => {
    const response = await apiClient.get<ApiResponse<FAQ[]>>(
      '/settings/help/faqs'
    );
    return response.data;
  },

  /**
   * Get contact information
   */
  getContactInfo: async () => {
    const response = await apiClient.get<ApiResponse<ContactInfo>>(
      '/settings/contact'
    );
    return response.data;
  },

  /**
   * Get app information
   */
  getAppInfo: async () => {
    const response = await apiClient.get<ApiResponse<AppInfo>>(
      '/settings/app-info'
    );
    return response.data;
  },
};

export default settingsApi;
