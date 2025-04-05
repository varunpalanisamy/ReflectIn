from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import process_vent

router = APIRouter()

# Request model for venting
class VentRequest(BaseModel):
    user_id: str
    vent_text: str

# Response model
class VentResponse(BaseModel):
    summary: str
    reflective_prompt: str

@router.post("/vent", response_model=VentResponse)
async def create_vent(vent_req: VentRequest):
    # Process the vent using Gemini API
    summary, prompt = process_vent(vent_req.vent_text)
    return VentResponse(summary=summary, reflective_prompt=prompt)

@router.get("/followup/{session_id}")
async def get_followup(session_id: str):
    # Simulated follow-up response
    followup_prompt = "How have you been feeling since your last reflection?"
    return {"session_id": session_id, "followup_prompt": followup_prompt}
