/**
 * Custom Hooks for API Data
 * With enhanced logging for debugging
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
    if (!classId) {
      console.log('[useSubjects] No classId provided, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('[useSubjects] Fetching subjects for classId:', classId);
      const response = await contentApi.subjects.getByClass(classId);
      console.log('[useSubjects] Response:', response);
      if (response.success && response.data) {
        setSubjects(response.data);
        console.log('[useSubjects] Loaded', response.data.length, 'subjects');
      }
    } catch (err: any) {
      console.log('[useSubjects] Error:', err.message);
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
    if (!subjectId) {
      console.log('[useBooks] No subjectId provided, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('[useBooks] Fetching books for subjectId:', subjectId);
      const response = await contentApi.books.getBySubject(subjectId);
      console.log('[useBooks] Response:', response);
      if (response.success && response.data) {
        setBooks(response.data);
        console.log('[useBooks] Loaded', response.data.length, 'books');
      }
    } catch (err: any) {
      console.log('[useBooks] Error:', err.message);
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
    if (!bookId) {
      console.log('[useChapters] No bookId provided, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('[useChapters] Fetching chapters for bookId:', bookId);
      const response = await contentApi.chapters.getByBook(bookId);
      console.log('[useChapters] Response:', response);
      if (response.success && response.data) {
        setChapters(response.data);
        console.log('[useChapters] Loaded', response.data.length, 'chapters');
      }
    } catch (err: any) {
      console.log('[useChapters] Error:', err.message);
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
    if (!chapterId) {
      console.log('[useTopics] No chapterId provided, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('[useTopics] Fetching topics for chapterId:', chapterId);
      const response = await contentApi.topics.getByChapter(chapterId);
      console.log('[useTopics] Response:', response);
      if (response.success && response.data) {
        setTopics(response.data);
        console.log('[useTopics] Loaded', response.data.length, 'topics');
      }
    } catch (err: any) {
      console.log('[useTopics] Error:', err.message);
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
      console.log('[useLearningSession] Starting session for topic:', topicId);
      const response = await learningApi.startSession(currentStudent.id, topicId);
      if (response.success && response.data) {
        setSession(response.data);
        setMessages([]);
        console.log('[useLearningSession] Session started:', response.data.id);
        return response.data;
      }
      return null;
    } catch (err) {
      console.log('[useLearningSession] Start session error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentStudent]);

  const endSession = useCallback(async (xpEarned: number = 0) => {
    if (!session) return;
    
    try {
      console.log('[useLearningSession] Ending session:', session.id);
      await learningApi.endSession(session.id, xpEarned);
      setSession(null);
      setMessages([]);
    } catch (err) {
      console.log('[useLearningSession] End session error:', err);
    }
  }, [session]);

  const sendMessage = useCallback(async (content: string) => {
    if (!session) return null;
    
    try {
      setSending(true);
      console.log('[useLearningSession] Sending message to session:', session.id);
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
      console.log('[useLearningSession] Send message error:', err);
      return null;
    } finally {
      setSending(false);
    }
  }, [session]);

  const loadMessages = useCallback(async () => {
    if (!session) return;
    
    try {
      console.log('[useLearningSession] Loading messages for session:', session.id);
      const response = await learningApi.getMessages(session.id);
      if (response.success && response.data) {
        setMessages(response.data);
        console.log('[useLearningSession] Loaded', response.data.length, 'messages');
      }
    } catch (err) {
      console.log('[useLearningSession] Load messages error:', err);
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
    if (!currentStudent) {
      console.log('[useDoubts] No currentStudent, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('[useDoubts] Fetching doubts for student:', currentStudent.id);
      const response = await doubtsApi.getAll({studentId: currentStudent.id});
      console.log('[useDoubts] Response:', response);
      if (response.success && response.data) {
        setDoubts(response.data);
        console.log('[useDoubts] Loaded', response.data.length, 'doubts');
      }
    } catch (err) {
      console.log('[useDoubts] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentStudent]);

  const createDoubt = useCallback(async (question: string, topicId?: string) => {
    if (!currentStudent) return null;
    
    try {
      setCreating(true);
      console.log('[useDoubts] Creating doubt for student:', currentStudent.id);
      const response = await doubtsApi.create({
        studentId: currentStudent.id,
        question,
        topicId,
      });
      if (response.success && response.data) {
        setDoubts(prev => [response.data, ...prev]);
        console.log('[useDoubts] Doubt created:', response.data.id);
        return response.data;
      }
      return null;
    } catch (err) {
      console.log('[useDoubts] Create doubt error:', err);
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
      console.log('[useQuizzes] Fetching quizzes', topicId ? `for topic: ${topicId}` : '(all)');
      const response = await quizzesApi.getAll(topicId ? {topicId} : undefined);
      console.log('[useQuizzes] Response:', response);
      if (response.success && response.data) {
        setQuizzes(response.data);
        console.log('[useQuizzes] Loaded', response.data.length, 'quizzes');
      }
    } catch (err) {
      console.log('[useQuizzes] Error:', err);
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
    if (!currentStudent) {
      console.log('[useStudyPlans] No currentStudent, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('[useStudyPlans] Fetching plans for student:', currentStudent.id);
      const response = await studyPlansApi.getAll({studentId: currentStudent.id});
      console.log('[useStudyPlans] Response:', response);
      if (response.success && response.data) {
        setPlans(response.data);
        console.log('[useStudyPlans] Loaded', response.data.length, 'plans');
      }
    } catch (err) {
      console.log('[useStudyPlans] Error:', err);
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
      console.log('[useStudyPlans] Generating plan for student:', currentStudent.id);
      const response = await studyPlansApi.generate({
        studentId: currentStudent.id,
        ...data,
      });
      if (response.success && response.data) {
        setPlans(prev => [response.data, ...prev]);
        console.log('[useStudyPlans] Plan generated:', response.data.id);
        return response.data;
      }
      return null;
    } catch (err) {
      console.log('[useStudyPlans] Generate error:', err);
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
    if (!currentStudent) {
      console.log('[useProgress] No currentStudent, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('[useProgress] Fetching progress for student:', currentStudent.id);
      
      const [dailyRes, streakRes] = await Promise.all([
        progressApi.getDaily(currentStudent.id, 30),
        progressApi.getStreak(currentStudent.id),
      ]);

      console.log('[useProgress] Daily response:', dailyRes);
      console.log('[useProgress] Streak response:', streakRes);

      if (dailyRes.success && dailyRes.data) {
        setDailyProgress(dailyRes.data);
        console.log('[useProgress] Loaded', dailyRes.data.length, 'daily progress entries');
      }
      if (streakRes.success && streakRes.data) {
        setStreak(streakRes.data);
        console.log('[useProgress] Streak:', streakRes.data.streakDays, 'days');
      }
    } catch (err) {
      console.log('[useProgress] Error:', err);
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
    if (!currentStudent) {
      console.log('[useDashboard] No currentStudent, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('[useDashboard] Fetching dashboard for student:', currentStudent.id);
      
      const [todayRes, leaderRes, achieveRes] = await Promise.all([
        dashboardApi.getToday(currentStudent.id),
        dashboardApi.getLeaderboard({type: 'weekly', limit: 10}),
        dashboardApi.getAchievements(currentStudent.id),
      ]);

      console.log('[useDashboard] Today response:', todayRes);
      console.log('[useDashboard] Leaderboard response:', leaderRes);
      console.log('[useDashboard] Achievements response:', achieveRes);

      if (todayRes.success && todayRes.data) {
        setTodayPlan(todayRes.data);
      }
      if (leaderRes.success && leaderRes.data) {
        setLeaderboard(leaderRes.data);
        console.log('[useDashboard] Loaded', leaderRes.data.length, 'leaderboard entries');
      }
      if (achieveRes.success && achieveRes.data) {
        setAchievements(achieveRes.data);
      }
    } catch (err) {
      console.log('[useDashboard] Error:', err);
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
      console.log('[useNotifications] Fetching notifications');
      
      const [listRes, countRes] = await Promise.all([
        notificationsApi.getAll({limit: 50}),
        notificationsApi.getUnreadCount(),
      ]);

      console.log('[useNotifications] List response:', listRes);
      console.log('[useNotifications] Count response:', countRes);

      if (listRes.success && listRes.data) {
        setNotifications(listRes.data);
        console.log('[useNotifications] Loaded', listRes.data.length, 'notifications');
      }
      if (countRes.success && countRes.data) {
        setUnreadCount(countRes.data.count);
        console.log('[useNotifications] Unread count:', countRes.data.count);
      }
    } catch (err) {
      console.log('[useNotifications] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      console.log('[useNotifications] Marking notification as read:', id);
      await notificationsApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? {...n, isRead: true} : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.log('[useNotifications] Mark read error:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      console.log('[useNotifications] Marking all notifications as read');
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      setUnreadCount(0);
    } catch (err) {
      console.log('[useNotifications] Mark all read error:', err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {notifications, unreadCount, loading, markRead, markAllRead, refresh: load};
}
