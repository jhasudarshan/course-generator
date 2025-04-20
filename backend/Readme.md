**Backend Setup**
cd backend
python -m venv venv
venv\Scripts\activate

**requirements.txt**
pip install fastapi uvicorn python-dotenv
pip install -q -U google-genai
pip install google-api-python-client google-auth-oauthlib google-auth
pip install pymongo


**running backend cmd**
uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload

**api-docs**
127.0.0.1:8002/docs