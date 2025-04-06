# routes.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.gemini_service import process_vent, generate_checkup_message


router = APIRouter()

class ChatMessage(BaseModel):
    user_message: str

class ChatResponse(BaseModel):
    user_message: str
    summary: str
    bot_reply: str
    thread_id: str
    sentiment: dict
    context: dict

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_msg: ChatMessage):
    result = process_vent(chat_msg.user_message)
    
    return ChatResponse(
         user_message = chat_msg.user_message,
         summary = result.get("summary", ""),
         bot_reply = result.get("bot_reply", "How are you feeling now?"),
         thread_id = result.get("thread_id", ""),
         sentiment = result.get("sentiment", {}),
         context = result.get("context", {})
    )
    

@router.get("/checkup")
async def checkup():
    try:
        # Call generate_checkup_message with an empty string (or any default value).
        checkup_message = generate_checkup_message("")
        if not checkup_message:
            raise HTTPException(status_code=404, detail="Checkup message not found")
        return {"checkup_message": checkup_message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
