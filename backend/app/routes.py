# routes.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.services.gemini_service import process_vent, generate_checkup_message

router = APIRouter()

class ChatRequest(BaseModel):
    user_message: str
    persona: Optional[str]
    band1: Optional[str]
    band2: Optional[str]
    band3: Optional[str]
    band4: Optional[str]
    band5: Optional[str]

class ChatResponse(BaseModel):
    user_message: str
    summary: str
    bot_reply: str
    thread_id: str
    sentiment: dict
    context: dict

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(req: ChatRequest):
    # Pass quiz answers through to your service
    result = process_vent(
        vent_text=req.user_message,
        persona=req.persona,
        band1=req.band1,
        band2=req.band2,
        band3=req.band3,
        band4=req.band4,
        band5=req.band5
    )
    
    return ChatResponse(
        user_message=req.user_message,
        summary   = result.get("summary", ""),
        bot_reply = result.get("bot_reply", "How are you feeling now?"),
        thread_id = result.get("thread_id", ""),
        sentiment = result.get("sentiment", {}),
        context   = result.get("context", {})
    )

@router.get("/checkup")
async def checkup(thread_id: str = Query(..., description="The thread ID for which to generate a check‑in message")):
    try:
        # Now uses the provided thread_id
        checkup_message = generate_checkup_message(thread_id)
        if not checkup_message:
            raise HTTPException(status_code=404, detail="Checkup message not found")
        return {"checkup_message": checkup_message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
