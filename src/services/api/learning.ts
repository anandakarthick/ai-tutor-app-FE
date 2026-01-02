/**
 * Learning API Service
 * Sessions, Messages, Progress
 */

import apiClient from './client';
import {ENDPOINTS, API_BASE_URL} from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  /**
   * Get topic progress for a student
   */
  getProgress: async (studentId: string, topicId: string) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${ENDPOINTS.LEARNING.PROGRESS}/${studentId}/${topicId}`
    );
    return response.data;
  },

  /**
   * Stream AI teaching content
   * Returns an async generator that yields text chunks
   */
  streamTeaching: async function* (
    studentName: string,
    grade: string,
    subject: string,
    topic: string,
    content: string,
    onChunk?: (text: string) => void
  ): AsyncGenerator<string, void, unknown> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/learning/teach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          studentName,
          grade,
          subject,
          topic,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Teaching stream request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                return;
              }
              if (data.text) {
                if (onChunk) onChunk(data.text);
                yield data.text;
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream teaching error:', error);
      throw error;
    }
  },
};

export default learningApi;
