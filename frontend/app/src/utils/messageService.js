import axios from 'axios';

class MessageService {
    constructor(chatId, onMessageCallback) {
        this.chatId = chatId; // chat_id を動的に設定
        this.onMessageCallback = onMessageCallback; // メッセージ受信時のコールバック関数
        this.socket = null; // WebSocketインスタンス
    }

    connect() {
        const websocketURL = `${import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/accounts/ws/messages/'}${this.chatId}/`;

        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.socket = new WebSocket(websocketURL);

            this.socket.onopen = () => {
                console.log(`WebSocket connection for chat ${this.chatId} established.`);
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('New message received:', data);
                if (this.onMessageCallback) {
                    this.onMessageCallback(data);
                }
            };

            this.socket.onclose = () => {
                console.log(`WebSocket connection for chat ${this.chatId} closed.`);
            };

            this.socket.onerror = (error) => {
                console.error(`WebSocket error in message service for chat ${this.chatId}:`, error);
            };
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            console.log(`WebSocket connection for chat ${this.chatId} manually closed.`);
            this.socket = null;
        }
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error(`WebSocket for chat ${this.chatId} is not open. Cannot send message.`);
        }
    }
}

export default MessageService;
