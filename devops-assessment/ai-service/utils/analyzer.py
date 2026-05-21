from utils.llm_client import generate_structured_analysis

def analyze_build_log(log_text: str) -> dict:
    """
    Passes the raw build log to the LLM Client to extract a structured JSON analysis.
    The LLM (OpenAI/Ollama) will determine if the build succeeded or failed, 
    extract the root cause, and suggest automated fixes.
    """
    
    # Check for empty logs
    if not log_text or len(log_text.strip()) == 0:
        return {
            "status": "failure",
            "errorType": "Empty Log",
            "rootCause": "No log data was provided to the analyzer.",
            "suggestion": "Check the pipeline runner to ensure logs are being streamed correctly."
        }
        
    # Delegate deep analysis to the LLM (OpenAI / Ollama)
    return generate_structured_analysis(log_text)
