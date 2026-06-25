# PronouncePro AI ->  AI-Powered English Pronunciation Learning Platform

PronouncePro AI is a modern web application designed to help users improve their English pronunciation through real-time speech recognition, pronunciation analysis, progress tracking, and interactive learning experiences.

The platform leverages browser-based speech technologies to evaluate spoken words, provide instant feedback, and track user performance over time through detailed analytics and achievement-based learning.

---
### Quick Start (Windows)

 Run Commands
# Action	                          Command
Launch Application               	Open index.html
Enable Microphone	Browser          Permission
Start Practice	                 Enter Word & Click Speak

---

### Core Technologies
# Frontend
HTML5
CSS3
JavaScript 

# Browser APIs
Web Speech Recognition API
Speech Synthesis API
Local Storage API

# External Services
Dictionary API (dictionaryapi.dev)

# Analytics
Chart.js

 ---
 
 ### Algorithms & Concepts
 
# Pronunciation Evaluation
* Levenshtein Distance Algorithm
* String Similarity Scoring
* Character-Level Comparison
  
# Speech Processing
* Speech-to-Text Recognition
* Text-to-Speech Synthesis
* Pronunciation Guidance
  
# Learning Analytics
* Average Score Calculation
* Best Score Tracking
* Streak Calculation
* Badge Achievement Logic

  ---

### Achievement System

Users unlock badges based on their learning performance:

| Badge                  | Requirement             |
| ---------------------- | ----------------------- |
| 🥉 Bronze Speaker      | 50 successful attempts  |
| 🥈 Silver Speaker      | 200 successful attempts |
| 🥇 Gold Speaker        | 500 successful attempts |
| ⚡ Consistency Champion | 7-day practice streak   |
| 🎯 Accuracy Expert     | 95%+ average accuracy   |



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
