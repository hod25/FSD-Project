# 🛡️ ProSafe – Safety Violation Detection System

A real-time monitoring system for detecting workers without helmets on construction sites using live camera streaming, YOLO-based detection, and a Next.js frontend.

---

---

## 🚀 Getting Started

### 1. Start the Frontend (Next.js)

```bash
cd client
npm install      # First-time setup
npm run dev      # Starts the frontend at http://localhost:3000

cd detection-service

.\env\Scripts\activate       # Windows PowerShell

pip install -r requirements.txt

uvicorn main:app --reload    # Available at http://localhost:8000

cd server
# Node.js backend setup will be added here soon.
```
