/**
 * Doubts API Service
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  PaginatedResponse,
  Doubt,
  CreateDoubtData,
  DoubtStatus,
} from '../../types/api';

export const doubtsApi = {
  /**
   * Create a new doubt
   */
  create: async (data: CreateDoubtData) => {
    const response = await apiClient.post<ApiResponse<Doubt>>(
      ENDPOINTS.DOUBTS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Get doubts list
   */
  getAll: async (params: {
    studentId?: string;
    topicId?: string;
    status?: DoubtStatus;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Doubt>>(
      ENDPOINTS.DOUBTS.LIST,
      {params}
    );
    return response.data;
  },

  /**
   * Get doubt by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Doubt>>(
      ENDPOINTS.DOUBTS.GET(id)
    );
    return response.data;
  },

  /**
   * Resolve/rate a doubt
   */
  resolve: async (id: string, rating?: number, feedback?: string) => {
    const response = await apiClient.put<ApiResponse<Doubt>>(
      ENDPOINTS.DOUBTS.RESOLVE(id),
      {rating, feedback}
    );
    return response.data;
  },
};

export default doubtsApi;
