from pydantic import BaseModel

class LogRequest(BaseModel):
    logInput: str

class AiAnalysisResponse(BaseModel):
    status: str
    errorType: str
    rootCause: str
    suggestion: str

from typing import Optional

class ChatRequest(BaseModel):
    question: str
    logContext: Optional[str] = None

class ChatResponse(BaseModel):
    response: str

