import os
import json
from openai import OpenAI

def get_llm_client():
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    
    if provider == "openrouter":
        api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            return None, os.getenv("LLM_MODEL", "openai/gpt-4o-mini")

        return OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "http://localhost"),
                "X-Title": os.getenv("OPENROUTER_APP_NAME", "AI DevOps Assistant"),
            },
        ), os.getenv("LLM_MODEL", "openai/gpt-4o-mini")

    if provider == "ollama":
        # Connects to local Ollama instance running on default port
        return OpenAI(
            base_url="http://localhost:11434/v1",
            api_key="ollama" # required but ignored by ollama
        ), os.getenv("LLM_MODEL", "llama3")
        
    # Default to OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    return OpenAI(api_key=api_key) if api_key else None, os.getenv("LLM_MODEL", "gpt-4o")

def generate_chat_response(question: str, log_context: str = None) -> str:
    client, model = get_llm_client()
    
    if not client:
        return ("> **System Warning:** The AI Brain is currently offline.\n\n"
                "Please configure a valid `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, "
                "or set `LLM_PROVIDER=ollama` in the AI service `.env` file to "
                "enable the intelligent Chatbot.")
        
    system_prompt = (
        "You are an elite DevOps, cloud infrastructure, and CI/CD AI Assistant.\n"
        "Your role is to diagnose pipeline failures, explain Docker/K8s issues, and provide actionable fixes.\n"
        "Guidelines:\n"
        "1. Act exactly like ChatGPT for DevOps.\n"
        "2. Explain logs like a senior engineer mentoring a junior.\n"
        "3. Provide step-by-step debugging strategies.\n"
        "4. Always format terminal commands, YAML, and Dockerfiles in Markdown code blocks.\n"
        "5. Be concise and eliminate unnecessary fluff."
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    
    user_prompt = f"**User Question:** {question}"
    if log_context:
        user_prompt += f"\n\n**CI/CD Pipeline Log Context:**\n```\n{log_context}\n```\n"
        
    messages.append({"role": "user", "content": user_prompt})
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.3,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"> **Error:** Failed to communicate with LLM Provider ({model}).\n\n```text\n{str(e)}\n```"

def generate_structured_analysis(log_text: str) -> dict:
    client, model = get_llm_client()
    
    fallback_response = {
        "status": "failure",
        "errorType": "LLM Config Error",
        "rootCause": "The AI service is missing an API key.",
        "suggestion": "Configure OPENAI_API_KEY, OPENROUTER_API_KEY, or use Ollama."
    }
    
    if not client:
        return fallback_response
        
    system_prompt = (
        "You are an automated CI/CD Log Analyzer. Read the provided log and return a strictly formatted JSON object.\n"
        "The JSON must have the following keys:\n"
        '- "status": exactly "success" or "failure"\n'
        '- "errorType": 2-4 word summary of the failure (e.g. "Docker Build Failed", "NPM Dependency Error"). If success, "None".\n'
        '- "rootCause": 1-2 sentence human-readable explanation of why it failed.\n'
        '- "suggestion": Markdown-formatted actionable fix, including code blocks for commands to run.'
    )
    
    try:
        response = client.chat.completions.create(
            model=model,
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this log and return JSON:\n\n{log_text[:3000]}"}
            ],
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        fallback_response["rootCause"] = f"LLM Exception: {str(e)}"
        return fallback_response
