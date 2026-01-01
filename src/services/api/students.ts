/**
 * Students API Service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, {STORAGE_KEYS} from './client';
import {ENDPOINTS} from './config';
import type {
  ApiResponse,
  Student,
  CreateStudentData,
  StudentProgress,
} from '../../types/api';

export const studentsApi = {
  /**
   * Create a new student profile
   */
  create: async (data: CreateStudentData) => {
    const response = await apiClient.post<ApiResponse<Student>>(
      ENDPOINTS.STUDENTS.CREATE,
      data
    );
    
    if (response.data.success && response.data.data) {
      // Store as current student
      await AsyncStorage.setItem(
        STORAGE_KEYS.STUDENT,
        JSON.stringify(response.data.data)
      );
    }
    
    return response.data;
  },

  /**
   * Get all students for current user
   */
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Student[]>>(
      ENDPOINTS.STUDENTS.LIST
    );
    return response.data;
  },

  /**
   * Get student by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Student>>(
      ENDPOINTS.STUDENTS.GET(id)
    );
    return response.data;
  },

  /**
   * Update student profile
   */
  update: async (id: string, data: Partial<CreateStudentData>) => {
    const response = await apiClient.put<ApiResponse<Student>>(
      ENDPOINTS.STUDENTS.UPDATE(id),
      data
    );
    
    // Update stored student if it's the current one
    const storedStudent = await studentsApi.getStoredStudent();
    if (storedStudent?.id === id && response.data.success && response.data.data) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.STUDENT,
        JSON.stringify(response.data.data)
      );
    }
    
    return response.data;
  },

  /**
   * Get student's topic progress
   */
  getProgress: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StudentProgress[]>>(
      ENDPOINTS.STUDENTS.PROGRESS(id)
    );
    return response.data;
  },

  /**
   * Set current student (store locally)
   */
  setCurrentStudent: async (student: Student) => {
    await AsyncStorage.setItem(STORAGE_KEYS.STUDENT, JSON.stringify(student));
  },

  /**
   * Get stored current student
   */
  getStoredStudent: async (): Promise<Student | null> => {
    const studentStr = await AsyncStorage.getItem(STORAGE_KEYS.STUDENT);
    return studentStr ? JSON.parse(studentStr) : null;
  },

  /**
   * Clear current student
   */
  clearCurrentStudent: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.STUDENT);
  },
};

export default studentsApi;
