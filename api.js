export class ChatAPI {
    constructor() {
        this.config = {
            endpoint: '',
            model: '',
            apiKey: '',
            streaming: {
                enabled: false,
                mode: 'raw',
                smoothSpeed: 50
            }
        };
    }

    async loadConfig() {
        try {
            const response = await fetch('/api/config');
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    async sendMessage(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    }

    async sendStreamingMessage(message, onChunk) {
        const response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const json = JSON.parse(data);
                        if (json.content) {
                            if (this.config.streaming.mode === 'smooth') {
                                await this.smoothOutput(json.content, onChunk);
                            } else {
                                onChunk(json.content);
                            }
                        }
                    } catch (e) {
                        console.error('Parse error:', e);
                    }
                }
            }
        }
    }

    async smoothOutput(text, onChunk) {
        const chunkSize = 3;
        for (let i = 0; i < text.length; i += chunkSize) {
            const chunk = text.slice(i, i + chunkSize);
            onChunk(chunk);
            await new Promise(resolve => setTimeout(resolve, this.config.streaming.smoothSpeed));
        }
    }
}
