# AI Tutor App - Student Dashboard

A React Native mobile application for K-12 students with AI-powered tutoring features.

## Features

- 🏠 **Student Dashboard** - Overview with stats, study plan, subjects progress
- 📚 **Learn** - Browse subjects and chapters
- 📝 **Quizzes** - Topic quizzes, chapter tests, mock exams
- 📊 **Progress** - Analytics, weekly charts, subject progress
- 👤 **Profile** - Settings, preferences, account management
- 💬 **AI Doubt Resolution** - Chat interface for asking doubts
- 🌙 **Dark Mode** - Full light/dark theme support

## Tech Stack

- React Native 0.83.1
- React Navigation 7
- React Native Reanimated 3
- React Native SVG
- React Native Vector Icons
- TypeScript

## Prerequisites

- Node.js >= 20
- JDK 17 (for Android)
- Android Studio with SDK (for Android)
- Xcode (for iOS, macOS only)

## Setup Instructions

### 1. Install Dependencies

```bash
cd ai-tutor-app-FE
npm install
```

### 2. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 3. Run the App

#### Android

```bash
# Start Metro bundler (Terminal 1)
npm start

# Run Android (Terminal 2)
npm run android
```

#### iOS (macOS only)

```bash
npm run ios
```

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Core UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── Icon.tsx
│   │   └── cards/             # Specialized cards
│   │       ├── SubjectCard.tsx
│   │       ├── StatsCard.tsx
│   │       └── StudyPlanCard.tsx
│   └── chat/                  # Chat components
│
├── screens/
│   ├── auth/                  # Authentication screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── VerifyOTPScreen.tsx
│   │   └── OnboardingScreen.tsx
│   │
│   └── main/                  # Main app screens
│       ├── HomeScreen.tsx
│       ├── LearnScreen.tsx
│       ├── QuizzesScreen.tsx
│       ├── ProgressScreen.tsx
│       ├── ProfileScreen.tsx
│       └── DoubtScreen.tsx
│
├── navigation/                # React Navigation setup
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainTabNavigator.tsx
│
├── constants/
│   └── theme.ts               # Design system
│
├── hooks/
│   └── useThemeColor.ts       # Theme hook
│
└── types/
    └── navigation.ts          # TypeScript types
```

## Design System

The app uses a comprehensive design system in `src/constants/theme.ts`:

### Colors
- **Primary**: Indigo (#6366F1)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Subject Colors**: Pink (Math), Green (Science), Blue (English), etc.

### Typography
- Font sizes: xs (12) to 5xl (48)
- System fonts (Roboto on Android, System on iOS)

### Spacing
- 4px base unit scale (xs to 5xl)

### Border Radius
- sm (4px) to full (9999px)

## Screens

### Auth Flow
1. **Login** - Email/phone + password
2. **Register** - Full registration form
3. **Verify OTP** - 6-digit OTP verification
4. **Onboarding** - 4-step wizard (Name → Board → Class → Medium)

### Main App
1. **Home** - Dashboard with stats, study plan, subjects
2. **Learn** - Subject grid with progress
3. **Quizzes** - Quiz list with filters
4. **Progress** - Analytics and charts
5. **Profile** - Settings and account

### Modal
- **Doubt** - AI chat for asking doubts

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### Android Build Issues
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

### iOS Build Issues
```bash
cd ios && pod deintegrate && pod install && cd ..
npm run ios
```

### Vector Icons Not Showing
Make sure fonts are linked properly:
- Android: Check `android/app/build.gradle` has vector icons gradle line
- iOS: Check `ios/aitutorpp/Info.plist` has font entries

## Contributing

1. Create feature branch
2. Make changes
3. Test on both Android and iOS
4. Submit PR

## License

MIT
