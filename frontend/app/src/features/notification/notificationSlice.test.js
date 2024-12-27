import { configureStore } from '@reduxjs/toolkit';
import notificationReducer, {
    fetchNotifications,
    addNotification,
    markNotificationAsRead,
    markAsReadLocally,
    initializeWebSocket,
    closeWebSocket,
    notificationService,
    resetNotificationService
} from './notificationSlice';
import apiClient from '../../utils/apiClient';
import NotificationService from '../../utils/notificationService';

// API 呼び出しをモック
jest.mock('../../utils/apiClient');
jest.mock('../../utils/notificationService', () => {
    return jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
    }));
});

describe('notificationSlice', () => {
    let store;
    let mockNotificationService;

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

        // NotificationServiceのモックをセットアップ
        mockNotificationService = {
            connect: jest.fn(),
            disconnect: jest.fn(),
        };
        NotificationService.mockImplementation(() => mockNotificationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        resetNotificationService();
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

    test('markAsReadLocally - updates the is_read field locally', () => {
        const mockNotifications = [
            { id: 1, title: 'Notification 1', message: 'Message 1', is_read: false },
        ];
        store.dispatch(fetchNotifications.fulfilled(mockNotifications)); // 初期状態を設定
    
        store.dispatch(markAsReadLocally(1)); // `markAsReadLocally` をディスパッチ
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

    test('initializeWebSocket - initializes WebSocket connection via NotificationService', () => {
        store.dispatch(initializeWebSocket({ url: 'ws://localhost:8000/ws/notifications/' }));
    
        // `notificationService` が初期化されていることを確認
        expect(notificationService).not.toBeNull();
        expect(mockNotificationService.connect).toHaveBeenCalledTimes(1);
    });
    
    test('closeWebSocket - closes WebSocket connection via NotificationService', () => {
        store.dispatch(initializeWebSocket({ url: 'ws://localhost:8000/ws/notifications/' }));
    
        console.log('NotificationService instance:', notificationService);
    
        store.dispatch(closeWebSocket());
    
        // `disconnect` メソッドが呼び出されたことを確認
        expect(mockNotificationService.disconnect).toHaveBeenCalledTimes(1);
        expect(notificationService).toBeNull();
    });
});
