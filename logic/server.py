#!/usr/bin/env python3
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

class ChatRequest(BaseModel):
    message: str

class ChatServer:
    def __init__(self):
        self.config = self.load_config()
        
    def load_config(self):
        config_path = Path(__file__).parent.parent / 'config' / 'config.json'
        with open(config_path, 'r') as f:
            return json.load(f)

def create_app():
    server = ChatServer()
    app = FastAPI(title="Chat OpenAI API")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/api/config")
    async def get_config():
        return server.config
    
    @app.post("/api/config")
    async def update_config(config: dict):
        try:
            config_path = Path(__file__).parent.parent / 'config' / 'config.json'
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            server.config = config
            return {'success': True, 'message': 'Configuration updated'}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/custom-css")
    async def get_custom_css():
        try:
            css_path = Path(__file__).parent.parent / 'ui' / 'custom.css'
            if not css_path.exists():
                return ""
            with open(css_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/custom-css")
    async def update_custom_css(request: Request):
        try:
            css = await request.body()
            css_path = Path(__file__).parent.parent / 'ui' / 'custom.css'
            with open(css_path, 'w', encoding='utf-8') as f:
                f.write(css.decode('utf-8'))
            return {'success': True, 'message': 'Custom CSS updated'}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/themes")
    async def get_themes():
        try:
            themes_path = Path(__file__).parent.parent / 'themes'
            if not themes_path.exists():
                return []
            theme_files = [f.stem for f in themes_path.glob('*.css')]
            return theme_files
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/chat")
    async def chat(request: ChatRequest):
        headers = {'Content-Type': 'application/json'}
        if server.config.get('apiKey'):
            headers['Authorization'] = f"Bearer {server.config['apiKey']}"
        
        payload = {
            'model': server.config['model'],
            'messages': [{'role': 'user', 'content': request.message}],
            'stream': False
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    server.config['endpoint'],
                    json=payload,
                    headers=headers,
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()
                content = result['choices'][0]['message']['content']
                return {'response': content}
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f'API error: {e.response.status_code}')
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/chat/stream")
    async def chat_stream(request: ChatRequest):
        headers = {'Content-Type': 'application/json'}
        if server.config.get('apiKey'):
            headers['Authorization'] = f"Bearer {server.config['apiKey']}"
        
        payload = {
            'model': server.config['model'],
            'messages': [{'role': 'user', 'content': request.message}],
            'stream': True
        }
        
        async def event_generator():
            try:
                async with httpx.AsyncClient() as client:
                    async with client.stream(
                        'POST',
                        server.config['endpoint'],
                        json=payload,
                        headers=headers,
                        timeout=60.0
                    ) as response:
                        response.raise_for_status()
                        async for line in response.aiter_lines():
                            if line.startswith('data: '):
                                json_str = line[6:]
                                if json_str == '[DONE]':
                                    yield 'data: [DONE]\n\n'
                                    break
                                
                                try:
                                    chunk_data = json.loads(json_str)
                                    if 'choices' in chunk_data and len(chunk_data['choices']) > 0:
                                        delta = chunk_data['choices'][0].get('delta', {})
                                        content = delta.get('content', '')
                                        if content:
                                            event_data = json.dumps({'content': content})
                                            yield f'data: {event_data}\n\n'
                                except json.JSONDecodeError:
                                    pass
            except Exception as e:
                error_data = json.dumps({'error': str(e)})
                yield f'data: {error_data}\n\n'
        
        return StreamingResponse(event_generator(), media_type='text/event-stream')
    
    backgrounds_path = Path(__file__).parent.parent / 'backgrounds'
    if backgrounds_path.exists():
        app.mount("/backgrounds", StaticFiles(directory=str(backgrounds_path)), name="backgrounds")
    
    themes_path = Path(__file__).parent.parent / 'themes'
    app.mount("/themes", StaticFiles(directory=str(themes_path)), name="themes")
    
    ui_path = Path(__file__).parent.parent / 'ui'
    app.mount("/", StaticFiles(directory=str(ui_path), html=True), name="ui")
    
    return app
