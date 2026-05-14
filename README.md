# GymTracker Backend 🚀

A robust backend for workout and nutrition management, powered by Artificial Intelligence. Originally developed as a project for FIB-UPC and evolved into a comprehensive fitness solution.

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **AI:** Integration with Gemini, Groq, and Cohere for personalized insights.
- **Authentication:** JWT (JSON Web Tokens)
- **Infrastructure:** Docker & Kubernetes (K8s)

## ✨ Key Features
- **User Management:** Registration, login, and personalized user profiles.
- **Workout Tracking:** Creation and logging of routines and exercise sessions.
- **Nutrition Module:** Caloric intake and macronutrient breakdown tracking.
- **AI Insights:** Generation of personalized recommendations based on user progress.
- **Intelligent Chatbot:** Virtual assistant to solve doubts about exercises and diets.

## 🚀 Installation and Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ivanMoral23/FitTrack-backend.git
   cd FitTrack-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the `.env.example` file to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

## 🐳 Docker
The project includes Docker Compose configuration for easy setup:
```bash
docker-compose up --build
```

---
*Developed by Iván Fernández - 2026*
