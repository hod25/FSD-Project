# 🛡️ ProSafe – Safety Violation Detection System

A real-time monitoring system for detecting workers without helmets on construction sites using live camera streaming, YOLO-based detection, and a Next.js frontend.

---

## 🚀 Getting Started

### 1. Start the Frontend (Next.js)

cd client
npm install # First-time setup
npm run dev # Starts the frontend at http://localhost:3000

cd detection-service

# Activate virtual environment

.\env\Scripts\activate # Windows PowerShell

# Install Python dependencies (only once)

pip install -r requirements.txt

# Run the FastAPI server

uvicorn main:app --reload # Available at http://localhost:8000

cd server

# Node.js backend setup will be added here soon.
