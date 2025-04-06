from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    user_message: str
    persona: Optional[str]
    band1: Optional[str]
    band2: Optional[str]
    band3: Optional[str]
    band4: Optional[str]
    band5: Optional[str]
