/**
 * Content API Service
 * Boards, Classes, Subjects, Books, Chapters, Topics
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  Board,
  Class,
  Subject,
  Book,
  Chapter,
  Topic,
  ContentBlock,
  Medium,
} from '../../types/api';

export const contentApi = {
  // ==================== Boards ====================
  boards: {
    /**
     * Get all boards
     */
    getAll: async () => {
      const response = await apiClient.get<ApiResponse<Board[]>>(
        ENDPOINTS.BOARDS.LIST
      );
      return response.data;
    },

    /**
     * Get board by ID
     */
    getById: async (id: string) => {
      const response = await apiClient.get<ApiResponse<Board>>(
        ENDPOINTS.BOARDS.GET(id)
      );
      return response.data;
    },

    /**
     * Get classes by board ID
     */
    getClasses: async (boardId: string) => {
      const response = await apiClient.get<ApiResponse<Class[]>>(
        ENDPOINTS.BOARDS.CLASSES(boardId)
      );
      return response.data;
    },
  },

  // ==================== Subjects ====================
  subjects: {
    /**
     * Get subjects by class
     */
    getByClass: async (classId: string, medium: Medium = 'english' as Medium) => {
      const response = await apiClient.get<ApiResponse<Subject[]>>(
        ENDPOINTS.SUBJECTS.LIST,
        {params: {classId, medium}}
      );
      return response.data;
    },

    /**
     * Get subject by ID
     */
    getById: async (id: string) => {
      const response = await apiClient.get<ApiResponse<Subject>>(
        ENDPOINTS.SUBJECTS.GET(id)
      );
      return response.data;
    },
  },

  // ==================== Books ====================
  books: {
    /**
     * Get books by subject
     */
    getBySubject: async (subjectId: string) => {
      const response = await apiClient.get<ApiResponse<Book[]>>(
        ENDPOINTS.BOOKS.LIST,
        {params: {subjectId}}
      );
      return response.data;
    },

    /**
     * Get book by ID with chapters
     */
    getById: async (id: string) => {
      const response = await apiClient.get<ApiResponse<Book>>(
        ENDPOINTS.BOOKS.GET(id)
      );
      return response.data;
    },
  },

  // ==================== Chapters ====================
  chapters: {
    /**
     * Get chapters by book with optional student progress
     */
    getByBook: async (bookId: string, studentId?: string) => {
      const params: Record<string, string> = { bookId };
      if (studentId) {
        params.studentId = studentId;
      }
      const response = await apiClient.get<ApiResponse<Chapter[]>>(
        ENDPOINTS.CHAPTERS.LIST,
        { params }
      );
      return response.data;
    },

    /**
     * Get chapter by ID with topics
     */
    getById: async (id: string) => {
      const response = await apiClient.get<ApiResponse<Chapter>>(
        ENDPOINTS.CHAPTERS.GET(id)
      );
      return response.data;
    },
  },

  // ==================== Topics ====================
  topics: {
    /**
     * Get topics by chapter with optional student progress
     */
    getByChapter: async (chapterId: string, studentId?: string) => {
      const params: Record<string, string> = { chapterId };
      if (studentId) {
        params.studentId = studentId;
      }
      const response = await apiClient.get<ApiResponse<Topic[]>>(
        ENDPOINTS.TOPICS.LIST,
        { params }
      );
      return response.data;
    },

    /**
     * Get topic by ID
     */
    getById: async (id: string) => {
      const response = await apiClient.get<ApiResponse<Topic>>(
        ENDPOINTS.TOPICS.GET(id)
      );
      return response.data;
    },

    /**
     * Get topic content blocks
     */
    getContent: async (topicId: string) => {
      const response = await apiClient.get<ApiResponse<ContentBlock[]>>(
        ENDPOINTS.TOPICS.CONTENT(topicId)
      );
      return response.data;
    },
  },
};

export default contentApi;
