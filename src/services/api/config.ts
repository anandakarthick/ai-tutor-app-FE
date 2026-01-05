/**
 * API Configuration
 * Base URL and environment settings
 */

// Change this to your backend URL
// For Android Emulator: 10.0.2.2
// For iOS Simulator: localhost
// For physical device: your computer's IP address
const DEV_API_URL = 'http://192.168.29.179:3000/api/v1'; // Android Emulator
// const DEV_API_URL = 'http://localhost:3000/api/v1'; // iOS Simulator
// const DEV_API_URL = 'http://192.168.1.100:3000/api/v1'; // Physical device (use your IP)

const PROD_API_URL = 'https://api.aitutor.com/api/v1'; // Production URL

export const API_CONFIG = {
  BASE_URL: __DEV__ ? DEV_API_URL : PROD_API_URL,
  TIMEOUT: 30000, // 30 seconds
  
  // Socket.IO configuration
  SOCKET_URL: __DEV__ ? 'http://192.168.29.179:3000' : 'https://api.aitutor.com',
  
  // Encryption settings
  ENCRYPTION_ENABLED: true,
};

// Export base URL for direct use
export const API_BASE_URL = API_CONFIG.BASE_URL;

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    HANDSHAKE: '/auth/handshake',
    PUBLIC_KEY: '/auth/public-key',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGIN_PASSWORD: '/auth/login/password',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FCM_TOKEN: '/auth/fcm-token',
    VALIDATE_SESSION: '/auth/validate-session',
  },

  // Users
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
  },

  // Students
  STUDENTS: {
    LIST: '/students',
    CREATE: '/students',
    GET: (id: string) => `/students/${id}`,
    UPDATE: (id: string) => `/students/${id}`,
    PROGRESS: (id: string) => `/students/${id}/progress`,
  },

  // Boards & Classes
  BOARDS: {
    LIST: '/boards',
    GET: (id: string) => `/boards/${id}`,
    CLASSES: (id: string) => `/boards/${id}/classes`,
  },

  // Subjects
  SUBJECTS: {
    LIST: '/subjects',
    GET: (id: string) => `/subjects/${id}`,
  },

  // Books
  BOOKS: {
    LIST: '/books',
    GET: (id: string) => `/books/${id}`,
  },

  // Chapters
  CHAPTERS: {
    LIST: '/chapters',
    GET: (id: string) => `/chapters/${id}`,
  },

  // Topics
  TOPICS: {
    LIST: '/topics',
    GET: (id: string) => `/topics/${id}`,
    CONTENT: (id: string) => `/topics/${id}/content`,
  },

  // Learning
  LEARNING: {
    SESSION: '/learning/session',
    END_SESSION: (id: string) => `/learning/session/${id}/end`,
    MESSAGE: (id: string) => `/learning/session/${id}/message`,
    MESSAGES: (id: string) => `/learning/session/${id}/messages`,
    PROGRESS: '/learning/progress',
    TEACH: '/learning/teach',
    TTS: '/learning/tts',
    TTS_CHUNKS: '/learning/tts/chunks',
    VOICE_MESSAGE: '/learning/voice-message',
  },

  // Doubts
  DOUBTS: {
    LIST: '/doubts',
    CREATE: '/doubts',
    GET: (id: string) => `/doubts/${id}`,
    RESOLVE: (id: string) => `/doubts/${id}/resolve`,
  },

  // Quizzes
  QUIZZES: {
    LIST: '/quizzes',
    GET: (id: string) => `/quizzes/${id}`,
    START_ATTEMPT: (id: string) => `/quizzes/${id}/attempt`,
    SUBMIT_ANSWER: (attemptId: string) => `/quizzes/attempts/${attemptId}/answer`,
    SUBMIT: (attemptId: string) => `/quizzes/attempts/${attemptId}/submit`,
  },

  // Study Plans
  STUDY_PLANS: {
    LIST: '/study-plans',
    GENERATE: '/study-plans/generate',
    GET: (id: string) => `/study-plans/${id}`,
    TODAY: (id: string) => `/study-plans/${id}/today`,
    COMPLETE_ITEM: (itemId: string) => `/study-plans/items/${itemId}/complete`,
  },

  // Progress
  PROGRESS: {
    OVERALL: (studentId: string) => `/progress/${studentId}`,
    DAILY: (studentId: string) => `/progress/${studentId}/daily`,
    RECORD_DAILY: (studentId: string) => `/progress/${studentId}/daily`,
    STREAK: (studentId: string) => `/progress/${studentId}/streak`,
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    LIST: '/subscriptions',
    ACTIVE: '/subscriptions/active',
    CREATE: '/subscriptions',
    VALIDATE_COUPON: '/subscriptions/validate-coupon',
  },

  // Payments
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order',
    VERIFY: '/payments/verify',
    LIST: '/payments',
    GET: (id: string) => `/payments/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    TEST: '/notifications/test',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    TODAY: '/dashboard/today',
    LEADERBOARD: '/dashboard/leaderboard',
    ACHIEVEMENTS: '/dashboard/achievements',
  },

  // Settings
  SETTINGS: {
    NOTIFICATION_PREFERENCES: '/settings/notification-preferences',
    FAQS: '/settings/faqs',
    CONTACT_INFO: '/settings/contact-info',
    APP_INFO: '/settings/app-info',
  },
};
