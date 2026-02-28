# Chat OpenAI

A lightweight, self-hosted chat interface for OpenAI-compatible APIs (including NVIDIA NIM, OpenAI, and other compatible endpoints). Built with a **FastAPI** backend and a **vanilla JavaScript** frontend using Web Components.

## Features

- 💬 Real-time streaming chat responses via Server-Sent Events (SSE)
- 🎨 Themeable UI with multiple CSS themes (default, sakura-dream, and custom)
- ⚙️ Live configuration via `config/config.json` with hot-reload support
- 🖼️ Optional custom background image
- 🔤 Configurable font family and font size
- 🔌 Compatible with any OpenAI-compatible API endpoint

## Requirements

- Python 3.10+
- pip

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/chat-openai.git
   cd chat-openai
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure the application:**

   Edit [`config/config.json`](config/config.json) and set your API key and desired model:

   ```json
   {
     "endpoint": "https://integrate.api.nvidia.com/v1/chat/completions",
     "model": "mistralai/mistral-large-3-675b-instruct-2512",
     "apiKey": "YOUR_API_KEY_HERE",
     "theme": "sakura-dream",
     "streaming": {
       "enabled": true,
       "mode": "raw",
       "smoothSpeed": 50
     },
     "background": {
       "enabled": false,
       "image": "backgrounds/fondo1.jpg"
     },
     "typography": {
       "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
       "fontSize": 22
     },
     "hotReload": {
       "enabled": true,
       "interval": 3000
     }
   }
   ```

4. **Run the server:**

   ```bash
   python start.py
   ```

5. **Open your browser** and navigate to [http://localhost:8080](http://localhost:8080).

## Configuration Reference

| Key | Type | Description |
|-----|------|-------------|
| `endpoint` | `string` | URL of the OpenAI-compatible chat completions API |
| `model` | `string` | Model identifier to use for completions |
| `apiKey` | `string` | Bearer token / API key for authentication |
| `theme` | `string` | CSS theme name (filename without `.css` from `themes/`) |
| `streaming.enabled` | `boolean` | Enable or disable streaming responses |
| `streaming.mode` | `string` | Streaming mode: `"raw"` |
| `streaming.smoothSpeed` | `number` | Delay in ms between streamed characters |
| `background.enabled` | `boolean` | Show a background image |
| `background.image` | `string` | Path to the background image (relative to project root) |
| `typography.fontFamily` | `string` | CSS font-family stack |
| `typography.fontSize` | `number` | Base font size in pixels |
| `hotReload.enabled` | `boolean` | Automatically reload config from disk at runtime |
| `hotReload.interval` | `number` | Polling interval in ms for hot-reload |

## Project Structure

```
chat-openai/
├── config/
│   └── config.json          # Application configuration
├── logic/
│   ├── __init__.py
│   └── server.py            # FastAPI application & API routes
├── themes/
│   ├── default.css          # Default theme
│   └── sakura-dream.css     # Sakura Dream theme
├── ui/
│   ├── index.html           # Main HTML entry point
│   ├── app.js               # Frontend bootstrap
│   ├── api.js               # API client helpers
│   ├── styles.css           # Base styles
│   └── components/
│       ├── chat-app.js      # Root Web Component
│       └── chat-message.js  # Message Web Component
├── requirements.txt
├── start.py                 # Application entry point
├── README.md
└── CHANGELOG.md
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/config` | Retrieve current configuration |
| `POST` | `/api/config` | Update and persist configuration |
| `GET` | `/api/themes` | List available themes |
| `GET` | `/api/custom-css` | Retrieve custom CSS overrides |
| `POST` | `/api/custom-css` | Save custom CSS overrides |
| `POST` | `/api/chat` | Send a message (non-streaming) |
| `POST` | `/api/chat/stream` | Send a message (SSE streaming) |

## Themes

Themes are plain CSS files located in the [`themes/`](themes/) directory. To add a new theme, drop a `.css` file into that folder and set `"theme"` in `config.json` to the filename without the extension.

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.  
See the [LICENSE](LICENSE) file for full details, or visit <https://www.gnu.org/licenses/gpl-3.0.html>.
