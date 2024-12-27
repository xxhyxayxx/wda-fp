import { configureStore } from '@reduxjs/toolkit';
import notificationReducer, {
    fetchNotifications,
    addNotification,
    markNotificationAsRead,
    markAsReadLocally,
    initializeWebSocket,
    closeWebSocket,
    notificationSocket,
    resetNotificationSocket
} from './notificationSlice';
import apiClient from '../../utils/apiClient';

// API 呼び出しをモック
jest.mock('../../utils/apiClient');

describe('notificationSlice', () => {
    let store;
    let mockWebSocket;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                notifications: notificationReducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    serializableCheck: false, // 非シリアライズ可能な値を許可
                }),
        });

        mockWebSocket = {
            onmessage: jest.fn(),
            close: jest.fn(() => {
                console.log('Mock WebSocket close method called.');
            }),
            get readyState() {
                return this._readyState;
            },
            set readyState(value) {
                this._readyState = value;
            },
            _readyState: 0, // デフォルト値（`CONNECTING` 状態）
        };

        // WebSocket のプロパティを追加
        global.WebSocket = jest.fn(() => mockWebSocket);
        global.WebSocket.CONNECTING = 0;
        global.WebSocket.OPEN = 1;
        global.WebSocket.CLOSING = 2;
        global.WebSocket.CLOSED = 3;
    });

    afterEach(() => {
        jest.clearAllMocks();
        global.WebSocket = undefined; // モックをリセット
        global.notificationSocket = null; // リセット
        resetNotificationSocket();
    });

    // Fetch Notifications Test
    test('fetchNotifications - fulfilled', async () => {
        const mockNotifications = [
            { id: 1, title: 'Notification 1', message: 'Message 1', is_read: false },
            { id: 2, title: 'Notification 2', message: 'Message 2', is_read: true },
        ];
        apiClient.get.mockResolvedValue({ data: mockNotifications });

        await store.dispatch(fetchNotifications());
        const state = store.getState().notifications;

        expect(state.notifications).toEqual(mockNotifications);
        expect(state.status).toBe('succeeded');
        expect(state.error).toBeNull();
    });

    // Add Notification Test
    test('addNotification - adds a new notification', () => {
        const newNotification = { id: 3, title: 'New Notification', message: 'New Message', is_read: false };

        store.dispatch(addNotification(newNotification));
        const state = store.getState().notifications;

        expect(state.notifications[0]).toEqual(newNotification); // 新しい通知が先頭に追加される
    });

    // Mark Notification as Read (Local) Test
    test('markAsReadLocally - updates the is_read field locally', () => {
        const mockNotifications = [
            { id: 1, title: 'Notification 1', message: 'Message 1', is_read: false },
        ];
        store.dispatch(fetchNotifications.fulfilled(mockNotifications));

        store.dispatch(markAsReadLocally(1));
        const state = store.getState().notifications;

        expect(state.notifications[0].is_read).toBe(true); // ローカルで既読に更新されていることを確認
    });

    // Mark Notification as Read (Server) Test
    test('markNotificationAsRead - updates the is_read field on the server', async () => {
        const notificationId = 1;
        const mockNotifications = [
            { id: 1, title: 'Notification 1', message: 'Message 1', is_read: false },
        ];
        store.dispatch(fetchNotifications.fulfilled(mockNotifications));

        apiClient.post.mockResolvedValue({}); // 成功レスポンスをモック

        await store.dispatch(markNotificationAsRead(notificationId));
        const state = store.getState().notifications;

        expect(apiClient.post).toHaveBeenCalledWith(`accounts/notifications/${notificationId}/mark-as-read/`);
        expect(state.notifications[0].is_read).toBe(true); // サーバー側の更新後に既読になっていることを確認
    });

    // Mark Notification as Read (Server) Test - Rejected
    test('markNotificationAsRead - handles server error gracefully', async () => {
        const notificationId = 1;
        const mockNotifications = [
            { id: 1, title: 'Notification 1', message: 'Message 1', is_read: false },
        ];
        store.dispatch(fetchNotifications.fulfilled(mockNotifications));

        apiClient.post.mockRejectedValue({ message: 'Error marking as read' });

        await store.dispatch(markNotificationAsRead(notificationId));
        const state = store.getState().notifications;

        expect(state.notifications[0].is_read).toBe(false); // エラーが発生しても既読状態は変更されないことを確認
        expect(state.error).toBe('Error marking as read');
    });

    // WebSocket Tests
    test('initializeWebSocket - establishes WebSocket connection', () => {
        store.dispatch(initializeWebSocket({ url: 'ws://localhost:8000/ws/notifications/' }));

        // `WebSocket` が呼び出されたことを確認
        expect(global.WebSocket).toHaveBeenCalledTimes(1);
        expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8000/ws/notifications/');

        // `notificationSocket` がモック WebSocket を指していることを確認
        expect(notificationSocket).toBe(mockWebSocket);
    });


    test('closeWebSocket - handles non-open WebSocket gracefully', () => {
        // WebSocket を初期化
        store.dispatch(initializeWebSocket({ url: 'ws://localhost:8000/ws/notifications/' }));

        // readyState を CONNECTING に設定
        Object.defineProperty(mockWebSocket, 'readyState', {
            value: WebSocket.CONNECTING,
            writable: true,
        });

        // WebSocket を閉じる
        store.dispatch(closeWebSocket());

        // `mockWebSocket.close` が呼び出されないことを確認
        expect(mockWebSocket.close).not.toHaveBeenCalled();

        // `notificationSocket` が `null` に設定されていることを確認
        expect(notificationSocket).toBeNull();
    });

    test('closeWebSocket - closes WebSocket when open', () => {
        // WebSocket を初期化
        store.dispatch(initializeWebSocket({ url: 'ws://localhost:8000/ws/notifications/' }));
        mockWebSocket.readyState = WebSocket.OPEN; // 接続済み状態をシミュレート

        // WebSocket を閉じる
        store.dispatch(closeWebSocket());

        // `mockWebSocket.close` が呼び出されたことを確認
        expect(mockWebSocket.close).toHaveBeenCalledTimes(1);

        // `notificationSocket` が `null` に設定されていることを確認
        expect(notificationSocket).toBeNull();
    });

});
