/**
 * Study Plans API Service
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  StudyPlan,
  StudyPlanItem,
  PlanStatus,
} from '../../types/api';

export const studyPlansApi = {
  /**
   * Generate AI study plan
   */
  generate: async (data: {
    studentId: string;
    startDate: string;
    endDate: string;
    dailyHours?: number;
    targetSubjects?: string[];
    targetExam?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<StudyPlan>>(
      ENDPOINTS.STUDY_PLANS.GENERATE,
      data
    );
    return response.data;
  },

  /**
   * Get study plans
   */
  getAll: async (params?: {studentId?: string; status?: PlanStatus}) => {
    const response = await apiClient.get<ApiResponse<StudyPlan[]>>(
      ENDPOINTS.STUDY_PLANS.LIST,
      {params}
    );
    return response.data;
  },

  /**
   * Get study plan by ID with items
   */
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StudyPlan>>(
      ENDPOINTS.STUDY_PLANS.GET(id)
    );
    return response.data;
  },

  /**
   * Get today's study items
   */
  getTodayItems: async (planId: string) => {
    const response = await apiClient.get<ApiResponse<StudyPlanItem[]>>(
      ENDPOINTS.STUDY_PLANS.TODAY(planId)
    );
    return response.data;
  },

  /**
   * Mark study item as complete
   */
  completeItem: async (itemId: string) => {
    const response = await apiClient.put<ApiResponse<StudyPlanItem>>(
      ENDPOINTS.STUDY_PLANS.COMPLETE_ITEM(itemId)
    );
    return response.data;
  },
};

export default studyPlansApi;
