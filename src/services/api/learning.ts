/**
 * Learning API Service
 * Sessions, Messages, Progress
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  LearningSession,
  ChatMessage,
  SessionType,
  MasteryLevel,
} from '../../types/api';

export const learningApi = {
  /**
   * Start a learning session
   */
  startSession: async (
    studentId: string,
    topicId: string,
    sessionType: SessionType = 'learning' as SessionType
  ) => {
    const response = await apiClient.post<ApiResponse<LearningSession>>(
      ENDPOINTS.LEARNING.SESSION,
      {studentId, topicId, sessionType}
    );
    return response.data;
  },

  /**
   * End a learning session
   */
  endSession: async (sessionId: string, xpEarned: number = 0) => {
    const response = await apiClient.put<ApiResponse<{durationSeconds: number}>>(
      ENDPOINTS.LEARNING.END_SESSION(sessionId),
      {xpEarned}
    );
    return response.data;
  },

  /**
   * Send message in learning session (AI chat)
   */
  sendMessage: async (
    sessionId: string,
    content: string,
    messageType: string = 'text'
  ) => {
    const response = await apiClient.post<
      ApiResponse<{userMessage: ChatMessage; aiMessage: ChatMessage}>
    >(ENDPOINTS.LEARNING.MESSAGE(sessionId), {content, messageType});
    return response.data;
  },

  /**
   * Get session messages
   */
  getMessages: async (sessionId: string) => {
    const response = await apiClient.get<ApiResponse<ChatMessage[]>>(
      ENDPOINTS.LEARNING.MESSAGES(sessionId)
    );
    return response.data;
  },

  /**
   * Update topic progress
   */
  updateProgress: async (
    studentId: string,
    topicId: string,
    progressPercentage: number,
    masteryLevel?: MasteryLevel
  ) => {
    const response = await apiClient.put<ApiResponse<any>>(
      ENDPOINTS.LEARNING.PROGRESS,
      {studentId, topicId, progressPercentage, masteryLevel}
    );
    return response.data;
  },
};

export default learningApi;
