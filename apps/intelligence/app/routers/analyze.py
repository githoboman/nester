from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Request, HTTPException

from app.services.claude import get_claude_response
from app.services.prometheus import construct_system_message, filter_ai_output

router = APIRouter(prefix="/analyze", tags=["AI"])

class AnalyzeRequest(BaseModel):
    data: Dict[str, Any]
    analysis_type: str = "portfolio"

@router.post("")
async def analyze_endpoint(request: Request, body: AnalyzeRequest):
    # Construct a prompt specifically for structured analysis
    system_message = construct_system_message(body.data)
    user_message = f"Please provide a structured analysis of this {body.analysis_type} data. Return only JSON."
    
    try:
        response = await get_claude_response(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            system=system_message,
            messages=[{"role": "user", "content": user_message}]
        )
        
        content = response.content[0].text
        # We assume Claude returns JSON as requested
        # In a real system, we might use Claude's tool use or structured output features
        return {"analysis": filter_ai_output(content)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
