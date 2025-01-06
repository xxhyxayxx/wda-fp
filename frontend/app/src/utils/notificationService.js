import axios from 'axios';

const websocketURL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/accounts/ws/notifications/';

class NotificationService {
    constructor(onMessageCallback) {
        this.onMessageCallback = onMessageCallback; // メッセージ受信時のコールバック関数
        this.socket = null; // WebSocketインスタンス
    }

    connect() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.socket = new WebSocket(websocketURL);

            this.socket.onopen = () => {
                console.log('WebSocket connection established.');
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('New notification received:', data);
                if (this.onMessageCallback) {
                    this.onMessageCallback(data);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket connection closed.');
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            console.log('WebSocket connection manually closed.');
            this.socket = null;
        }
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    }
}

export default NotificationService;
