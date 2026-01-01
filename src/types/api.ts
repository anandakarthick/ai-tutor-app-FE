/**
 * API Types and Interfaces
 * Matches backend entity structures
 */

// ==================== Enums ====================
export enum UserRole {
  PARENT = 'parent',
  STUDENT = 'student',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  READING = 'reading',
  KINESTHETIC = 'kinesthetic',
}

export enum Medium {
  ENGLISH = 'english',
  HINDI = 'hindi',
  TAMIL = 'tamil',
  TELUGU = 'telugu',
  KANNADA = 'kannada',
  MALAYALAM = 'malayalam',
  MARATHI = 'marathi',
  BENGALI = 'bengali',
  GUJARATI = 'gujarati',
}

export enum SessionType {
  LEARNING = 'learning',
  DOUBT = 'doubt',
  REVISION = 'revision',
  PRACTICE = 'practice',
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum SenderType {
  STUDENT = 'student',
  AI = 'ai',
  SYSTEM = 'system',
}

export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  IMAGE = 'image',
  EXPLANATION = 'explanation',
  QUIZ = 'quiz',
  HINT = 'hint',
  ENCOURAGEMENT = 'encouragement',
}

export enum MasteryLevel {
  NOT_STARTED = 'not_started',
  LEARNING = 'learning',
  PRACTICING = 'practicing',
  MASTERED = 'mastered',
}

export enum DoubtType {
  TEXT = 'text',
  VOICE = 'voice',
  IMAGE = 'image',
}

export enum DoubtStatus {
  PENDING = 'pending',
  AI_ANSWERED = 'ai_answered',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
}

export enum QuizType {
  TOPIC = 'topic',
  CHAPTER = 'chapter',
  SUBJECT = 'subject',
  PRACTICE = 'practice',
  MOCK = 'mock',
  DAILY = 'daily',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuestionType {
  MCQ = 'mcq',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  SHORT_ANSWER = 'short_answer',
  MATCH = 'match',
}

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  EVALUATED = 'evaluated',
  EXPIRED = 'expired',
}

export enum PlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum ItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum NotificationType {
  SYSTEM = 'system',
  REMINDER = 'reminder',
  ACHIEVEMENT = 'achievement',
  QUIZ = 'quiz',
  SUBSCRIPTION = 'subscription',
  STREAK = 'streak',
  PROMOTION = 'promotion',
  UPDATE = 'update',
}

export enum AchievementCategory {
  STREAK = 'streak',
  LEARNING = 'learning',
  QUIZ = 'quiz',
  DOUBT = 'doubt',
  XP = 'xp',
  LEVEL = 'level',
  SPECIAL = 'special',
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  cached?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==================== Auth Types ====================
export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  role: UserRole;
  authProvider: AuthProvider;
  profileImageUrl?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  fcmToken?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterData {
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
}

// ==================== Student Types ====================
export interface Student {
  id: string;
  userId: string;
  studentName: string;
  dateOfBirth?: string;
  gender?: Gender;
  profileImageUrl?: string;
  schoolName?: string;
  section?: string;
  rollNumber?: string;
  medium: Medium;
  learningStyle: LearningStyle;
  dailyStudyGoalMinutes: number;
  xp: number;
  level: number;
  streakDays: number;
  lastActivityDate?: string;
  isActive: boolean;
  createdAt: string;
  board?: Board;
  class?: Class;
  boardId?: string;
  classId?: string;
}

export interface CreateStudentData {
  studentName: string;
  dateOfBirth?: string;
  gender?: Gender;
  schoolName?: string;
  boardId: string;
  classId: string;
  section?: string;
  medium?: Medium;
}

// ==================== Content Types ====================
export interface Board {
  id: string;
  name: string;
  fullName: string;
  state?: string;
  description?: string;
  logoUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Class {
  id: string;
  boardId: string;
  className: string;
  displayName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Subject {
  id: string;
  classId: string;
  subjectName: string;
  displayName: string;
  iconUrl?: string;
  colorCode?: string;
  medium: Medium;
  displayOrder: number;
  isActive: boolean;
}

export interface Book {
  id: string;
  subjectId: string;
  bookTitle: string;
  publisher?: string;
  edition?: string;
  coverImageUrl?: string;
  totalChapters: number;
  displayOrder: number;
  isActive: boolean;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  chapterTitle: string;
  description?: string;
  totalTopics: number;
  estimatedHours: number;
  displayOrder: number;
  isActive: boolean;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  chapterId: string;
  topicTitle: string;
  description?: string;
  learningObjectives?: string[];
  estimatedMinutes: number;
  difficultyLevel: DifficultyLevel;
  displayOrder: number;
  isActive: boolean;
  chapter?: Chapter;
}

export interface ContentBlock {
  id: string;
  topicId: string;
  blockType: string;
  title?: string;
  content: string;
  mediaUrl?: string;
  sequenceOrder: number;
  isActive: boolean;
}

// ==================== Learning Types ====================
export interface LearningSession {
  id: string;
  studentId: string;
  topicId: string;
  sessionType: SessionType;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  aiInteractions: number;
  xpEarned: number;
  topic?: Topic;
  student?: Student;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderType: SenderType;
  messageType: MessageType;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  topicId: string;
  progressPercentage: number;
  masteryLevel: MasteryLevel;
  totalTimeSpentMinutes: number;
  lastAccessedAt?: string;
  completedAt?: string;
  topic?: Topic;
}

export interface DailyProgress {
  id: string;
  studentId: string;
  date: string;
  totalStudyTimeMinutes: number;
  topicsCompleted: number;
  quizzesAttempted: number;
  doubtsAsked: number;
  xpEarned: number;
  streakDays: number;
  goalAchieved: boolean;
  subjectWiseTime?: Record<string, number>;
}

// ==================== Doubt Types ====================
export interface Doubt {
  id: string;
  studentId: string;
  topicId?: string;
  question: string;
  doubtType: DoubtType;
  imageUrl?: string;
  voiceUrl?: string;
  aiAnswer?: string;
  humanAnswer?: string;
  status: DoubtStatus;
  isResolved: boolean;
  resolvedAt?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  topic?: Topic;
}

export interface CreateDoubtData {
  studentId: string;
  topicId?: string;
  question: string;
  doubtType?: DoubtType;
  imageUrl?: string;
  voiceUrl?: string;
}

// ==================== Quiz Types ====================
export interface Quiz {
  id: string;
  topicId?: string;
  chapterId?: string;
  quizTitle: string;
  description?: string;
  quizType: QuizType;
  difficultyLevel: DifficultyLevel;
  totalQuestions: number;
  totalMarks: number;
  timeLimitMinutes?: number;
  passingPercentage: number;
  shuffleQuestions: boolean;
  isActive: boolean;
  questions?: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
  negativeMarks?: number;
  difficultyLevel: DifficultyLevel;
  mediaUrl?: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  timeTakenSeconds: number;
  isPassed: boolean;
  xpEarned: number;
  quiz?: Quiz;
  responses?: AnswerResponse[];
}

export interface AnswerResponse {
  id: string;
  attemptId: string;
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  marksObtained: number;
  timeTakenSeconds: number;
  isSkipped: boolean;
}

// ==================== Study Plan Types ====================
export interface StudyPlan {
  id: string;
  studentId: string;
  planTitle: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  dailyHours: number;
  targetSubjects?: string[];
  targetExam?: string;
  isAiGenerated: boolean;
  items?: StudyPlanItem[];
}

export interface StudyPlanItem {
  id: string;
  studyPlanId: string;
  topicId: string;
  scheduledDate: string;
  estimatedMinutes: number;
  status: ItemStatus;
  completedAt?: string;
  displayOrder: number;
  topic?: Topic;
}

// ==================== Subscription Types ====================
export interface SubscriptionPlan {
  id: string;
  planName: string;
  displayName: string;
  description?: string;
  price: number;
  originalPrice?: number;
  durationMonths: number;
  maxStudents: number;
  aiMinutesPerDay: number;
  features: string[];
  doubtTypes: string[];
  hasLiveSessions: boolean;
  hasPersonalMentor: boolean;
  supportType: string;
  reportFrequency: string;
  isPopular: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string;
  cancelledAt?: string;
  paymentId?: string;
  couponCode?: string;
  discountAmount: number;
  finalAmount: number;
  plan?: SubscriptionPlan;
}

// ==================== Payment Types ====================
export interface Payment {
  id: string;
  userId: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  createdAt: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  paymentId: string;
  keyId: string;
}

export interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ==================== Notification Types ====================
export interface Notification {
  id: string;
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ==================== Achievement Types ====================
export interface Achievement {
  id: string;
  achievementName: string;
  displayName: string;
  description: string;
  category: AchievementCategory;
  iconUrl?: string;
  xpReward: number;
  tier: number;
  displayOrder: number;
  isActive: boolean;
}

export interface StudentAchievement {
  id: string;
  studentId: string;
  achievementId: string;
  earnedAt: string;
  achievement?: Achievement;
}

// ==================== Dashboard Types ====================
export interface DashboardStats {
  student: {
    name: string;
    xp: number;
    level: number;
    streakDays: number;
  };
  today: {
    studyTimeMinutes: number;
    topicsCompleted: number;
    xpEarned: number;
    goalAchieved: boolean;
  };
  overall: {
    totalTopics: number;
    completedTopics: number;
    totalQuizzes: number;
    avgQuizScore: number;
    quizzesPassed: number;
    achievements: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  avatar?: string;
}

export interface TodayPlanResponse {
  studyPlan?: StudyPlan;
  todayItems: StudyPlanItem[];
  continueLearning?: LearningSession;
}

export interface AchievementsResponse {
  earned: (Achievement & { earnedAt: string })[];
  locked: Achievement[];
  total: number;
  earnedCount: number;
}

// ==================== Coupon Types ====================
export interface Coupon {
  couponCode: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
}
