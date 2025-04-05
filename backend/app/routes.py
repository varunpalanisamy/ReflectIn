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
    sentiment: dict
    context: dict

@router.post("/vent", response_model=VentResponse)
async def create_vent(vent_req: VentRequest):
    result = process_vent(vent_req.vent_text)
    return VentResponse(**result)
