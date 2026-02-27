import './chat-message.js';
import { ChatAPI } from '../api.js';

class ChatApp extends HTMLElement {
    constructor() {
        super();
        this.messages = [];
        this.loading = false;
        this.api = new ChatAPI();
        this.configCheckInterval = null;
        this.lastConfigHash = null;
        this.availableThemes = [];
    }

    async connectedCallback() {
        await this.api.loadConfig();
        await this.loadAvailableThemes();
        this.applyTheme();
        this.applyBackground();
        this.render();
        this.attachEventListeners();
        this.applyChatContainerStyle();
        this.startHotReload();
    }

    disconnectedCallback() {
        this.stopHotReload();
    }

    async loadAvailableThemes() {
        try {
            const response = await fetch('/api/themes');
            this.availableThemes = await response.json();
        } catch (error) {
            console.error('Error loading themes:', error);
            this.availableThemes = ['default'];
        }
    }

    applyTheme() {
        const themeName = this.api.config.theme || 'default';
        const themeLink = document.getElementById('themeLink');
        if (themeLink) {
            themeLink.href = `/themes/${themeName}.css?t=${new Date().getTime()}`;
        }
    }

    startHotReload() {
        const hotReloadConfig = this.api.config.hotReload;
        if (hotReloadConfig?.enabled) {
            const interval = hotReloadConfig.interval || 2000;
            this.configCheckInterval = setInterval(() => this.checkConfigChanges(), interval);
        }
    }

    stopHotReload() {
        if (this.configCheckInterval) {
            clearInterval(this.configCheckInterval);
            this.configCheckInterval = null;
        }
    }

    async checkConfigChanges() {
        try {
            const response = await fetch('/api/config');
            const newConfig = await response.json();
            const newHash = JSON.stringify(newConfig);
            
            if (this.lastConfigHash === null) {
                this.lastConfigHash = newHash;
                return;
            }
            
            if (this.lastConfigHash !== newHash) {
                console.log('Config changed, reloading...');
                this.lastConfigHash = newHash;
                this.api.config = newConfig;
                this.applyBackground();
                this.applyChatContainerStyle();
                this.renderMessages();
                
                // Reiniciar hot reload si cambió la configuración
                this.stopHotReload();
                this.startHotReload();
            }
        } catch (error) {
            console.error('Error checking config changes:', error);
        }
    }

    applyBackground() {
        const bgConfig = this.api.config.background;
        if (bgConfig?.enabled && bgConfig?.image) {
            document.body.classList.add('with-background');
            document.body.style.backgroundImage = `url('/${bgConfig.image}')`;
        }
    }

    applyChatContainerStyle() {
        const container = this.querySelector('.chat-container');
        if (!container) return;

        const containerConfig = this.api.config.chatContainer;
        if (!containerConfig) return;

        const opacity = containerConfig.opacity ?? 1;
        const bgType = containerConfig.backgroundType || 'transparent';
        const blur = containerConfig.blur ?? true;

        // Aplicar o remover blur
        if (!blur) {
            container.classList.add('no-blur');
        } else {
            container.classList.remove('no-blur');
        }

        if (bgType === 'color' && containerConfig.backgroundColor) {
            const hexColor = containerConfig.backgroundColor;
            const rgb = this.hexToRgb(hexColor);
            if (rgb) {
                container.style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            }
        } else if (bgType === 'image' && containerConfig.backgroundImage) {
            container.style.backgroundImage = `url('/${containerConfig.backgroundImage}')`;
            container.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
            container.style.backgroundBlendMode = 'overlay';
        } else {
            container.style.background = `rgba(255, 255, 255, ${opacity})`;
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    renderConfigContent() {
        const config = this.api.config;
        
        // Generar opciones de temas
        const themeOptions = this.availableThemes.map(theme => {
            const themeName = theme.replace('.css', '');
            const displayName = themeName.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            const selected = config.theme === themeName ? 'selected' : '';
            return `<option value="${themeName}" ${selected}>${displayName}</option>`;
        }).join('');
        
        return `
            <div class="config-section">
                <h3 class="config-section-title">Tema Visual</h3>
                <div class="config-field">
                    <label for="themeSelect">Seleccionar tema</label>
                    <select id="themeSelect" class="config-select">
                        ${themeOptions}
                    </select>
                    <small class="config-hint">Los temas se encuentran en la carpeta /themes</small>
                </div>
            </div>

            <div class="config-section">
                <h3 class="config-section-title">Tipografía</h3>
                <div class="config-field">
                    <label for="fontFamily">Fuente</label>
                    <select id="fontFamily" class="config-select">
                        <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif" ${config.typography?.fontFamily?.includes('apple-system') ? 'selected' : ''}>Sistema</option>
                        <option value="'Arial', sans-serif" ${config.typography?.fontFamily?.includes('Arial') ? 'selected' : ''}>Arial</option>
                        <option value="'Georgia', serif" ${config.typography?.fontFamily?.includes('Georgia') ? 'selected' : ''}>Georgia</option>
                        <option value="'Courier New', monospace" ${config.typography?.fontFamily?.includes('Courier') ? 'selected' : ''}>Courier New</option>
                        <option value="'Verdana', sans-serif" ${config.typography?.fontFamily?.includes('Verdana') ? 'selected' : ''}>Verdana</option>
                        <option value="'Times New Roman', serif" ${config.typography?.fontFamily?.includes('Times') ? 'selected' : ''}>Times New Roman</option>
                    </select>
                </div>
                <div class="config-field">
                    <label for="fontSize">Tamaño de fuente: <span id="fontSizeValue">${config.typography?.fontSize || 14}px</span></label>
                    <input type="range" id="fontSize" class="config-range" min="12" max="32" value="${config.typography?.fontSize || 14}">
                </div>
            </div>

            <div class="config-section">
                <h3 class="config-section-title">Streaming</h3>
                <div class="config-field">
                    <label for="streamingMode">Modo</label>
                    <select id="streamingMode" class="config-select">
                        <option value="disabled" ${!config.streaming?.enabled ? 'selected' : ''}>Sin streaming</option>
                        <option value="raw" ${config.streaming?.enabled && config.streaming?.mode === 'raw' ? 'selected' : ''}>Streaming raw</option>
                        <option value="smooth" ${config.streaming?.enabled && config.streaming?.mode === 'smooth' ? 'selected' : ''}>Streaming smooth</option>
                    </select>
                </div>
                <div class="config-field" id="smoothSpeedField" style="display: ${config.streaming?.enabled && config.streaming?.mode === 'smooth' ? 'block' : 'none'}">
                    <label for="smoothSpeed">Velocidad smooth: <span id="smoothSpeedValue">${config.streaming?.smoothSpeed || 50}ms</span></label>
                    <input type="range" id="smoothSpeed" class="config-range" min="10" max="200" step="10" value="${config.streaming?.smoothSpeed || 50}">
                </div>
            </div>

            <div class="config-actions">
                <button class="config-button-primary" id="saveConfig">Guardar cambios</button>
                <button class="config-button-secondary" id="resetConfig">Restablecer</button>
            </div>
        `;
    }

    render() {
        const hasModal = !!this.querySelector('#configModal');
        
        if (!hasModal) {
            // Primera vez, crear todo
            this.innerHTML = `
                <div class="chat-container">
                    <button class="config-button" id="configButton" aria-label="Configuración">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2m13.2-5.2l-6 0m-6 0l-6 0m13.2 5.2l-4.2-4.2m-2-2l-4.2-4.2"></path>
                        </svg>
                    </button>
                    <div class="config-modal" id="configModal">
                        <div class="config-modal-content">
                            <div class="config-modal-header">
                                <h2>Configuración</h2>
                                <button class="config-close" id="configClose">&times;</button>
                            </div>
                            <div class="config-modal-body">
                                ${this.renderConfigContent()}
                            </div>
                        </div>
                    </div>
                    <div class="messages-container" id="messagesContainer"></div>
                    <div class="input-container">
                        <input 
                            type="text" 
                            class="input-field" 
                            id="inputField"
                            placeholder="Escribe tu mensaje..."
                            ${this.loading ? 'disabled' : ''}
                        />
                        <button 
                            class="send-button" 
                            id="sendButton"
                            ${this.loading || !this.getInputValue() ? 'disabled' : ''}
                        >
                            ${this.loading ? '...' : 'Enviar'}
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Ya existe el modal, solo actualizar input y botón
            const inputContainer = this.querySelector('.input-container');
            if (inputContainer) {
                inputContainer.innerHTML = `
                    <input 
                        type="text" 
                        class="input-field" 
                        id="inputField"
                        placeholder="Escribe tu mensaje..."
                        ${this.loading ? 'disabled' : ''}
                    />
                    <button 
                        class="send-button" 
                        id="sendButton"
                        ${this.loading || !this.getInputValue() ? 'disabled' : ''}
                    >
                        ${this.loading ? '...' : 'Enviar'}
                    </button>
                `;
            }
        }
        
        this.renderMessages();
        this.applyChatContainerStyle();
    }

    renderMessages() {
        const container = this.querySelector('#messagesContainer');
        if (!container) return;

        container.innerHTML = '';
        this.messages.forEach(msg => {
            const messageEl = document.createElement('chat-message');
            messageEl.setAttribute('role', msg.role);
            messageEl.setAttribute('content', msg.content);
            
            // Pasar configuración de burbujas
            const bubbleConfig = this.api.config.messageBubbles?.[msg.role];
            if (bubbleConfig) {
                messageEl.setAttribute('bubble-config', JSON.stringify(bubbleConfig));
            }
            
            // Pasar configuración de tipografía
            const typographyConfig = this.api.config.typography;
            if (typographyConfig) {
                messageEl.setAttribute('typography-config', JSON.stringify(typographyConfig));
            }
            
            container.appendChild(messageEl);
        });

        setTimeout(() => container.scrollTop = container.scrollHeight, 0);
    }

    attachEventListeners() {
        const input = this.querySelector('#inputField');
        const button = this.querySelector('#sendButton');

        // Event listeners para input y botón de envío
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.loading) {
                this.sendMessage();
            }
        });

        input?.addEventListener('input', () => {
            if (button) {
                button.disabled = this.loading || !this.getInputValue();
            }
        });

        button?.addEventListener('click', () => this.sendMessage());

        // Event listeners del modal (solo si no están ya configurados)
        const configButton = this.querySelector('#configButton');
        const configModal = this.querySelector('#configModal');
        const configClose = this.querySelector('#configClose');

        if (configButton && !configButton.hasAttribute('data-listener')) {
            configButton.setAttribute('data-listener', 'true');
            configButton.addEventListener('click', () => {
                configModal?.classList.add('active');
            });
        }

        if (configClose && !configClose.hasAttribute('data-listener')) {
            configClose.setAttribute('data-listener', 'true');
            configClose.addEventListener('click', () => {
                configModal?.classList.remove('active');
            });
        }

        if (configModal && !configModal.hasAttribute('data-listener')) {
            configModal.setAttribute('data-listener', 'true');
            configModal.addEventListener('click', (e) => {
                if (e.target === configModal) {
                    configModal.classList.remove('active');
                }
            });
        }

        // Config panel event listeners
        this.attachConfigListeners();
    }

    attachConfigListeners() {
        const fontSize = this.querySelector('#fontSize');
        const fontSizeValue = this.querySelector('#fontSizeValue');
        const smoothSpeed = this.querySelector('#smoothSpeed');
        const smoothSpeedValue = this.querySelector('#smoothSpeedValue');
        const streamingMode = this.querySelector('#streamingMode');
        const smoothSpeedField = this.querySelector('#smoothSpeedField');
        const saveConfig = this.querySelector('#saveConfig');
        const resetConfig = this.querySelector('#resetConfig');

        fontSize?.addEventListener('input', (e) => {
            if (fontSizeValue) {
                fontSizeValue.textContent = `${e.target.value}px`;
            }
        });

        smoothSpeed?.addEventListener('input', (e) => {
            if (smoothSpeedValue) {
                smoothSpeedValue.textContent = `${e.target.value}ms`;
            }
        });

        streamingMode?.addEventListener('change', (e) => {
            if (smoothSpeedField) {
                smoothSpeedField.style.display = e.target.value === 'smooth' ? 'block' : 'none';
            }
        });

        saveConfig?.addEventListener('click', () => this.saveConfiguration());
        resetConfig?.addEventListener('click', () => this.resetConfiguration());
    }

    async saveConfiguration() {
        const theme = this.querySelector('#themeSelect')?.value;
        const fontFamily = this.querySelector('#fontFamily')?.value;
        const fontSize = parseInt(this.querySelector('#fontSize')?.value);
        const streamingMode = this.querySelector('#streamingMode')?.value;
        const smoothSpeed = parseInt(this.querySelector('#smoothSpeed')?.value);

        const updatedConfig = {
            ...this.api.config,
            theme,
            typography: {
                fontFamily,
                fontSize
            },
            streaming: {
                enabled: streamingMode !== 'disabled',
                mode: streamingMode === 'disabled' ? 'raw' : streamingMode,
                smoothSpeed
            }
        };

        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedConfig)
            });

            if (response.ok) {
                this.api.config = updatedConfig;
                this.applyTheme();
                this.applyBackground();
                this.applyChatContainerStyle();
                this.renderMessages();
                
                // Cerrar modal
                this.querySelector('#configModal')?.classList.remove('active');
                
                // Mostrar feedback
                this.showNotification('Configuración guardada correctamente');
            } else {
                this.showNotification('Error al guardar la configuración', 'error');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            this.showNotification('Error al guardar la configuración', 'error');
        }
    }

    async resetConfiguration() {
        if (confirm('¿Estás seguro de que quieres restablecer la configuración?')) {
            await this.api.loadConfig();
            await this.loadAvailableThemes();
            this.applyTheme();
            this.render();
            this.attachEventListeners();
            this.applyBackground();
            this.applyChatContainerStyle();
            this.renderMessages();
            this.showNotification('Configuración restablecida');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getInputValue() {
        const input = this.querySelector('#inputField');
        return input?.value.trim() || '';
    }

    async sendMessage() {
        const message = this.getInputValue();
        if (!message || this.loading) return;

        this.messages.push({ role: 'user', content: message });
        this.querySelector('#inputField').value = '';
        this.loading = true;
        this.render();

        if (this.api.config.streaming?.enabled) {
            await this.sendStreamingRequest(message);
        } else {
            await this.sendNormalRequest(message);
        }

        this.loading = false;
        this.render();
    }

    async sendNormalRequest(message) {
        try {
            const response = await this.api.sendMessage(message);
            this.messages.push({ role: 'assistant', content: response });
        } catch (error) {
            this.messages.push({ role: 'assistant', content: `Error: ${error.message}` });
        }
    }

    async sendStreamingRequest(message) {
        const messageIndex = this.messages.length;
        this.messages.push({ role: 'assistant', content: '' });
        this.renderMessages();

        try {
            await this.api.sendStreamingMessage(message, (chunk) => {
                this.messages[messageIndex].content += chunk;
                this.updateMessage(messageIndex);
            });
        } catch (error) {
            this.messages[messageIndex].content = `Error: ${error.message}`;
            this.renderMessages();
        }
    }

    updateMessage(index) {
        const container = this.querySelector('#messagesContainer');
        const messageEl = container?.children[index];
        if (messageEl) {
            messageEl.setAttribute('content', this.messages[index].content);
            
            // Actualizar configuración de burbujas si es necesario
            const msg = this.messages[index];
            const bubbleConfig = this.api.config.messageBubbles?.[msg.role];
            if (bubbleConfig) {
                messageEl.setAttribute('bubble-config', JSON.stringify(bubbleConfig));
            }
            
            // Actualizar configuración de tipografía
            const typographyConfig = this.api.config.typography;
            if (typographyConfig) {
                messageEl.setAttribute('typography-config', JSON.stringify(typographyConfig));
            }
            
            container.scrollTop = container.scrollHeight;
        }
    }
}

customElements.define('chat-app', ChatApp);
