# 🧠 BharaMind AI
BharaMind AI is a full-stack AI-powered conversational assistant built using FastAPI, SQLite, JavaScript, and OpenAI-compatible Generative AI services.

The application enables users to interact with AI, maintain multiple chat sessions, upload files for analysis, and retrieve persistent chat history through an intuitive web interface.

---
## Features

✅ AI-powered conversations

✅ Multiple chat sessions

✅ Persistent chat history

✅ File upload and analysis

✅ Markdown-formatted responses

✅ Copy response functionality

✅ Dark / Light mode

✅ Chat deletion

✅ Dynamic chat titles

---
# Technology Stack

## Frontend
- HTML
- CSS
- JavaScript
- Marked.js
## Backend

- Python
- FastAPI
## Database

- SQLite
- SQLAlchemy
## AI Integration

- OpenAI Python SDK
- OpenAI-Compatible Generative AI Models
## Configuration

- Python Dotenv
---
# Project Architecture
```
+----------------+
|      User      |
+----------------+
        |
        v
+----------------+
| Frontend (UI)  |
| HTML/CSS/JS    |
+----------------+
        |
        v
+----------------+
| FastAPI Backend|
+----------------+
       / \
      /   \
     v     v
+---------+   +------------+
| SQLite  |   | AI Model   |
| Database|   | (GPT/LLM)  |
+---------+   +------------+
      \        /
       \      /
        v    v
+----------------+
|  AI Response   |
+----------------+
        |
        v
+----------------+
| Display Result |
+----------------+
```
---
# Application Workflow
# Step 1: Create Chat
Example:
```
Explain FastAPI
```
---
# Step 2: Request Processing
```
{
  "chat_id":"uuid",
  "message":"Explain FastAPI"
}
```
---
# Step 3: Retrieve Context
Existing chat history is loaded from SQLite.

---

# Step 4: AI Processing
User prompt and uploaded file content (if available) are sent to the configured AI model.

---

# Step 5: Response Generation
The AI model generates a response.

---

# Step 6: Save Conversation
Both user and AI messages are stored in the database.

---

# Step 7: Display Response
Response is rendered using Markdown formatting in the chat interface.

---

# File Upload Workflow
1. User uploads a file.
2. Backend reads file content.
3. Content is added to AI prompt.
4. AI analyzes the file.
5. Response is displayed to the user.
---
# Folder Structure
```
BharaMind-AI/
│
├── main.py
├── llm.py
├── database.py
├── models.py
├── requirements.txt
├── .env
│
├── static/
│   ├── style.css
│   └── script.js
│
├── templates/
│   └── index.html
│
├── architecture.png
│
└── README.md
```
---
# Configure Environment Variables
Create a .env file in the root directory.
```
GENAI_API_KEY=your_api_key
GENAI_BASE_URL=your_genai_endpoint
GENAI_MODEL=your_model_name
```
# Environment Variables

| Variable         | Description            |
| ---------------- | ---------------------- |
| GENAI_API_KEY  | API authentication key |
| GENAI_BASE_URL | AI endpoint URL        |
| GENAI_MODEL     | AI model name          |

---

# Run Application
# Start Backend
```
uvicorn main:app --reload
```
# Backend URL:
```
http://127.0.0.1:8000
```
# Start Frontend
```
python -m http.server 5500
```
# Frontend URL:
```
http://localhost:5500/
```
---
# Screenshots
## Home Page

BharaMind AI landing page with chat sidebar and conversation area.
<img width="940" height="552" alt="image" src="https://github.com/user-attachments/assets/6ec34273-3d37-452a-b496-f0425959c36e" />

---
## Chat Interface

User and AI conversation window.
<img width="940" height="551" alt="image" src="https://github.com/user-attachments/assets/749e610e-570f-4004-9dca-7c7087de3ce1" />

---
## File Upload

File upload and analysis feature.
<img width="941" height="550" alt="image" src="https://github.com/user-attachments/assets/47103c4e-8252-4259-a4b5-5a466055abf4" />

---
## Light Mode

Light-themed user interface.
<img width="940" height="551" alt="image" src="https://github.com/user-attachments/assets/7a08ca2e-ef33-4db9-8b0a-da147550bcba" />

---
## Chat History

Multiple chat management and retrieval.
<img width="940" height="552" alt="image" src="https://github.com/user-attachments/assets/48ec4c8f-4db9-4a82-a3e8-27d0d2d9e5dc" />

# Author
### B Bharath Kumar Reddy
