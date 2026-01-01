/**
 * Payments API Service
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  Payment,
  CreateOrderResponse,
  VerifyPaymentData,
} from '../../types/api';

export const paymentsApi = {
  /**
   * Create Razorpay order
   */
  createOrder: async (data: {
    amount: number;
    currency?: string;
    planId?: string;
    description?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<CreateOrderResponse>>(
      ENDPOINTS.PAYMENTS.CREATE_ORDER,
      data
    );
    return response.data;
  },

  /**
   * Verify payment after Razorpay checkout
   */
  verify: async (data: VerifyPaymentData) => {
    const response = await apiClient.post<ApiResponse<Payment>>(
      ENDPOINTS.PAYMENTS.VERIFY,
      data
    );
    return response.data;
  },

  /**
   * Get user's payments
   */
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      ENDPOINTS.PAYMENTS.LIST
    );
    return response.data;
  },

  /**
   * Get payment by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Payment>>(
      ENDPOINTS.PAYMENTS.GET(id)
    );
    return response.data;
  },
};

export default paymentsApi;
