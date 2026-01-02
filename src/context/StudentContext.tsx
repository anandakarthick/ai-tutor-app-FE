/**
 * Student Context
 * Student profile and data management
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {studentsApi, dashboardApi, progressApi} from '../services/api';
import {useAuth} from './AuthContext';
import type {
  Student,
  CreateStudentData,
  DashboardStats,
  LeaderboardEntry,
} from '../types/api';

interface StudentContextType {
  // State
  students: Student[];
  currentStudent: Student | null;
  dashboardStats: DashboardStats | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  
  // Actions
  loadStudents: () => Promise<void>;
  createStudent: (data: CreateStudentData) => Promise<Student | null>;
  updateStudent: (id: string, data: Partial<CreateStudentData>) => Promise<boolean>;
  setCurrentStudent: (student: Student) => Promise<void>;
  loadDashboard: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({children}: {children: React.ReactNode}) {
  const {isAuthenticated} = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudentState] = useState<Student | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load students when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadStudents();
      loadStoredStudent();
    } else {
      setStudents([]);
      setCurrentStudentState(null);
      setDashboardStats(null);
    }
  }, [isAuthenticated]);

  // Load dashboard when current student changes
  useEffect(() => {
    if (currentStudent) {
      loadDashboard();
    }
  }, [currentStudent?.id]);

  const loadStoredStudent = async () => {
    const stored = await studentsApi.getStoredStudent();
    if (stored) {
      setCurrentStudentState(stored);
    }
  };

  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await studentsApi.getAll();
      if (response.success && response.data) {
        setStudents(response.data);
        
        // Auto-select first student if no current student
        const stored = await studentsApi.getStoredStudent();
        if (!stored && response.data.length > 0) {
          await setCurrentStudent(response.data[0]);
        } else if (stored && response.data.length > 0) {
          // Update the stored student with full data including relations
          const fullStudent = response.data.find(s => s.id === stored.id);
          if (fullStudent) {
            await setCurrentStudent(fullStudent);
          }
        }
      }
    } catch (error) {
      console.log('Load students error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (data: CreateStudentData) => {
    try {
      setIsLoading(true);
      const response = await studentsApi.create(data);
      if (response.success && response.data) {
        setStudents((prev) => [...prev, response.data]);
        setCurrentStudentState(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.log('Create student error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStudent = useCallback(
    async (id: string, data: Partial<CreateStudentData>) => {
      try {
        const response = await studentsApi.update(id, data);
        if (response.success && response.data) {
          setStudents((prev) =>
            prev.map((s) => (s.id === id ? response.data : s))
          );
          if (currentStudent?.id === id) {
            setCurrentStudentState(response.data);
          }
          return true;
        }
        return false;
      } catch (error) {
        console.log('Update student error:', error);
        return false;
      }
    },
    [currentStudent]
  );

  const setCurrentStudent = useCallback(async (student: Student) => {
    await studentsApi.setCurrentStudent(student);
    setCurrentStudentState(student);
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!currentStudent) return;
    
    try {
      const response = await dashboardApi.getStats(currentStudent.id);
      if (response.success && response.data) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.log('Load dashboard error:', error);
    }
  }, [currentStudent]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await dashboardApi.getLeaderboard({
        type: 'weekly',
        limit: 10,
      });
      if (response.success && response.data) {
        setLeaderboard(response.data);
      }
    } catch (error) {
      console.log('Load leaderboard error:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadStudents(), loadDashboard(), loadLeaderboard()]);
  }, [loadStudents, loadDashboard, loadLeaderboard]);

  return (
    <StudentContext.Provider
      value={{
        students,
        currentStudent,
        dashboardStats,
        leaderboard,
        isLoading,
        loadStudents,
        createStudent,
        updateStudent,
        setCurrentStudent,
        loadDashboard,
        loadLeaderboard,
        refreshAll,
      }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
