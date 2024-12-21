import { configureStore } from '@reduxjs/toolkit';
import notificationReducer, {
    fetchNotifications,
    addNotification,
    initializeWebSocket,
    closeWebSocket,
} from './notificationSlice';
import apiClient from '../../utils/apiClient';

// API 呼び出しをモック
jest.mock('../../utils/apiClient');

let notificationSocket; // グローバルなモック用変数を定義

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

        // WebSocket モックの設定
        mockWebSocket = {
            onmessage: jest.fn(),
            close: jest.fn(() => {
                console.log('Mock WebSocket close method called.');
            }),
        };

        // `global.WebSocket` を jest.fn() モックで設定
        global.WebSocket = jest.fn(() => {
            global.notificationSocket = mockWebSocket; // `notificationSocket` にモックを設定
            return mockWebSocket; // モック WebSocket を返す
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        global.WebSocket = undefined; // モックをリセット
        global.notificationSocket = null; // リセット
    });

    test('fetchNotifications - fulfilled', async () => {
        const mockNotifications = [
            { id: 1, title: 'Notification 1', message: 'Message 1' },
            { id: 2, title: 'Notification 2', message: 'Message 2' },
        ];
        apiClient.get.mockResolvedValue({ data: mockNotifications });

        await store.dispatch(fetchNotifications());
        const state = store.getState().notifications;

        expect(state.notifications).toEqual(mockNotifications);
        expect(state.status).toBe('succeeded');
        expect(state.error).toBeNull();
    });

    test('fetchNotifications - rejected', async () => {
        apiClient.get.mockRejectedValue({ message: 'Error fetching notifications' });

        await store.dispatch(fetchNotifications());
        const state = store.getState().notifications;

        expect(state.notifications).toEqual([]);
        expect(state.status).toBe('failed');
        expect(state.error).toBe('Error fetching notifications');
    });

    test('addNotification - adds a new notification', () => {
        const newNotification = { id: 3, title: 'New Notification', message: 'New Message' };

        store.dispatch(addNotification(newNotification));
        const state = store.getState().notifications;

        expect(state.notifications[0]).toEqual(newNotification); // 新しい通知が先頭に追加される
    });

    test('initializeWebSocket - establishes WebSocket connection', () => {
        store.dispatch(initializeWebSocket({ url: 'ws://localhost:8000/ws/notifications/' }));
      
        console.log('Checking global.WebSocket calls...');
        console.log(global.WebSocket.mock.calls); // 呼び出しログを確認
        console.log('notificationSocket:', global.notificationSocket); // グローバル WebSocket を確認
        console.log('mockWebSocket instance:', mockWebSocket); // モック WebSocket を確認
      
        // `global.WebSocket` が呼び出されていることを確認
        expect(global.WebSocket).toHaveBeenCalledTimes(1);
        expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8000/ws/notifications/');
        
        // `global.notificationSocket` が `mockWebSocket` を指していることを確認
        expect(global.notificationSocket).toBe(mockWebSocket);
      });
      
      
      test('closeWebSocket - closes WebSocket connection', () => {
        // WebSocket を初期化
        store.dispatch(initializeWebSocket({ url: 'ws://localhost:8000/ws/notifications/' }));
      
        console.log('notificationSocket after initialize:', global.notificationSocket);
        console.log('mockWebSocket instance:', mockWebSocket);
      
        // `global.notificationSocket` が `mockWebSocket` であることを確認
        expect(global.notificationSocket).toBe(mockWebSocket);
      
        // WebSocket を閉じる
        store.dispatch(closeWebSocket());
      
        console.log('notificationSocket after close:', global.notificationSocket);
      
        // `mockWebSocket.close` が呼び出されたことを確認
        console.log('mockWebSocket close calls:', mockWebSocket.close.mock.calls);
        expect(mockWebSocket.close).toHaveBeenCalledTimes(1);
      
        // `global.notificationSocket` が `null` に設定されていることを確認
        expect(global.notificationSocket).toBeNull();
      });          
                        
      
      test('mockWebSocket initial state', () => {
        expect(mockWebSocket.onmessage).toBeDefined();
        expect(mockWebSocket.close).toBeDefined();
      });
      
});
