# 🌟 AI-Powered Course Generator - COURSEGEN 🌟
🚀 Revolutionizing e-learning with automated, personalized course creation. 🚀

---

## 🎯 Overview
The COURSEGEN automates the process of creating e-learning courses, enabling educators and learners to access high-quality, personalized content tailored to specific topics and audiences.

### ✨ Features
- 🧠 **AI-generated course outlines** and lessons.
- 🎥 Integrated **YouTube videos** for engaging multimedia content.
- ❓ Automated **quiz** and **assignment** generation.
- 🌎 **Multilingual support** for global accessibility.
- 🖥️ **User-friendly interface** for topic and audience customization.

---

## 💻 Technology Stack
- **Frontend:** ⚛️ React.js, 🎨 Tailwind CSS
- **Backend:** 🐍 Python, ⚡ FastAPI
- **APIs:** 🎥 YouTube API, 🤖 Gemini API
- **Database:** 🍃 MongoDB
- **Other Tools:** 🔐 Google cloud, 🔗 Pymongo

---

## 🔧 Backend Setup

### 🛠️ 1. Setup Virtual Environment
Run the following commands:
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Activate the virtual environment

🔧 Backend Setup
🛠️ 1. Setup Virtual Environment
Run the following commands:
bashcd backend
python -m venv venv
venv\Scripts\activate   # Activate the virtual environment
📦 2. Install Dependencies
Install all required Python packages:
bashpip install fastapi uvicorn python-dotenv
pip install -q -U google-genai
pip install google-api-python-client google-auth-oauthlib google-auth
pip install pymongo
▶️ 3. Running the Backend
Start the backend server by running:
bashuvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
This will start the server on 127.0.0.1:8002 with hot-reload enabled for development.
📜 4. API Documentation
Access the interactive API documentation (powered by Swagger UI) at:
📘 http://127.0.0.1:8002/docs
This includes a detailed list of API endpoints, request/response structures, and example queries.

⚙️ How It Works

📝 Input: Users provide topic, description, difficulty level, and language.
💡 Process: The backend integrates AI models and APIs to generate:

📖 Chapter modules with theory content and multimedia.
❓ Interactive quizzes and assignments.


📊 Output: Ready-to-use e-learning courses with dynamic multimedia and quizzes for engagement.


🤝 Contributing
