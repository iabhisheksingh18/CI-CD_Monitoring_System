from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv() # Load LLM Config from .env

from model.schemas import LogRequest, AiAnalysisResponse
from utils.analyzer import analyze_build_log

app = FastAPI(title="AI Log Analyzer Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Service Running"}

@app.post("/analyze-log", response_model=AiAnalysisResponse)
@app.post("/analyze_log", response_model=AiAnalysisResponse)  # Added to ensure backward compatibility with earlier Java mapping
def analyze_log_endpoint(request: LogRequest):
    result = analyze_build_log(request.logInput)
    
    return AiAnalysisResponse(
        status=result["status"],
        errorType=result["errorType"],
        rootCause=result["rootCause"],
        suggestion=result["suggestion"]
    )

from model.schemas import ChatRequest, ChatResponse
from utils.llm_client import generate_chat_response

@app.post("/chat", response_model=ChatResponse)
def execute_chat(request: ChatRequest):
    answer = generate_chat_response(request.question, request.logContext)
    return ChatResponse(response=answer)

