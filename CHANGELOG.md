# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.3.0] - 2026-02-27

### Añadido
- Sistema de temas CSS intercambiables
  - Carpeta `/themes` para almacenar archivos CSS de temas
  - Selector de temas en el panel de configuración
  - Temas incluidos: Default, Sakura Dream
  - Carga dinámica de temas disponibles desde el servidor
  - Los temas se aplican inmediatamente al seleccionar
  - Sistema extensible: agregar nuevos temas es tan simple como crear un archivo `.css` en `/themes`
- Panel de configuración UI integrado en la interfaz
  - Botón de configuración con icono SVG en esquina superior derecha
  - Modal responsive para pantallas 20:9 (Android)
  - Configuración de tipografía (fuente y tamaño)
  - Configuración de modo streaming (sin streaming, raw, smooth)
  - Guardado persistente de configuración vía API
  - Notificaciones de éxito/error
  - Botón de restablecer configuración
- Endpoint `/api/themes` para listar temas disponibles
- Endpoint `/api/custom-css` para leer/escribir CSS personalizado

### Cambiado
- Reorganización del proyecto en estructura de directorios:
  - `logic/` — lógica del servidor (Python)
  - `ui/` — frontend (HTML, JS, CSS)
  - `ui/components/` — Web Components
  - `themes/` — archivos CSS de temas
  - `config/` — configuración JSON
  - `backgrounds/` — imágenes de fondo

## [1.2.0] - 2026-02-27

### Añadido
- Hot reloading de configuración en tiempo real
- Configuración de tipografía (fuente y tamaño de fuente)
- Detección automática de cambios en `config.json`
- Intervalo configurable para hot reload
- Soporte para fuentes personalizadas en mensajes

### Corregido
- Problema de desbordamiento de listas de markdown fuera de las burbujas
- Listas (ul/ol) ahora se mantienen dentro de los límites de la burbuja
- Mejora en word-wrap y overflow-wrap para todos los elementos de markdown
- Overflow hidden en message-box para prevenir desbordamientos

### Cambiado
- Mejorado el sistema de renderizado para soportar cambios de configuración en vivo
- Actualizado `chat-message.js` para aplicar configuración de tipografía
- Refactorizado `chat-app.js` para incluir sistema de hot reload
- Añadidos estilos CSS para listas y elementos que se desbordaban

## [1.1.0] - 2026-02-27

### Añadido
- Soporte para fondos personalizados en la interfaz
- Configuración de fondos en `config.json`
- Endpoint `/backgrounds` para servir imágenes de fondo
- Efecto de transparencia y blur en el contenedor de chat cuando hay fondo activo
- Imagen de ejemplo `fondo1.jpg` en la carpeta `backgrounds/`
- Documentación completa (README.md y CHANGELOG.md)
- Control de opacidad del contenedor del chat (0.0 a 1.0)
- Soporte para color sólido hexadecimal en el contenedor del chat
- Opción para usar imagen de fondo específica en el contenedor del chat
- Tres modos de fondo para el contenedor: transparente, color sólido, o imagen
- Control individual de blur para contenedor y burbujas de mensajes
- Personalización completa de burbujas de mensajes (usuario y asistente)
- Configuración independiente de opacidad, color, imagen y blur para cada tipo de burbuja
- Soporte para fondos de imagen en burbujas de mensajes individuales

### Cambiado
- Actualizado `styles.css` con clases para fondos personalizados y control de blur
- Mejorado el componente `chat-app.js` para aplicar fondos dinámicamente
- Refactorizado `chat-message.js` para soportar configuración personalizada de burbujas
- Actualizado `server.py` para servir archivos estáticos de la carpeta `backgrounds/`
- Refactorizado sistema de estilos del contenedor para soportar múltiples modos
- Mejorado el sistema de renderizado para mantener estilos después de actualizaciones

## [1.0.0] - 2026-02-27

### Añadido
- Interfaz de chat web moderna y responsiva
- Integración con API de NVIDIA para modelos de IA
- Soporte para streaming de respuestas en tiempo real
- Renderizado de Markdown en mensajes
- Web Components personalizados (`chat-app`, `chat-message`)
- Backend FastAPI con endpoints REST
- Sistema de configuración mediante JSON
- Manejo de errores y estados de carga
- Estilos modernos con CSS3
- Scroll automático en el contenedor de mensajes
- Validación de entrada de usuario
- Soporte para modo streaming y no-streaming

### Componentes
- `start.py` — Punto de entrada principal
- `logic/server.py` — Servidor FastAPI con endpoints de chat
- `ui/components/chat-app.js` — Componente principal de la aplicación
- `ui/components/chat-message.js` — Componente para renderizar mensajes
- `ui/api.js` — Cliente API para comunicación con el backend
- `ui/index.html` — Página principal
- `ui/styles.css` — Estilos de la aplicación
- `config/config.json` — Archivo de configuración

### Características técnicas
- Arquitectura cliente-servidor separada
- Comunicación asíncrona con httpx
- CORS habilitado para desarrollo
- Server-Sent Events (SSE) para streaming
- Manejo de errores HTTP
- Timeouts configurables
- Validación con Pydantic

## [Unreleased]

### Planeado
- Historial de conversaciones persistente
- Múltiples temas de color
- Soporte para adjuntar archivos
- Exportar conversaciones
- Modo oscuro
- Múltiples modelos de IA seleccionables
- Búsqueda en conversaciones
- Atajos de teclado personalizables
