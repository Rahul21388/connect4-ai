# 🎮 Connect 4 AI Game

A modern, fully-featured **Connect 4 game** built with **React Native + Expo**, featuring:

- Smart AI opponents (Easy / Medium / Hard)
- User profiles with stats tracking
- Leaderboard system using Firebase Firestore
- Sound effects (click, drop, win)
- Dark mode + theme settings
- Clean UI built for mobile-first gameplay

This project is fully owned, independently maintained, and designed for future expansion into a complete game platform.

---

## 🚀 Features

### ✅ Gameplay
- Classic Connect 4 rules
- Smooth disc drop animations
- AI difficulty levels:
  - Easy: Random moves
  - Medium: Blocking + attacking
  - Hard: Minimax-based intelligent play

### ✅ Player System
- Username-based player identity
- Stats saved automatically:
  - Wins
  - Losses
  - Draws
  - Total games played

### ✅ Leaderboard
- Top 10 players ranked by wins
- Highlight current user in leaderboard

### ✅ Settings
- Dark Mode toggle
- Sound Effects toggle

### ✅ Audio Support
- Button click sound
- Disc drop sound
- Win celebration sound

---

## 🛠 Tech Stack

### Frontend
- React Native
- Expo SDK 54
- Expo Router
- TypeScript
- Context API (User + Theme)

### Backend / Database
- Firebase Firestore (Cloud database)
- Local fallback support if Firebase not configured

---

## 📂 Project Structure

frontend/
├── app/
│ ├── index.tsx # Login / Welcome screen
│ ├── menu.tsx # Main menu screen
│ ├── game.tsx # Game screen with AI logic
│ ├── profile.tsx # User profile + stats
│ ├── leaderboard.tsx # Top players ranking
│ ├── settings.tsx # Theme + sound toggles
│
├── src/
│ ├── ai/ # AI difficulty logic
│ ├── components/ # Board + Disc UI
│ ├── context/ # ThemeContext + UserContext
│ ├── firebase/ # Firestore helpers
│ ├── services/ # SoundService
│
├── assets/
│ └── sounds/ # click.mp3, drop.mp3, win.mp3

---

👤 Author

Developed and maintained by:

Rahul Prakash

All branding, code, architecture, and assets are fully owned and controlled by the author.
