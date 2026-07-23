from fastapi import FastAPI
from fastapi import UploadFile
from fastapi import File
from fastapi import Form
from fastapi import HTTPException

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from database import SessionLocal
from database import engine

from models import Base
from models import Message

from llm import ask_llm

import os

# =====================================
# DATABASE
# =====================================

Base.metadata.create_all(
    bind=engine
)

# =====================================
# APP
# =====================================

app = FastAPI()

# =====================================
# GLOBAL FILE STORAGE
# =====================================

uploaded_content = ""
uploaded_filename = ""

# =====================================
# CORS
# =====================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# REQUEST MODEL
# =====================================

class ChatRequest(BaseModel):

    chat_id: str

    message: str

# =====================================
# HOME
# =====================================

@app.get("/")
def home():

    return {
        "message":
        "BharaMind AI Backend Running"
    }

# =====================================
# CHAT
# =====================================

@app.post("/chat")
def chat(req: ChatRequest):

    global uploaded_content
    global uploaded_filename

    db = SessionLocal()

    try:

        prompt = req.message

        if uploaded_content:

            prompt = f"""
You are helping the user analyze an uploaded file.

Uploaded File:
{uploaded_filename}

File Content:
{uploaded_content}

User Question:
{req.message}
"""

        # =====================================
        # LOAD PREVIOUS CHAT HISTORY
        # =====================================

        previous_messages = db.query(
            Message
        ).filter(
            Message.chat_id == req.chat_id
        ).all()

        full_prompt = ""

        for msg in previous_messages:

            role = msg.role

            if role == "ai":
                role = "assistant"

            full_prompt += (
                f"{role}: {msg.message}\n\n"
            )

        full_prompt += (
            f"user: {prompt}"
        )

        # =====================================
        # LLM CALL
        # =====================================

        response = ask_llm(
            req.chat_id,
            full_prompt
        )

        uploaded_content = ""
        uploaded_filename = ""

        # =====================================
        # SAVE USER MESSAGE
        # =====================================

        db.add(
            Message(
                chat_id=req.chat_id,
                role="user",
                message=req.message
            )
        )

        # =====================================
        # SAVE AI RESPONSE
        # =====================================

        db.add(
            Message(
                chat_id=req.chat_id,
                role="ai",
                message=response
            )
        )

        db.commit()

        return {
            "response": response
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        db.close()

# =====================================
# FILE UPLOAD
# =====================================

@app.post("/upload")
async def upload_file(
    chat_id: str = Form(...),
    file: UploadFile = File(...)
):

    global uploaded_content
    global uploaded_filename

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    filepath = os.path.join(
        "uploads",
        file.filename
    )

    content = await file.read()

    with open(
        filepath,
        "wb"
    ) as f:

        f.write(content)

    uploaded_filename = file.filename

    try:

        uploaded_content = content.decode(
            "utf-8",
            errors="ignore"
        )

    except Exception:

        uploaded_content = ""

    # Save uploaded filename to chat history

    db = SessionLocal()

    try:

        db.add(
            Message(
                chat_id=chat_id,
                role="file",
                message=f"📄 Uploaded File: {file.filename}"
            )
        )

        db.commit()

    finally:

        db.close()

    return {

        "filename": file.filename,

        "message": "File uploaded successfully"

    }

# =====================================
# CURRENT FILE
# =====================================

@app.get("/current-file")
def current_file():

    return {

        "filename":
        uploaded_filename,

        "has_content":
        bool(uploaded_content)

    }

# =====================================
# CHAT HISTORY
# =====================================

@app.get("/history/{chat_id}")
def get_history(chat_id: str):

    db = SessionLocal()

    try:

        chats = db.query(
            Message
        ).filter(
            Message.chat_id == chat_id
        ).all()

        result = []

        for chat in chats:

            result.append({

                "role":
                chat.role,

                "message":
                chat.message

            })

        return result

    finally:

        db.close()

# =====================================
# ALL CHATS
# =====================================

@app.get("/chats")
def get_all_chats():

    db = SessionLocal()

    try:

        chats = db.query(
            Message
        ).all()

        unique_chats = []

        added = set()

        for chat in chats:

            if (
                chat.chat_id not in added
                and chat.role == "user"
            ):

                unique_chats.append({

                    "chat_id":
                    chat.chat_id,

                    "title":
                    chat.message[:40]

                })

                added.add(
                    chat.chat_id
                )

        return unique_chats

    finally:

        db.close()

# =====================================
# DELETE CHAT
# =====================================

@app.delete("/chat/{chat_id}")
def delete_chat(chat_id: str):

    db = SessionLocal()

    try:

        db.query(
            Message
        ).filter(
            Message.chat_id == chat_id
        ).delete()

        db.commit()

        return {

            "message":
            "Chat deleted"

        }

    finally:

        db.close()