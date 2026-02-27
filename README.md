# Chat OpenAI

Aplicación de chat moderna con interfaz web que se conecta a modelos de IA a través de la API de NVIDIA (compatible con cualquier API OpenAI-compatible). Soporta streaming de respuestas en tiempo real, temas visuales intercambiables y fondos personalizables.

## Características

- 💬 Interfaz de chat intuitiva y moderna
- 🚀 Streaming de respuestas en tiempo real (modo raw y smooth)
- 🎨 Sistema de temas CSS intercambiables (Default, Sakura Dream)
- 🖼️ Soporte para fondos personalizados de página
- 📝 Renderizado de Markdown en mensajes
- ⚙️ Panel de configuración integrado en la UI
- 🔄 Hot reloading de configuración sin recargar la página
- 🔤 Tipografía personalizable (fuente y tamaño)
- ⚡ Backend FastAPI con Python
- 🧩 Frontend con Web Components nativos

## Requisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

## Instalación

1. Clona o descarga el repositorio

2. Instala las dependencias:
```bash
pip install -r requirements.txt
```

## Uso

1. Inicia el servidor:
```bash
python start.py
```

2. Abre tu navegador en: `http://localhost:8080`

3. Escribe tu mensaje y presiona Enter o haz clic en "Enviar"

4. Accede al panel de configuración con el botón ⚙️ en la esquina superior derecha

## Configuración

Edita el archivo `config/config.json` para personalizar la aplicación:

```json
{
  "endpoint": "https://integrate.api.nvidia.com/v1/chat/completions",
  "model": "mistralai/mistral-large-3-675b-instruct-2512",
  "apiKey": "tu-api-key-aqui",
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
  "chatContainer": {
    "opacity": 0.95,
    "backgroundType": "transparent",
    "backgroundColor": "#ffffff",
    "backgroundImage": "",
    "blur": true
  },
  "messageBubbles": {
    "user": {
      "opacity": 0.9,
      "backgroundType": "transparent",
      "backgroundColor": "#e3f2fd",
      "backgroundImage": "",
      "blur": false
    },
    "assistant": {
      "opacity": 0.95,
      "backgroundType": "transparent",
      "backgroundColor": "#ffffff",
      "backgroundImage": "",
      "blur": false
    }
  },
  "typography": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    "fontSize": 14
  },
  "hotReload": {
    "enabled": true,
    "interval": 2000
  }
}
```

### Parámetros de configuración

- `endpoint`: URL del endpoint de la API (compatible con OpenAI)
- `model`: Modelo de IA a utilizar
- `apiKey`: Tu clave de API
- `theme`: Nombre del tema CSS a aplicar (sin extensión, ej: `"default"`, `"sakura-dream"`)
- `streaming.enabled`: Activar/desactivar streaming de respuestas
- `streaming.mode`: Modo de streaming (`"raw"` o `"smooth"`)
- `streaming.smoothSpeed`: Velocidad de renderizado en modo smooth (ms)
- `background.enabled`: Activar/desactivar fondo personalizado de página
- `background.image`: Ruta relativa a la imagen de fondo
- `chatContainer.opacity`: Opacidad del contenedor del chat (0.0 a 1.0)
- `chatContainer.backgroundType`: Tipo de fondo (`"transparent"`, `"color"`, o `"image"`)
- `chatContainer.backgroundColor`: Color hexadecimal para el fondo del contenedor
- `chatContainer.backgroundImage`: Ruta a imagen de fondo para el contenedor
- `chatContainer.blur`: Activar/desactivar efecto blur en el contenedor (true/false)
- `messageBubbles.user.*`: Configuración de estilo para burbujas del usuario
- `messageBubbles.assistant.*`: Configuración de estilo para burbujas del asistente
  - `opacity`: Opacidad de la burbuja (0.0 a 1.0)
  - `backgroundType`: Tipo de fondo (`"transparent"`, `"color"`, o `"image"`)
  - `backgroundColor`: Color hexadecimal de la burbuja
  - `backgroundImage`: Ruta a imagen de fondo para la burbuja
  - `blur`: Activar/desactivar efecto blur en la burbuja (true/false)
- `typography.fontFamily`: Familia de fuentes para los mensajes
- `typography.fontSize`: Tamaño de fuente en píxeles (número)
- `hotReload.enabled`: Activar/desactivar recarga automática de configuración (true/false)
- `hotReload.interval`: Intervalo de verificación de cambios en milisegundos

## Temas visuales

Los temas se almacenan como archivos CSS en la carpeta `themes/`. Para añadir un tema nuevo, crea un archivo `.css` en esa carpeta y selecciónalo desde el panel de configuración o editando `config/config.json`.

Temas incluidos:
- **default** — Estilo limpio y minimalista
- **sakura-dream** — Tema rosa con animaciones de pétalos y efectos de brillo

Para activar un tema:
```json
"theme": "sakura-dream"
```

## Fondos personalizados

### Fondo de la página

Para usar un fondo personalizado en toda la página:

1. Coloca tu imagen en la carpeta `backgrounds/`
2. Actualiza `config/config.json`:
```json
"background": {
  "enabled": true,
  "image": "backgrounds/tu-imagen.jpg"
}
```

### Personalización del contenedor del chat

Puedes personalizar el contenedor del chat de tres formas:

#### 1. Fondo transparente (por defecto)
```json
"chatContainer": {
  "opacity": 0.95,
  "backgroundType": "transparent",
  "backgroundColor": "#ffffff",
  "blur": true
}
```

#### 2. Color sólido hexadecimal
```json
"chatContainer": {
  "opacity": 0.9,
  "backgroundType": "color",
  "backgroundColor": "#2c3e50",
  "blur": false
}
```

#### 3. Imagen de fondo en el contenedor
```json
"chatContainer": {
  "opacity": 0.85,
  "backgroundType": "image",
  "backgroundImage": "backgrounds/patron.png",
  "blur": true
}
```

### Personalización de burbujas de mensajes

Cada tipo de mensaje (usuario y asistente) puede tener su propia configuración:

```json
"messageBubbles": {
  "user": {
    "opacity": 0.9,
    "backgroundType": "color",
    "backgroundColor": "#4a90e2",
    "blur": true
  },
  "assistant": {
    "opacity": 0.85,
    "backgroundType": "image",
    "backgroundImage": "backgrounds/patron.png",
    "blur": false
  }
}
```

La aplicación soporta formatos: JPG, PNG, GIF, WebP

## Hot Reloading

La aplicación incluye hot reloading de configuración. Cuando está habilitado, la aplicación detecta automáticamente cambios en `config.json` y los aplica sin necesidad de recargar la página.

```json
"hotReload": {
  "enabled": true,
  "interval": 2000
}
```

Esto permite ajustar colores, opacidades, fondos y tipografía en tiempo real mientras usas la aplicación.

## Tipografía personalizada

Puedes personalizar la fuente y el tamaño del texto en los mensajes:

```json
"typography": {
  "fontFamily": "Georgia, serif",
  "fontSize": 16
}
```

Ejemplos de fuentes:
- Sans-serif moderna: `"Inter, system-ui, sans-serif"`
- Serif clásica: `"Georgia, 'Times New Roman', serif"`
- Monospace: `"'Courier New', Consolas, monospace"`
- Sistema: `"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto"`

## Estructura del proyecto

```
.
├── backgrounds/          # Imágenes de fondo
├── config/               # Archivos de configuración
│   └── config.json
├── logic/                # Lógica del servidor (Python)
│   ├── __init__.py
│   └── server.py
├── themes/               # Temas CSS intercambiables
│   ├── default.css
│   └── sakura-dream.css
├── ui/                   # Frontend
│   ├── components/
│   │   ├── chat-app.js
│   │   └── chat-message.js
│   ├── api.js
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── requirements.txt      # Dependencias Python
└── start.py              # Punto de entrada
```

## API Endpoints

### GET `/api/config`
Obtiene la configuración actual de la aplicación.

### POST `/api/config`
Actualiza y persiste la configuración de la aplicación.

**Body:** objeto JSON con la configuración completa.

### GET `/api/themes`
Lista los temas CSS disponibles en la carpeta `/themes`.

### GET `/api/custom-css`
Obtiene el CSS personalizado del archivo `ui/custom.css`.

### POST `/api/custom-css`
Actualiza el CSS personalizado.

### POST `/api/chat`
Envía un mensaje y recibe una respuesta completa.

**Body:**
```json
{
  "message": "Tu mensaje aquí"
}
```

### POST `/api/chat/stream`
Envía un mensaje y recibe la respuesta en streaming (Server-Sent Events).

**Body:**
```json
{
  "message": "Tu mensaje aquí"
}
```

## Tecnologías utilizadas

### Backend
- **FastAPI** — Framework web moderno y rápido
- **Uvicorn** — Servidor ASGI
- **httpx** — Cliente HTTP asíncrono
- **Pydantic** — Validación de datos

### Frontend
- **Web Components** — Componentes nativos reutilizables
- **Marked.js** — Renderizado de Markdown
- **CSS3** — Estilos modernos con backdrop-filter y animaciones

## Solución de problemas

### El servidor no inicia
- Verifica que todas las dependencias estén instaladas: `pip install -r requirements.txt`
- Asegúrate de que el puerto 8080 esté disponible

### No se muestran respuestas
- Verifica tu API key en `config/config.json`
- Revisa la consola del navegador para errores
- Comprueba tu conexión a internet

### El fondo no se muestra
- Verifica que la ruta de la imagen sea correcta
- Asegúrate de que `background.enabled` esté en `true`
- Comprueba que el archivo de imagen exista en la carpeta `backgrounds/`

### El tema no se aplica
- Verifica que el archivo `.css` del tema exista en la carpeta `themes/`
- Comprueba que el nombre en `config.json` coincida exactamente con el nombre del archivo (sin extensión)

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.
