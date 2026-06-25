# PronouncePro AI ->  AI-Powered English Pronunciation Learning Platform

PronouncePro AI is a modern web application designed to help users improve their English pronunciation through real-time speech recognition, pronunciation analysis, progress tracking, and interactive learning experiences.

The platform leverages browser-based speech technologies to evaluate spoken words, provide instant feedback, and track user performance over time through detailed analytics and achievement-based learning.

---

## Overview

Learning correct pronunciation is a major challenge for English learners. PronouncePro AI addresses this problem by providing an intuitive and engaging environment where users can practice words, receive immediate feedback, and monitor their improvement through personalized statistics and progress dashboards.

The application combines speech recognition, pronunciation scoring, gamification, and modern UI/UX principles to create an effective learning experience.

---

## Key Features

### Authentication System

* User Registration and Login
* Email or Username-based Authentication
* Password Strength Validation
* Password Reset Functionality
* Session Persistence using Local Storage
* Google Sign-In Simulation

### Pronunciation Practice

* Practice pronunciation of custom English words
* Browser-based Speech Recognition
* Real-Time Pronunciation Evaluation
* Instant Accuracy Scoring
* Interactive Pronunciation Feedback
* Letter-by-Letter Comparison Analysis

### Pronunciation Assistance

* Audio Pronunciation Playback
* Dictionary API Integration
* Speech Synthesis Fallback Support
* Simplified Pronunciation Guidance

### Analytics Dashboard

* Total Practice Sessions
* Average Pronunciation Score
* Best Performance Tracking
* Daily Activity Monitoring
* Learning Streak Calculation
* Progress Visualization

### Achievement System

Users unlock badges based on their learning performance:

| Badge                  | Requirement             |
| ---------------------- | ----------------------- |
| 🥉 Bronze Speaker      | 50 successful attempts  |
| 🥈 Silver Speaker      | 200 successful attempts |
| 🥇 Gold Speaker        | 500 successful attempts |
| ⚡ Consistency Champion | 7-day practice streak   |
| 🎯 Accuracy Expert     | 95%+ average accuracy   |

###  Modern User Experience

* Fully Responsive Design
* Light & Dark Theme Support
* Glassmorphism UI Components
* Smooth Page Transitions
* Animated Feedback System
* Toast Notifications
* Interactive Learning Interface

---

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript 

### Browser APIs

* Web Speech Recognition API
* Speech Synthesis API
* Local Storage API

### External Services

* Dictionary API (dictionaryapi.dev)
* Google Fonts

### Visualization

* Chart.js
---

##  How It Works

1. User creates an account or signs in.
2. A word is entered for pronunciation practice.
3. The application retrieves pronunciation guidance.
4. The user speaks the word using their microphone.
5. Speech Recognition captures the spoken input.
6. The system compares spoken output with the target word.
7. A pronunciation score is generated.
8. Feedback and suggestions are displayed instantly.
9. Results are saved for future analytics and progress tracking.

---

##  Pronunciation Evaluation

The application uses a similarity-based scoring mechanism to compare the expected word against the recognized spoken word.

### Feedback Categories

| Score    | Result                     |
| -------- | -------------------------- |
| 95–100   | Excellent Pronunciation 🎉 |
| 80–94    | Good Pronunciation 👍      |
| 60–79    | Needs Improvement 💪       |
| Below 60 | Practice Again 🔁          |

---

##  Data Management

Currently, the application stores data locally within the browser using Local Storage.

Stored information includes:

* User Accounts
* Login Sessions
* Practice History
* Achievement Progress
* Theme Preferences
* Dashboard Statistics

No external database or backend server is required.

---

##  Theme Support

PronouncePro AI includes built-in theme switching functionality:

* ☀️ Light Mode
* 🌙 Dark Mode

User preferences are automatically preserved between sessions.

---
