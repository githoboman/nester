import json
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse

from app.services.claude import get_claude_stream
from app.services.prometheus import construct_system_message, filter_ai_output, validate_id
from app.services.conversation_store import conversation_store

router = APIRouter(prefix="/chat", tags=["AI"])

class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_id: Optional[str] = None
    context: Optional[dict] = None

@router.post("")
async def chat_endpoint(request: Request, body: ChatRequest):
    # Apply rate limiting
    limiter = request.app.state.limiter
    # Rate limit check is usually handled by a decorator, but we can do it manually if needed.
    # For now we rely on the middleware or global setup if we added it there.
    # Actually, slowapi works with decorators. We'll add it to main.py or here.

    session_id = body.session_id
    if body.user_id:
        validate_id(body.user_id)
    
    # Retrieve history
    history = conversation_store.get_history(session_id)
    
    # Build context
    context = body.context or {}
    system_message = construct_system_message(context)
    
    # Add user message to history
    conversation_store.add_message(session_id, "user", body.message)
    
    # Prepare messages for Claude
    claude_messages = conversation_store.get_history(session_id)
    
    async def event_generator():
        full_response = ""
        try:
            async for event in get_claude_stream(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                system=system_message,
                messages=claude_messages
            ):
                if event.type == "content_block_delta":
                    token = event.delta.text
                    full_response += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
            
            # After stream completes, filter and store the full response
            filtered_response = filter_ai_output(full_response)
            conversation_store.add_message(session_id, "assistant", filtered_response)
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
