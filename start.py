#!/usr/bin/env python3
"""
Chat OpenAI - Punto de entrada principal
Inicia el servidor backend y sirve el frontend
"""
import uvicorn
from logic.server import create_app

def main():
    app = create_app()
    print('=' * 50)
    print('Chat OpenAI Server')
    print('=' * 50)
    print('Server running on http://localhost:8080')
    print('Press Ctrl+C to stop')
    print('=' * 50)
    uvicorn.run(app, host='localhost', port=8080)

if __name__ == '__main__':
    main()
