import os

from dotenv import load_dotenv
from openai import OpenAI

# =====================================
# LOAD ENVIRONMENT VARIABLES
# =====================================

load_dotenv()

# =====================================
# OPENAI CLIENT
# =====================================

client = OpenAI(
    api_key=os.getenv("GENAI_API_KEY"),
    base_url=os.getenv("GENAI_BASE_URL")
)

MODEL = os.getenv("GENAI_MODEL")

# =====================================
# CHAT MEMORY
# =====================================

conversation_memory = {}

# =====================================
# SYSTEM PROMPT
# =====================================

SYSTEM_PROMPT = """
You are BharaMind AI.

Developer: Bharath Kumar Reddy.

If a user asks:

- Who developed you?
- Who created you?
- Who made you?
- Who is your master?

Answer:

I am BharaMind AI, developed by Bharath Kumar Reddy.

You are a professional AI assistant designed to help users with:

- Software Development
- Programming
- Debugging
- Documentation
- Cloud Technologies
- DevOps
- File Analysis
- Learning Assistance
- General Questions

Requirements:

1. Be accurate and professional.
2. Explain concepts clearly.
3. Provide example code when needed.
4. Format answers neatly using Markdown.
5. Analyze uploaded files when provided.
6. Maintain conversation context.
"""

# =====================================
# LLM FUNCTION
# =====================================

def ask_llm(chat_id, message):

    try:

        # Create conversation if it doesn't exist

        if chat_id not in conversation_memory:

            conversation_memory[chat_id] = [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                }
            ]

        # Add user message

        conversation_memory[chat_id].append(
            {
                "role": "user",
                "content": message
            }
        )

        # Prevent memory growth

        if len(conversation_memory[chat_id]) > 30:

            system_message = conversation_memory[chat_id][0]

            recent_messages = conversation_memory[chat_id][-20:]

            conversation_memory[chat_id] = (
                [system_message] + recent_messages
            )

        # Call LLM

        response = client.chat.completions.create(
            model=MODEL,
            messages=conversation_memory[chat_id],
            temperature=0.7,
            max_tokens=2000
        )

        answer = (
            response
            .choices[0]
            .message
            .content
        )

        # Store AI response

        conversation_memory[chat_id].append(
            {
                "role": "assistant",
                "content": answer
            }
        )

        return answer

    except Exception as e:

        print(f"LLM ERROR: {str(e)}")

        return (
            "BharaMind AI encountered an error while "
            "processing your request.\n\n"
            f"Error: {str(e)}"
        )

# =====================================
# OPTIONAL MEMORY CLEAR
# =====================================

def clear_memory(chat_id):

    if chat_id in conversation_memory:

        del conversation_memory[chat_id]

        return True

    return False

# =====================================
# OPTIONAL MEMORY INFO
# =====================================

def get_memory_info():

    return {

        "active_chats": len(conversation_memory),

        "chat_ids": list(
            conversation_memory.keys()
        )

    }