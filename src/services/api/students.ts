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
    console.log('[studentsApi] Creating student with data:', data);
    const response = await apiClient.post<ApiResponse<Student>>(
      ENDPOINTS.STUDENTS.CREATE,
      data
    );
    console.log('[studentsApi] Create response:', response.data);
    
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
    console.log('[studentsApi] Fetching all students');
    const response = await apiClient.get<ApiResponse<Student[]>>(
      ENDPOINTS.STUDENTS.LIST
    );
    console.log('[studentsApi] GetAll response:', response.data);
    return response.data;
  },

  /**
   * Get student by ID
   */
  getById: async (id: string) => {
    console.log('[studentsApi] Fetching student by ID:', id);
    const response = await apiClient.get<ApiResponse<Student>>(
      ENDPOINTS.STUDENTS.GET(id)
    );
    console.log('[studentsApi] GetById response:', response.data);
    return response.data;
  },

  /**
   * Update student profile
   */
  update: async (id: string, data: Partial<CreateStudentData>) => {
    console.log('[studentsApi] Updating student:', id);
    console.log('[studentsApi] Update data:', data);
    console.log('[studentsApi] Endpoint:', ENDPOINTS.STUDENTS.UPDATE(id));
    
    try {
      const response = await apiClient.put<ApiResponse<Student>>(
        ENDPOINTS.STUDENTS.UPDATE(id),
        data
      );
      console.log('[studentsApi] Update response:', response.data);
      
      // Update stored student if it's the current one
      const storedStudent = await studentsApi.getStoredStudent();
      if (storedStudent?.id === id && response.data.success && response.data.data) {
        console.log('[studentsApi] Updating stored student');
        await AsyncStorage.setItem(
          STORAGE_KEYS.STUDENT,
          JSON.stringify(response.data.data)
        );
      }
      
      return response.data;
    } catch (error: any) {
      console.log('[studentsApi] Update error:', error);
      console.log('[studentsApi] Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Get student's topic progress
   */
  getProgress: async (id: string) => {
    console.log('[studentsApi] Fetching progress for student:', id);
    const response = await apiClient.get<ApiResponse<StudentProgress[]>>(
      ENDPOINTS.STUDENTS.PROGRESS(id)
    );
    console.log('[studentsApi] Progress response:', response.data);
    return response.data;
  },

  /**
   * Set current student (store locally)
   */
  setCurrentStudent: async (student: Student) => {
    console.log('[studentsApi] Setting current student:', student.id);
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
    console.log('[studentsApi] Clearing current student');
    await AsyncStorage.removeItem(STORAGE_KEYS.STUDENT);
  },
};

export default studentsApi;
