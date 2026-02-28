# Changelog

All notable changes to **Chat OpenAI** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Conversation history / multi-turn context support
- Model selector in the UI
- Export chat history to Markdown or JSON
- Dark/light mode toggle

---

## [1.0.0] - 2026-02-28

### Added
- Initial release of Chat OpenAI.
- **FastAPI** backend (`logic/server.py`) serving both the REST API and the static frontend.
- **Streaming chat** endpoint (`POST /api/chat/stream`) using Server-Sent Events (SSE) via `httpx` async streaming.
- **Non-streaming chat** endpoint (`POST /api/chat`) for standard request/response flow.
- **Configuration API** (`GET /api/config`, `POST /api/config`) to read and persist `config/config.json` at runtime.
- **Themes API** (`GET /api/themes`) to list available CSS themes from the `themes/` directory.
- **Custom CSS API** (`GET /api/custom-css`, `POST /api/custom-css`) for user-defined style overrides.
- Vanilla JavaScript frontend built with **Web Components** (`chat-app`, `chat-message`).
- Two built-in themes: `default` and `sakura-dream`.
- Configurable typography (font family and font size) via `config.json`.
- Optional background image support.
- Hot-reload support: the frontend polls the config endpoint at a configurable interval.
- CORS middleware enabled for all origins (development convenience).
- Static file serving for `ui/`, `themes/`, and `backgrounds/` directories.
- `start.py` entry point launching Uvicorn on `localhost:8080`.
- `requirements.txt` pinning `fastapi`, `uvicorn[standard]`, `httpx`, and `pydantic`.

---

[Unreleased]: https://github.com/your-username/chat-openai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/chat-openai/releases/tag/v1.0.0
