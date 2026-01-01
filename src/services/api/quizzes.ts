/**
 * Quizzes API Service
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  Quiz,
  QuizAttempt,
  AnswerResponse,
  QuizType,
} from '../../types/api';

export const quizzesApi = {
  /**
   * Get quizzes by topic
   */
  getAll: async (params?: {topicId?: string; quizType?: QuizType}) => {
    const response = await apiClient.get<ApiResponse<Quiz[]>>(
      ENDPOINTS.QUIZZES.LIST,
      {params}
    );
    return response.data;
  },

  /**
   * Get quiz with questions
   */
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Quiz>>(
      ENDPOINTS.QUIZZES.GET(id)
    );
    return response.data;
  },

  /**
   * Start quiz attempt
   */
  startAttempt: async (quizId: string, studentId: string) => {
    const response = await apiClient.post<ApiResponse<QuizAttempt>>(
      ENDPOINTS.QUIZZES.START_ATTEMPT(quizId),
      {studentId}
    );
    return response.data;
  },

  /**
   * Submit answer for a question
   */
  submitAnswer: async (
    attemptId: string,
    questionId: string,
    studentAnswer: string,
    timeTaken: number = 0
  ) => {
    const response = await apiClient.post<ApiResponse<AnswerResponse>>(
      ENDPOINTS.QUIZZES.SUBMIT_ANSWER(attemptId),
      {questionId, studentAnswer, timeTaken}
    );
    return response.data;
  },

  /**
   * Submit/complete quiz
   */
  submit: async (attemptId: string) => {
    const response = await apiClient.put<ApiResponse<QuizAttempt>>(
      ENDPOINTS.QUIZZES.SUBMIT(attemptId)
    );
    return response.data;
  },
};

export default quizzesApi;
