class NotificationService {
    constructor(url, onMessageCallback) {
        this.url = url; // WebSocketサーバーのURL
        this.onMessageCallback = onMessageCallback; // メッセージ受信時のコールバック関数
        this.socket = null; // WebSocketインスタンス
    }

    connect() {
        // WebSocket接続を確立
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => {
                console.log('WebSocket connection established.');
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('New notification received:', data);
                if (this.onMessageCallback) {
                    this.onMessageCallback(data); // 通知をコールバック経由で処理
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
        // WebSocket接続を切断
        if (this.socket) {
            this.socket.close();
            console.log('WebSocket connection manually closed.');
            this.socket = null;
        }
    }

    sendMessage(message) {
        // WebSocket経由でメッセージを送信
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    }
}

export default NotificationService;
