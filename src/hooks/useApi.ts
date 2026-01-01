/**
 * Custom Hooks for API Data
 */

import {useState, useEffect, useCallback} from 'react';
import {
  contentApi,
  dashboardApi,
  learningApi,
  doubtsApi,
  quizzesApi,
  studyPlansApi,
  progressApi,
  notificationsApi,
} from '../services/api';
import {useStudent} from '../context';
import type {
  Subject,
  Book,
  Chapter,
  Topic,
  LearningSession,
  ChatMessage,
  Doubt,
  Quiz,
  StudyPlan,
  DailyProgress,
  Notification,
  TodayPlanResponse,
  LeaderboardEntry,
  AchievementsResponse,
} from '../types/api';

// ==================== Subjects Hook ====================
export function useSubjects(classId?: string) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!classId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await contentApi.subjects.getByClass(classId);
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    load();
  }, [load]);

  return {subjects, loading, error, refresh: load};
}

// ==================== Books Hook ====================
export function useBooks(subjectId?: string) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!subjectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await contentApi.books.getBySubject(subjectId);
      if (response.success && response.data) {
        setBooks(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    load();
  }, [load]);

  return {books, loading, error, refresh: load};
}

// ==================== Chapters Hook ====================
export function useChapters(bookId?: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await contentApi.chapters.getByBook(bookId);
      if (response.success && response.data) {
        setChapters(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load chapters');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  return {chapters, loading, error, refresh: load};
}

// ==================== Topics Hook ====================
export function useTopics(chapterId?: string) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!chapterId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await contentApi.topics.getByChapter(chapterId);
      if (response.success && response.data) {
        setTopics(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    load();
  }, [load]);

  return {topics, loading, error, refresh: load};
}

// ==================== Learning Session Hook ====================
export function useLearningSession() {
  const {currentStudent} = useStudent();
  const [session, setSession] = useState<LearningSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const startSession = useCallback(async (topicId: string) => {
    if (!currentStudent) return null;
    
    try {
      setLoading(true);
      const response = await learningApi.startSession(currentStudent.id, topicId);
      if (response.success && response.data) {
        setSession(response.data);
        setMessages([]);
        return response.data;
      }
      return null;
    } catch (err) {
      console.log('Start session error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentStudent]);

  const endSession = useCallback(async (xpEarned: number = 0) => {
    if (!session) return;
    
    try {
      await learningApi.endSession(session.id, xpEarned);
      setSession(null);
      setMessages([]);
    } catch (err) {
      console.log('End session error:', err);
    }
  }, [session]);

  const sendMessage = useCallback(async (content: string) => {
    if (!session) return null;
    
    try {
      setSending(true);
      const response = await learningApi.sendMessage(session.id, content);
      if (response.success && response.data) {
        setMessages(prev => [
          ...prev,
          response.data.userMessage,
          response.data.aiMessage,
        ]);
        return response.data.aiMessage;
      }
      return null;
    } catch (err) {
      console.log('Send message error:', err);
      return null;
    } finally {
      setSending(false);
    }
  }, [session]);

  const loadMessages = useCallback(async () => {
    if (!session) return;
    
    try {
      const response = await learningApi.getMessages(session.id);
      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (err) {
      console.log('Load messages error:', err);
    }
  }, [session]);

  return {
    session,
    messages,
    loading,
    sending,
    startSession,
    endSession,
    sendMessage,
    loadMessages,
  };
}

// ==================== Doubts Hook ====================
export function useDoubts() {
  const {currentStudent} = useStudent();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!currentStudent) return;
    
    try {
      setLoading(true);
      const response = await doubtsApi.getAll({studentId: currentStudent.id});
      if (response.success && response.data) {
        setDoubts(response.data);
      }
    } catch (err) {
      console.log('Load doubts error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentStudent]);

  const createDoubt = useCallback(async (question: string, topicId?: string) => {
    if (!currentStudent) return null;
    
    try {
      setCreating(true);
      const response = await doubtsApi.create({
        studentId: currentStudent.id,
        question,
        topicId,
      });
      if (response.success && response.data) {
        setDoubts(prev => [response.data, ...prev]);
        return response.data;
      }
      return null;
    } catch (err) {
      console.log('Create doubt error:', err);
      return null;
    } finally {
      setCreating(false);
    }
  }, [currentStudent]);

  useEffect(() => {
    load();
  }, [load]);

  return {doubts, loading, creating, createDoubt, refresh: load};
}

// ==================== Quizzes Hook ====================
export function useQuizzes(topicId?: string) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await quizzesApi.getAll(topicId ? {topicId} : undefined);
      if (response.success && response.data) {
        setQuizzes(response.data);
      }
    } catch (err) {
      console.log('Load quizzes error:', err);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    load();
  }, [load]);

  return {quizzes, loading, refresh: load};
}

// ==================== Study Plans Hook ====================
export function useStudyPlans() {
  const {currentStudent} = useStudent();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!currentStudent) return;
    
    try {
      setLoading(true);
      const response = await studyPlansApi.getAll({studentId: currentStudent.id});
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch (err) {
      console.log('Load study plans error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentStudent]);

  const generate = useCallback(async (data: {
    startDate: string;
    endDate: string;
    dailyHours?: number;
    targetSubjects?: string[];
    targetExam?: string;
  }) => {
    if (!currentStudent) return null;
    
    try {
      const response = await studyPlansApi.generate({
        studentId: currentStudent.id,
        ...data,
      });
      if (response.success && response.data) {
        setPlans(prev => [response.data, ...prev]);
        return response.data;
      }
      return null;
    } catch (err) {
      console.log('Generate study plan error:', err);
      return null;
    }
  }, [currentStudent]);

  useEffect(() => {
    load();
  }, [load]);

  return {plans, loading, generate, refresh: load};
}

// ==================== Progress Hook ====================
export function useProgress() {
  const {currentStudent} = useStudent();
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [streak, setStreak] = useState({streakDays: 0, xp: 0, level: 1});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!currentStudent) return;
    
    try {
      setLoading(true);
      
      const [dailyRes, streakRes] = await Promise.all([
        progressApi.getDaily(currentStudent.id, 30),
        progressApi.getStreak(currentStudent.id),
      ]);

      if (dailyRes.success && dailyRes.data) {
        setDailyProgress(dailyRes.data);
      }
      if (streakRes.success && streakRes.data) {
        setStreak(streakRes.data);
      }
    } catch (err) {
      console.log('Load progress error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentStudent]);

  useEffect(() => {
    load();
  }, [load]);

  return {dailyProgress, streak, loading, refresh: load};
}

// ==================== Dashboard Hook ====================
export function useDashboard() {
  const {currentStudent} = useStudent();
  const [todayPlan, setTodayPlan] = useState<TodayPlanResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<AchievementsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!currentStudent) return;
    
    try {
      setLoading(true);
      
      const [todayRes, leaderRes, achieveRes] = await Promise.all([
        dashboardApi.getToday(currentStudent.id),
        dashboardApi.getLeaderboard({type: 'weekly', limit: 10}),
        dashboardApi.getAchievements(currentStudent.id),
      ]);

      if (todayRes.success && todayRes.data) {
        setTodayPlan(todayRes.data);
      }
      if (leaderRes.success && leaderRes.data) {
        setLeaderboard(leaderRes.data);
      }
      if (achieveRes.success && achieveRes.data) {
        setAchievements(achieveRes.data);
      }
    } catch (err) {
      console.log('Load dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentStudent]);

  useEffect(() => {
    load();
  }, [load]);

  return {todayPlan, leaderboard, achievements, loading, refresh: load};
}

// ==================== Notifications Hook ====================
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      
      const [listRes, countRes] = await Promise.all([
        notificationsApi.getAll({limit: 50}),
        notificationsApi.getUnreadCount(),
      ]);

      if (listRes.success && listRes.data) {
        setNotifications(listRes.data);
      }
      if (countRes.success && countRes.data) {
        setUnreadCount(countRes.data.count);
      }
    } catch (err) {
      console.log('Load notifications error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? {...n, isRead: true} : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.log('Mark read error:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      setUnreadCount(0);
    } catch (err) {
      console.log('Mark all read error:', err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {notifications, unreadCount, loading, markRead, markAllRead, refresh: load};
}
