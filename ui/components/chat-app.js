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
        // DEBUG: Log viewport dimensions on load
        console.log(`[DEBUG connectedCallback] window.innerHeight=${window.innerHeight}, screen.height=${screen.height}, devicePixelRatio=${window.devicePixelRatio}`);
        console.log(`[DEBUG connectedCallback] CSS supports dvh: ${'CSS' in window && CSS.supports('height', '100dvh')}`);
        await this.api.loadConfig();
        await this.loadAvailableThemes();
        this.applyTheme();
        this.applyBackground();
        this.render();
        this.attachEventListeners();
        this.startHotReload();
        
        // DEBUG: Log input-container position after initial render
        setTimeout(() => {
            const ic = this.querySelector('.input-container');
            if (ic) {
                const rect = ic.getBoundingClientRect();
                console.log(`[DEBUG connectedCallback AFTER RENDER] input-container: top=${rect.top.toFixed(1)}, bottom=${rect.bottom.toFixed(1)}, height=${rect.height.toFixed(1)}, windowInnerHeight=${window.innerHeight}`);
                console.log(`[DEBUG connectedCallback AFTER RENDER] Is input-container below viewport? ${rect.top >= window.innerHeight}`);
            }
        }, 200);
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
                const prevInterval = this.api.config.hotReload?.interval;
                const prevEnabled = this.api.config.hotReload?.enabled;
                this.lastConfigHash = newHash;
                this.api.config = newConfig;
                this.applyTheme();
                this.applyBackground();
                this.renderMessages();
                
                // Reiniciar hot reload solo si cambió el intervalo o el estado habilitado
                if (newConfig.hotReload?.interval !== prevInterval || newConfig.hotReload?.enabled !== prevEnabled) {
                    this.stopHotReload();
                    this.startHotReload();
                }
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
        
        // DEBUG: Log render calls to track when input-container is being recreated
        console.log(`[DEBUG render()] hasModal=${hasModal}, loading=${this.loading}, timestamp=${Date.now()}`);
        const inputContainerBefore = this.querySelector('.input-container');
        if (inputContainerBefore) {
            const rect = inputContainerBefore.getBoundingClientRect();
            console.log(`[DEBUG render()] input-container BEFORE: top=${rect.top.toFixed(1)}, bottom=${rect.bottom.toFixed(1)}, height=${rect.height.toFixed(1)}, visible=${rect.bottom > 0 && rect.top < window.innerHeight}`);
        }
        
        if (!hasModal) {
            // Primera vez, crear todo
            this.innerHTML = `
                <div class="chat-container">
                    <button class="config-button" id="configButton" aria-label="Configuración">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2m13.2-5.2l-6 0m-6 0l-6 0m13.2 5.2l-4.2-4.2m-2-2l-4.2-4.2"></path>
                        </svg>
                    </button>
                    <div class="config-modal" id="configModal">
                        <div class="config-modal-content">
                            <div class="config-modal-header">
                                <h2>Configuración</h2>
                                <button class="config-close" id="configClose" aria-label="Cerrar">&times;</button>
                            </div>
                            <div class="config-modal-body">
                                ${this.renderConfigContent()}
                            </div>
                        </div>
                    </div>
                    <div class="messages-container" id="messagesContainer"></div>
                    <div class="input-container">
                        <textarea
                            class="input-field"
                            id="inputField"
                            placeholder="Escribe tu mensaje..."
                            rows="1"
                            ${this.loading ? 'disabled' : ''}
                        ></textarea>
                        <button
                            class="send-button"
                            id="sendButton"
                            aria-label="Enviar"
                            ${this.loading || !this.getInputValue() ? 'disabled' : ''}
                        >
                            <svg class="send-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                            <span class="send-label">${this.loading ? 'Enviando...' : 'Enviar'}</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Ya existe el modal, solo actualizar input y botón
            const inputContainer = this.querySelector('.input-container');
            if (inputContainer) {
                // DEBUG: Log that we're replacing input-container innerHTML
                console.log(`[DEBUG render()] Replacing input-container innerHTML (loading=${this.loading})`);
                inputContainer.innerHTML = `
                    <textarea
                        class="input-field"
                        id="inputField"
                        placeholder="Escribe tu mensaje..."
                        rows="1"
                        ${this.loading ? 'disabled' : ''}
                    ></textarea>
                    <button
                        class="send-button"
                        id="sendButton"
                        aria-label="Enviar"
                        ${this.loading || !this.getInputValue() ? 'disabled' : ''}
                    >
                        <svg class="send-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        <span class="send-label">${this.loading ? 'Enviando...' : 'Enviar'}</span>
                    </button>
                `;
            }
        }
        
        this.renderMessages();
        
        // DEBUG: Log input-container position AFTER render
        setTimeout(() => {
            const inputContainerAfter = this.querySelector('.input-container');
            if (inputContainerAfter) {
                const rect = inputContainerAfter.getBoundingClientRect();
                console.log(`[DEBUG render() AFTER] input-container: top=${rect.top.toFixed(1)}, bottom=${rect.bottom.toFixed(1)}, height=${rect.height.toFixed(1)}, windowInnerHeight=${window.innerHeight}, visible=${rect.bottom > 0 && rect.top < window.innerHeight}`);
                console.log(`[DEBUG render() AFTER] chat-container height: ${this.querySelector('.chat-container')?.getBoundingClientRect().height.toFixed(1)}, body overflow: ${document.body.style.overflow}`);
            }
        }, 50);
    }

    renderMessages() {
        const container = this.querySelector('#messagesContainer');
        if (!container) return;

        container.innerHTML = '';
        this.messages.forEach(msg => {
            const messageEl = document.createElement('chat-message');
            messageEl.setAttribute('role', msg.role);
            messageEl.setAttribute('content', msg.content);
            
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

        // Auto-grow textarea on Android
        if (input) {
            input.addEventListener('input', () => {
                this._autoGrowTextarea(input);
                if (button) {
                    button.disabled = this.loading || !this.getInputValue();
                }
            });

            // Send on Enter (but not Shift+Enter for newlines)
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && !this.loading) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        button?.addEventListener('click', () => this.sendMessage());

        // Event listeners del modal (solo si no están ya configurados)
        const configButton = this.querySelector('#configButton');
        const configModal = this.querySelector('#configModal');
        const configClose = this.querySelector('#configClose');

        if (configButton && !configButton.hasAttribute('data-listener')) {
            configButton.setAttribute('data-listener', 'true');
            configButton.addEventListener('click', () => {
                configModal?.classList.add('active');
                // Prevent body scroll when modal is open
                document.body.style.overflow = 'hidden';
            });
        }

        if (configClose && !configClose.hasAttribute('data-listener')) {
            configClose.setAttribute('data-listener', 'true');
            configClose.addEventListener('click', () => {
                configModal?.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        if (configModal && !configModal.hasAttribute('data-listener')) {
            configModal.setAttribute('data-listener', 'true');
            configModal.addEventListener('click', (e) => {
                if (e.target === configModal) {
                    configModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        // Config panel event listeners
        this.attachConfigListeners();
    }

    _autoGrowTextarea(textarea) {
        // Reset height to auto to get correct scrollHeight
        textarea.style.height = 'auto';
        // Set height to scrollHeight (capped by CSS max-height)
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = newHeight + 'px';
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
                this.renderMessages();
                
                // Cerrar modal
                this.querySelector('#configModal')?.classList.remove('active');
                document.body.style.overflow = '';
                
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
            document.body.style.overflow = '';
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
        const inputField = this.querySelector('#inputField');
        if (inputField) {
            inputField.value = '';
            // Reset textarea height after clearing
            inputField.style.height = 'auto';
        }
        this.loading = true;
        // DEBUG: Log first render call (loading=true)
        console.log(`[DEBUG sendMessage()] Calling render() with loading=true`);
        this.render();
        // DEBUG: After first render, re-attach event listeners (they are lost when input-container is replaced)
        console.log(`[DEBUG sendMessage()] Re-attaching event listeners after loading=true render`);
        this.attachEventListeners();

        if (this.api.config.streaming?.enabled) {
            await this.sendStreamingRequest(message);
        } else {
            await this.sendNormalRequest(message);
        }

        this.loading = false;
        // DEBUG: Log second render call (loading=false)
        console.log(`[DEBUG sendMessage()] Calling render() with loading=false`);
        this.render();
        // DEBUG: After second render, re-attach event listeners
        console.log(`[DEBUG sendMessage()] Re-attaching event listeners after loading=false render`);
        this.attachEventListeners();
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
