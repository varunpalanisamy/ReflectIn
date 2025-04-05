from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import process_vent

router = APIRouter()

class ChatMessage(BaseModel):
    user_message: str

class ChatResponse(BaseModel):
    user_message: str
    bot_reply: str
    sentiment: dict
    context: dict

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_msg: ChatMessage):
    # Process the vent text using your existing Gemini service function.
    result = process_vent(chat_msg.user_message)
    
    # The reflective prompt is what the bot "says" in response.
    bot_reply = result.get("reflective_prompt", "How are you feeling now?")
    
    return ChatResponse(
         user_message = chat_msg.user_message,
         bot_reply = bot_reply,
         sentiment = result.get("sentiment", {}),
         context = result.get("context", {})
    )
