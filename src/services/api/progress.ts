/**
 * Progress API Service
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {ApiResponse, DailyProgress} from '../../types/api';

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalTopics: number;
  completedTopics: number;
  totalTimeMinutes: number;
  avgProgress: number;
}

interface OverallProgress {
  totalTopics: number;
  completedTopics: number;
  totalTimeMinutes: number;
  subjectProgress: SubjectProgress[];
}

interface StreakInfo {
  streakDays: number;
  lastActivityDate?: string;
  isStreakActive: boolean;
  xp: number;
  level: number;
}

export const progressApi = {
  /**
   * Get student's overall progress
   * @param studentId - Student ID
   * @param skipCache - If true, skip server-side cache
   */
  getOverall: async (studentId: string, skipCache: boolean = false) => {
    const params: Record<string, string> = {};
    if (skipCache) {
      params.skipCache = 'true';
    }
    
    const response = await apiClient.get<ApiResponse<OverallProgress>>(
      ENDPOINTS.PROGRESS.OVERALL(studentId),
      { params }
    );
    return response.data;
  },

  /**
   * Get daily progress history
   */
  getDaily: async (studentId: string, days: number = 30) => {
    const response = await apiClient.get<ApiResponse<DailyProgress[]>>(
      ENDPOINTS.PROGRESS.DAILY(studentId),
      {params: {days}}
    );
    return response.data;
  },

  /**
   * Record daily progress
   */
  recordDaily: async (
    studentId: string,
    data: {
      studyTimeMinutes?: number;
      topicsCompleted?: number;
      quizzesAttempted?: number;
      doubtsAsked?: number;
      xpEarned?: number;
      subjectWiseTime?: Record<string, number>;
    }
  ) => {
    const response = await apiClient.post<ApiResponse<DailyProgress>>(
      ENDPOINTS.PROGRESS.RECORD_DAILY(studentId),
      data
    );
    return response.data;
  },

  /**
   * Get streak info
   */
  getStreak: async (studentId: string) => {
    const response = await apiClient.get<ApiResponse<StreakInfo>>(
      ENDPOINTS.PROGRESS.STREAK(studentId)
    );
    return response.data;
  },

  /**
   * Clear cache for student (for debugging)
   */
  clearCache: async (studentId: string) => {
    const response = await apiClient.delete<ApiResponse<{message: string}>>(
      `${ENDPOINTS.PROGRESS.OVERALL(studentId)}/cache`
    );
    return response.data;
  },
};

export default progressApi;
