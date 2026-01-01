# AI Tutor App - API Integration Guide

## Overview

This React Native mobile app is fully integrated with the AI Tutor Backend API. All screens now use real API calls instead of mock data.

## Setup Instructions

### 1. Install Dependencies

```bash
cd D:\cladue\ai-tutor-app-FE
npm install
```

New dependencies added:
- `axios` - HTTP client for API calls
- `socket.io-client` - Real-time communication

### 2. Configure API URL

Edit `src/services/api/config.ts` to set your backend URL:

```typescript
// For Android Emulator:
const DEV_API_URL = 'http://10.0.2.2:3000/api/v1';

// For iOS Simulator:
const DEV_API_URL = 'http://localhost:3000/api/v1';

// For Physical Device (use your computer's IP):
const DEV_API_URL = 'http://192.168.1.100:3000/api/v1';
```

### 3. Start Backend Server

```bash
cd D:\cladue\ai-tutor-app-BE
npm run dev
```

### 4. Run the Mobile App

```bash
cd D:\cladue\ai-tutor-app-FE
npm run android
# or
npm run ios
```

## Project Structure

```
src/
├── services/
│   └── api/
│       ├── config.ts        # API configuration & endpoints
│       ├── client.ts        # Axios instance with interceptors
│       ├── auth.ts          # Authentication API
│       ├── students.ts      # Students API
│       ├── content.ts       # Content (Boards, Subjects, etc.)
│       ├── learning.ts      # Learning sessions API
│       ├── doubts.ts        # Doubts API
│       ├── quizzes.ts       # Quizzes API
│       ├── studyPlans.ts    # Study plans API
│       ├── progress.ts      # Progress tracking API
│       ├── subscriptions.ts # Subscriptions API
│       ├── payments.ts      # Payments API
│       ├── notifications.ts # Notifications API
│       ├── dashboard.ts     # Dashboard API
│       └── index.ts         # Export all APIs
│
├── context/
│   ├── AuthContext.tsx      # Auth state with API integration
│   └── StudentContext.tsx   # Student state management
│
├── hooks/
│   ├── useApi.ts            # Custom hooks for data fetching
│   └── index.ts
│
├── types/
│   ├── api.ts               # All API types & interfaces
│   └── navigation.ts        # Navigation types
│
└── screens/                  # Updated with API calls
```

## API Services

### Authentication (`authApi`)
```typescript
import { authApi } from '../services/api';

// Send OTP
await authApi.sendOtp(phone, 'login');

// Verify OTP
await authApi.verifyOtp(phone, otp);

// Register
await authApi.register({ fullName, phone, email });

// Login
await authApi.loginWithOtp(phone, otp);

// Logout
await authApi.logout();

// Get current user
await authApi.getCurrentUser();
```

### Students (`studentsApi`)
```typescript
import { studentsApi } from '../services/api';

// Create student
await studentsApi.create({ studentName, boardId, classId, medium });

// Get all students
await studentsApi.getAll();

// Update student
await studentsApi.update(id, { studentName });
```

### Content (`contentApi`)
```typescript
import { contentApi } from '../services/api';

// Boards
await contentApi.boards.getAll();
await contentApi.boards.getClasses(boardId);

// Subjects
await contentApi.subjects.getByClass(classId);

// Books, Chapters, Topics
await contentApi.books.getBySubject(subjectId);
await contentApi.chapters.getByBook(bookId);
await contentApi.topics.getByChapter(chapterId);
await contentApi.topics.getContent(topicId);
```

### Learning (`learningApi`)
```typescript
import { learningApi } from '../services/api';

// Start session
await learningApi.startSession(studentId, topicId);

// Send message (AI chat)
await learningApi.sendMessage(sessionId, content);

// Get messages
await learningApi.getMessages(sessionId);

// End session
await learningApi.endSession(sessionId);
```

### Doubts (`doubtsApi`)
```typescript
import { doubtsApi } from '../services/api';

// Create doubt
await doubtsApi.create({ studentId, question, topicId });

// Get doubts
await doubtsApi.getAll({ studentId });
```

### Quizzes (`quizzesApi`)
```typescript
import { quizzesApi } from '../services/api';

// Get quizzes
await quizzesApi.getAll({ topicId });

// Start attempt
await quizzesApi.startAttempt(quizId, studentId);

// Submit answer
await quizzesApi.submitAnswer(attemptId, questionId, answer);

// Submit quiz
await quizzesApi.submit(attemptId);
```

## Custom Hooks

```typescript
import {
  useSubjects,
  useBooks,
  useChapters,
  useTopics,
  useLearningSession,
  useDoubts,
  useQuizzes,
  useStudyPlans,
  useProgress,
  useDashboard,
  useNotifications,
} from '../hooks';

// Example usage
function MyComponent() {
  const { subjects, loading, refresh } = useSubjects(classId);
  const { doubts, createDoubt, creating } = useDoubts();
  const { session, sendMessage, messages } = useLearningSession();
}
```

## Context Providers

```typescript
// App.tsx
import { AuthProvider, StudentProvider } from './src/context';

function App() {
  return (
    <AuthProvider>
      <StudentProvider>
        {/* App content */}
      </StudentProvider>
    </AuthProvider>
  );
}
```

## Authentication Flow

1. User enters phone number → `authApi.sendOtp()`
2. User enters OTP → `authApi.loginWithOtp()` or `authApi.register()`
3. Tokens stored in AsyncStorage automatically
4. Axios interceptor adds token to all requests
5. Token refresh handled automatically on 401

## Token Storage

```typescript
// Storage keys in AsyncStorage
'@ai_tutor_access_token'
'@ai_tutor_refresh_token'
'@ai_tutor_user'
'@ai_tutor_current_student'
```

## Error Handling

All API calls are wrapped with try-catch. The Axios interceptor:
- Logs requests/responses in dev mode
- Handles 401 errors with automatic token refresh
- Clears auth data on refresh failure

## Real-time Features (Socket.IO)

```typescript
import { socketService } from '../services';

// Connect
await socketService.connect();

// Join learning session room
socketService.joinRoom(`session:${sessionId}`);

// Listen for AI responses
socketService.onAiResponse((data) => {
  console.log('AI Response:', data);
});

// Disconnect
socketService.disconnect();
```

## Testing

1. Start backend: `npm run dev` (in backend folder)
2. Run migrations: `npm run migration:run`
3. Seed data: `npm run seed`
4. Start app: `npm run android`
5. Test login with any phone number (OTP shown in console in dev mode)

## Important Notes

- OTP is returned in API response in development mode
- All API responses follow format: `{ success: boolean, data: T, message?: string }`
- Pagination responses include: `{ data: T[], pagination: {...} }`
- File uploads not yet implemented (image/voice for doubts)

## Troubleshooting

### Network Error on Android Emulator
Use `http://10.0.2.2:3000` instead of `localhost`

### Network Error on Physical Device
1. Ensure device is on same WiFi as computer
2. Use computer's local IP address
3. Check firewall settings

### Token Refresh Loop
Clear app data or reinstall the app to reset tokens

## Files Modified

- `package.json` - Added axios, socket.io-client
- `App.tsx` - Added StudentProvider
- `src/context/AuthContext.tsx` - API integration
- `src/context/StudentContext.tsx` - New file
- `src/services/api/*` - All new API services
- `src/hooks/useApi.ts` - New custom hooks
- `src/types/api.ts` - All API types
- `src/screens/auth/*` - Updated with API calls
- `src/screens/main/*` - Updated with API calls
