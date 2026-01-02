/**
 * API Services Index
 * Central export for all API services
 */

// Config
export {API_CONFIG, ENDPOINTS} from './config';

// Client
export {default as apiClient, STORAGE_KEYS, setAuthTokens, clearAuthTokens, isAuthenticated} from './client';

// Encrypted Client
export {encryptedApiClient} from './encryptedClient';

// Services
export {authApi} from './auth';
export {studentsApi} from './students';
export {contentApi} from './content';
export {learningApi} from './learning';
export {doubtsApi} from './doubts';
export {quizzesApi} from './quizzes';
export {studyPlansApi} from './studyPlans';
export {progressApi} from './progress';
export {subscriptionsApi} from './subscriptions';
export {paymentsApi} from './payments';
export {notificationsApi} from './notifications';
export {dashboardApi} from './dashboard';
export {settingsApi} from './settings';

// Convenience object with all APIs
export const api = {
  auth: require('./auth').authApi,
  students: require('./students').studentsApi,
  content: require('./content').contentApi,
  learning: require('./learning').learningApi,
  doubts: require('./doubts').doubtsApi,
  quizzes: require('./quizzes').quizzesApi,
  studyPlans: require('./studyPlans').studyPlansApi,
  progress: require('./progress').progressApi,
  subscriptions: require('./subscriptions').subscriptionsApi,
  payments: require('./payments').paymentsApi,
  notifications: require('./notifications').notificationsApi,
  dashboard: require('./dashboard').dashboardApi,
  settings: require('./settings').settingsApi,
};

export default api;
