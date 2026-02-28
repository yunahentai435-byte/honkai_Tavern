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
        let fontSize = '16px'; // 16px minimum to prevent zoom on Android

        // Aplicar configuración de tipografía
        if (typographyConfigStr) {
            try {
                const typoConfig = JSON.parse(typographyConfigStr);
                if (typoConfig.fontFamily) {
                    fontFamily = typoConfig.fontFamily;
                }
                if (typoConfig.fontSize) {
                    // Enforce minimum 16px to prevent Android zoom on tap
                    fontSize = `${Math.max(16, typoConfig.fontSize)}px`;
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
                    backdropFilter = 'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);';
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
                .message-wrapper {
                    display: flex;
                    /* Align user messages to the right, assistant to the left */
                    justify-content: ${isUser ? 'flex-end' : 'flex-start'};
                    width: 100%;
                }
                .message-box {
                    background: ${bgColor};
                    ${backgroundStyle}
                    ${backdropFilter}
                    border: 1px solid ${borderColor};
                    border-radius: ${isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
                    padding: 10px 14px;
                    /* Max width for chat bubble style */
                    max-width: 85%;
                    min-width: 40px;
                    overflow: hidden;
                    /* Prevent text selection issues on Android */
                    -webkit-user-select: text;
                    user-select: text;
                }
                .message-content {
                    color: #212121;
                    font-size: ${fontSize};
                    font-family: ${fontFamily};
                    line-height: 1.5;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    /* Prevent overflow on Android */
                    word-break: break-word;
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
                    background: rgba(0,0,0,0.06);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .message-content pre {
                    background: rgba(0,0,0,0.06);
                    padding: 12px;
                    border-radius: 8px;
                    /* Horizontal scroll for code blocks on Android */
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    margin: 0.5em 0;
                    /* Prevent pre from overflowing bubble */
                    max-width: 100%;
                }
                .message-content pre code {
                    background: none;
                    padding: 0;
                    font-size: 13px;
                    /* Prevent line wrapping in code blocks */
                    white-space: pre;
                }
                .message-content a {
                    color: #1976d2;
                    text-decoration: none;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                /* No hover on touch devices - use active state instead */
                @media (hover: hover) {
                    .message-content a:hover {
                        text-decoration: underline;
                    }
                }
                .message-content a:active {
                    text-decoration: underline;
                    opacity: 0.8;
                }
                .message-content table {
                    border-collapse: collapse;
                    width: 100%;
                    overflow-x: auto;
                    display: block;
                    -webkit-overflow-scrolling: touch;
                }
                .message-content th,
                .message-content td {
                    border: 1px solid #e0e0e0;
                    padding: 6px 10px;
                    text-align: left;
                    white-space: nowrap;
                }
                .message-content th {
                    background: rgba(0,0,0,0.05);
                    font-weight: 600;
                }
                .message-content blockquote {
                    border-left: 3px solid #1976d2;
                    margin: 0.5em 0;
                    padding: 4px 12px;
                    color: #555;
                    background: rgba(0,0,0,0.03);
                    border-radius: 0 4px 4px 0;
                }
            </style>
            <div class="message-wrapper">
                <div class="message-box">
                    <div class="message-content">${marked.parse(content)}</div>
                </div>
            </div>
        `;
    }
}

customElements.define('chat-message', ChatMessage);
