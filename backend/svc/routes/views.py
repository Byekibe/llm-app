from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, File, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import google.generativeai as genai
import base64
import io
import asyncio
from PIL import Image

from svc.core.auth import get_current_user
from svc.core import config

# Initialize Gemini API
genai.configure(api_key=config.GEMINI_API_KEY)

router = APIRouter()

# ----- Pydantic Models for Request/Response -----

class GenerateRequest(BaseModel):
    prompt: str
    model_name: str = "gemini-pro"
    temperature: Optional[float] = 0.7
    max_output_tokens: Optional[int] = 2048
    top_p: Optional[float] = 0.95
    top_k: Optional[int] = 40

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    parts: List[Dict[str, str]]  # List of content objects, e.g. [{"text": "Hello!"}]

class ChatRequest(BaseModel):
    history: List[ChatMessage]
    new_message: str
    model_name: str = "gemini-pro"
    temperature: Optional[float] = 0.7
    max_output_tokens: Optional[int] = 2048

class ImageData(BaseModel):
    mime_type: str
    data: str  # Base64 encoded string

class VisionRequest(BaseModel):
    prompt: str
    image_data: List[ImageData]
    model_name: str = "gemini-pro-vision"
    temperature: Optional[float] = 0.7
    max_output_tokens: Optional[int] = 2048

class EmbedRequest(BaseModel):
    text: Union[str, List[str]]
    model_name: str = "embedding-001"
    task_type: Optional[str] = "RETRIEVAL_QUERY"
    title: Optional[str] = None

class ApiResponse(BaseModel):
    text: str
    usage: Optional[Dict[str, Any]] = None

class ChatApiResponse(BaseModel):
    text: str
    updated_history: List[ChatMessage]
    usage: Optional[Dict[str, Any]] = None

class EmbedApiResponse(BaseModel):
    embedding: Union[List[float], List[List[float]]]
    usage: Optional[Dict[str, Any]] = None

class ModelInfo(BaseModel):
    name: str
    description: str
    supported_generation_methods: List[str]
    input_token_limit: int
    output_token_limit: int
    
class ModelsResponse(BaseModel):
    models: List[ModelInfo]

# ----- API Endpoints -----

@router.post("/generate", response_model=ApiResponse, tags=["text"])
# async def generate_text(request: GenerateRequest, auth: Any = Depends(get_current_user)):
async def generate_text(request: GenerateRequest):
    """Generate text from a prompt using Gemini."""
    try:
        model = genai.GenerativeModel(model_name=request.model_name)
        generation_config = {
            "temperature": request.temperature,
            "max_output_tokens": request.max_output_tokens,
            "top_p": request.top_p,
            "top_k": request.top_k,
        }
        
        response = await model.generate_content_async(
            request.prompt,
            generation_config=generation_config
        )
        
        return {
            "text": response.text,
            "usage": {
                "prompt_tokens": getattr(response, "prompt_token_count", 0),
                "completion_tokens": getattr(response, "candidates_token_count", 0),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating text: {str(e)}")

@router.post("/chat", response_model=ChatApiResponse, tags=["chat"])
# async def chat(request: ChatRequest, auth: Any = Depends(get_current_user)):
async def chat(request: ChatRequest):
    """Handle multi-turn conversations with Gemini."""
    try:
        model = genai.GenerativeModel(model_name="gemini-2.0-flash")
        
        # Convert your ChatMessage history to Gemini's expected format
        gemini_history = []
        for msg in request.history:
            # Convert each message to the format Gemini expects
            content = []
            for part in msg.parts:
                if "text" in part:
                    content.append({"text": part["text"]})
            
            gemini_history.append({
                "role": msg.role,
                "parts": content
            })
        
        # Start chat with properly formatted history
        chat = model.start_chat(history=gemini_history)
        
        response = await chat.send_message_async(request.new_message)
        
        # Rest of your function...
        updated_history = request.history.copy()
        updated_history.append(
            ChatMessage(role="user", parts=[{"text": request.new_message}])
        )
        updated_history.append(
            ChatMessage(role="model", parts=[{"text": response.text}])
        )
        
        return {
            "text": response.text,
            "updated_history": updated_history,
            "usage": {
                "prompt_tokens": getattr(response, "prompt_token_count", 0),
                "completion_tokens": getattr(response, "candidates_token_count", 0),
            }
        }
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

async def chat_stream_generator(chat, message):
    """Generate streaming responses for chat."""
    response = await chat.send_message_async(message, stream=True)
    
    async for chunk in response:
        if hasattr(chunk, "text"):
            yield f"data: {chunk.text}\n\n"
        await asyncio.sleep(0.01)  # Small delay to avoid overwhelming client
    
    yield "data: [DONE]\n\n"

@router.post("/chat/stream", tags=["chat"])
# async def chat_stream(request: ChatRequest, auth: Any = Depends(get_current_user)):
async def chat_stream(request: ChatRequest):
    """Stream chat responses character by character."""
    try:
        model = genai.GenerativeModel(model_name=request.model_name)
        chat = model.start_chat(history=request.history)
        
        return StreamingResponse(
            chat_stream_generator(chat, request.new_message),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chat stream: {str(e)}")

@router.post("/vision/generate", response_model=ApiResponse, tags=["vision"])
# async def vision_generate(request: VisionRequest, auth: Any = Depends(get_current_user)):
async def vision_generate(request: VisionRequest):
    """Generate text from a prompt and images using Gemini Vision."""
    try:
        model = genai.GenerativeModel(model_name=request.model_name)
        
        # Process images
        contents = [request.prompt]
        for img in request.image_data:
            image_bytes = base64.b64decode(img.data)
            image = Image.open(io.BytesIO(image_bytes))
            contents.append(image)
        
        response = await model.generate_content_async(contents)
        
        return {
            "text": response.text,
            "usage": {
                "prompt_tokens": getattr(response, "prompt_token_count", 0),
                "completion_tokens": getattr(response, "candidates_token_count", 0),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating vision response: {str(e)}")

@router.post("/embed", response_model=EmbedApiResponse, tags=["embedding"])
# async def embed_text(request: EmbedRequest, auth: Any = Depends(get_current_user)):
async def embed_text(request: EmbedRequest):
    """Generate embeddings for text."""
    try:
        embedding_model = genai.get_embedding_model(model_name=request.model_name)
        
        if isinstance(request.text, str):
            result = await embedding_model.embed_content_async(
                request.text,
                task_type=request.task_type,
                title=request.title
            )
            embedding = result.embedding
        else:  # List of strings
            results = await embedding_model.batch_embed_contents_async(
                request.text,
                task_type=request.task_type,
                title=request.title
            )
            embedding = [result.embedding for result in results]
        
        return {
            "embedding": embedding,
            "usage": {
                "total_tokens": getattr(result, "token_count", 0) if isinstance(request.text, str) else sum(getattr(r, "token_count", 0) for r in results),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embeddings: {str(e)}")

@router.get("/models", response_model=ModelsResponse, tags=["models"])
# async def list_models(auth: Any = Depends(get_current_user)):
async def list_models():
    """List available Gemini models."""
    try:
        models_info = []
        for model in genai.list_models():
            if "generateContent" in model.supported_generation_methods:
                models_info.append({
                    "name": model.name,
                    "description": getattr(model, "description", ""),
                    "supported_generation_methods": model.supported_generation_methods,
                    "input_token_limit": getattr(model, "input_token_limit", 0),
                    "output_token_limit": getattr(model, "output_token_limit", 0),
                })
        
        return {"models": models_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing models: {str(e)}")

@router.get("/health", tags=["health"])
async def health_check():
    """Simple health check endpoint that doesn't require authentication."""
    return {"status": "ok"}