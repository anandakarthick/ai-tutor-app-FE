/**
 * Dashboard API Service
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  DashboardStats,
  LeaderboardEntry,
  TodayPlanResponse,
  AchievementsResponse,
} from '../../types/api';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (studentId: string) => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      ENDPOINTS.DASHBOARD.STATS,
      {params: {studentId}}
    );
    return response.data;
  },

  /**
   * Get today's study plan
   */
  getToday: async (studentId: string) => {
    const response = await apiClient.get<ApiResponse<TodayPlanResponse>>(
      ENDPOINTS.DASHBOARD.TODAY,
      {params: {studentId}}
    );
    return response.data;
  },

  /**
   * Get leaderboard
   */
  getLeaderboard: async (params?: {
    classId?: string;
    type?: 'daily' | 'weekly' | 'monthly' | 'all';
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
      ENDPOINTS.DASHBOARD.LEADERBOARD,
      {params}
    );
    return response.data;
  },

  /**
   * Get achievements
   */
  getAchievements: async (studentId: string) => {
    const response = await apiClient.get<ApiResponse<AchievementsResponse>>(
      ENDPOINTS.DASHBOARD.ACHIEVEMENTS,
      {params: {studentId}}
    );
    return response.data;
  },
};

export default dashboardApi;
