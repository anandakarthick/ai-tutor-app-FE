/**
 * Subscriptions API Service
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  SubscriptionPlan,
  UserSubscription,
  Coupon,
} from '../../types/api';

export const subscriptionsApi = {
  /**
   * Get all subscription plans (public)
   */
  getPlans: async () => {
    const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>(
      ENDPOINTS.SUBSCRIPTIONS.PLANS
    );
    return response.data;
  },

  /**
   * Get user's subscriptions
   */
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<UserSubscription[]>>(
      ENDPOINTS.SUBSCRIPTIONS.LIST
    );
    return response.data;
  },

  /**
   * Get active subscription
   */
  getActive: async () => {
    const response = await apiClient.get<ApiResponse<UserSubscription | null>>(
      ENDPOINTS.SUBSCRIPTIONS.ACTIVE
    );
    return response.data;
  },

  /**
   * Create subscription after payment
   */
  create: async (planId: string, paymentId: string, couponCode?: string) => {
    const response = await apiClient.post<ApiResponse<UserSubscription>>(
      ENDPOINTS.SUBSCRIPTIONS.CREATE,
      {planId, paymentId, couponCode}
    );
    return response.data;
  },

  /**
   * Validate coupon code
   */
  validateCoupon: async (couponCode: string, planId?: string) => {
    const response = await apiClient.post<ApiResponse<Coupon>>(
      ENDPOINTS.SUBSCRIPTIONS.VALIDATE_COUPON,
      {couponCode, planId}
    );
    return response.data;
  },
};

export default subscriptionsApi;
