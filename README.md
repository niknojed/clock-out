# Flow Timer App

A mobile/web application designed to help you "Clock Out" of normal work tasks and focus on creative passion projects.

## 📱 About

Flow Timer helps you capture those moments of inspiration and creative flow by providing a dedicated focus timer that:

- Blocks time specifically for your creative passion projects
- Helps you maintain focus with visual cues and timers
- Lets you reflect on your accomplishments after each session
- Tracks your projects and flow sessions over time

## ✨ Features

- **Quick Flow Timer**: Start a focus session with just a click
- **Customizable Duration**: Set your ideal focus time (default: 15 minutes)
- **Visual Feedback**: Gradient background changes as time progresses
- **Flexible Extension**: Add more time when you're in the zone
- **Project Tracking**: Organize and track different creative projects
- **Session Reflection**: Capture your thoughts and accomplishments after each session
- **Progress Tracking**: View stats about each project and your focus habits

## 🔧 Technology Stack

- **Framework**: Expo / React Native
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **Storage**: AsyncStorage for local data (Firebase integration optional)
- **UI Components**: Custom components with expo-linear-gradient for visual effects
- **Language**: TypeScript

## 📋 Getting Started

1. Make sure you have the Expo CLI installed:
   ```
   npm install -g expo-cli
   ```

2. Install all dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npx expo start
   ```

4. Open the app on your device using Expo Go by scanning the QR code, or run in a simulator/emulator

## 🏗️ Project Structure

```
CLOCKOUT/
├── app/                  # Expo Router app directory (contains screens)
│   ├── _layout.tsx       # Root layout configuration
│   ├── index.tsx         # Home screen
│   ├── flow-timer.tsx    # Timer screen
│   ├── reflection.tsx    # Reflection screen
│   └── projects.tsx      # Projects list screen
├── components/           # Reusable UI components
│   ├── GradientBackground.tsx
│   └── Timer.tsx
├── src/                  # Core application code
│   ├── config/           # Configuration files
│   │   └── firebase.js   # Optional Firebase configuration
│   ├── services/         # Business logic and services
│   │   └── projectService.ts
│   └── utils/            # Helper functions
│       └── timeUtils.ts
├── assets/               # Images, fonts, and other static files
└── ...                   # Configuration files
```

## 🚀 Future Enhancements

- Cross-platform availability (Android, Web)
- Cloud synchronization with Firebase
- Customizable reflection prompts
- Project categories and tags
- Focus mode analytics and insights
- Integration with calendar for scheduling flow sessions

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.