from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import process_vent

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
