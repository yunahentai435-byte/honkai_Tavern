import { marked } from 'https://cdn.jsdelivr.net/npm/marked@11.1.1/+esm';

class ChatMessage extends HTMLElement {
    static get observedAttributes() {
        return ['role', 'content', 'bubble-config', 'typography-config'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    render() {
        const role = this.getAttribute('role') || 'user';
        const content = this.getAttribute('content') || '';
        const bubbleConfigStr = this.getAttribute('bubble-config');
        const typographyConfigStr = this.getAttribute('typography-config');
        
        const isUser = role === 'user';
        let bgColor = isUser ? '#e3f2fd' : '#ffffff';
        let borderColor = isUser ? '#90caf9' : '#e0e0e0';
        let backgroundStyle = '';
        let backdropFilter = '';
        let fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif';
        let fontSize = '14px';

        // Aplicar configuración de tipografía
        if (typographyConfigStr) {
            try {
                const typoConfig = JSON.parse(typographyConfigStr);
                if (typoConfig.fontFamily) {
                    fontFamily = typoConfig.fontFamily;
                }
                if (typoConfig.fontSize) {
                    fontSize = `${typoConfig.fontSize}px`;
                }
            } catch (e) {
                console.error('Error parsing typography config:', e);
            }
        }

        // Aplicar configuración personalizada si existe
        if (bubbleConfigStr) {
            try {
                const config = JSON.parse(bubbleConfigStr);
                const opacity = config.opacity ?? 1;
                const bgType = config.backgroundType || 'transparent';
                const blur = config.blur ?? false;

                if (blur) {
                    backdropFilter = 'backdrop-filter: blur(8px);';
                }

                if (bgType === 'color' && config.backgroundColor) {
                    const rgb = this.hexToRgb(config.backgroundColor);
                    if (rgb) {
                        bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
                    }
                } else if (bgType === 'image' && config.backgroundImage) {
                    backgroundStyle = `
                        background-image: url('/${config.backgroundImage}');
                        background-size: cover;
                        background-position: center;
                        background-blend-mode: overlay;
                        background-color: rgba(255, 255, 255, ${opacity});
                    `;
                } else {
                    // Transparent mode
                    const rgb = this.hexToRgb(bgColor);
                    if (rgb) {
                        bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
                    }
                }
            } catch (e) {
                console.error('Error parsing bubble config:', e);
            }
        }

        this.innerHTML = `
            <style>
                .message-box {
                    background: ${bgColor};
                    ${backgroundStyle}
                    ${backdropFilter}
                    border: 1px solid ${borderColor};
                    border-radius: 12px;
                    padding: 12px;
                    width: 100%;
                    overflow: hidden;
                }
                .message-content {
                    color: #212121;
                    font-size: ${fontSize};
                    font-family: ${fontFamily};
                    line-height: 1.5;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .message-content p {
                    margin: 0.5em 0;
                }
                .message-content p:first-child {
                    margin-top: 0;
                }
                .message-content p:last-child {
                    margin-bottom: 0;
                }
                .message-content ul,
                .message-content ol {
                    margin: 0.5em 0;
                    padding-left: 1.5em;
                    overflow: hidden;
                }
                .message-content li {
                    margin: 0.25em 0;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .message-content code {
                    background: #f5f5f5;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .message-content pre {
                    background: #f5f5f5;
                    padding: 12px;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 0.5em 0;
                }
                .message-content pre code {
                    background: none;
                    padding: 0;
                }
                .message-content a {
                    color: #1976d2;
                    text-decoration: none;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .message-content a:hover {
                    text-decoration: underline;
                }
            </style>
            <div class="message-box">
                <div class="message-content">${marked.parse(content)}</div>
            </div>
        `;
    }
}

customElements.define('chat-message', ChatMessage);
