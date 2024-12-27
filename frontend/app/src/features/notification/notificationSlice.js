import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import NotificationService from '../../utils/notificationService' // サービスをインポート

export let notificationService = null;

const initialState = {
    notifications: [],
    status: 'idle',
    error: null,
};

// Async thunk to fetch notifications
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('accounts/notifications/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch notifications.');
        }
    }
);

// Async thunk to mark a notification as read
export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`accounts/notifications/${notificationId}/mark-as-read/`);
            return { notificationId };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to mark notification as read.');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
        },
        markAsReadLocally: (state, action) => {
          const notificationId = action.payload;
          const notification = state.notifications.find((n) => n.id === notificationId);
          if (notification) {
              notification.is_read = true;
          }
        },
        initializeWebSocket: (state, action) => {
            const { url } = action.payload;
            if (!notificationService) {
                notificationService = new NotificationService(url, (notification) => {
                    // 通知をReduxストアに追加
                    state.notifications.unshift(notification);
                });
                notificationService.connect();
            }
        },
        closeWebSocket: () => {
            if (notificationService) {
                notificationService.disconnect();
                notificationService = null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notifications = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const { notificationId } = action.payload;
                const notification = state.notifications.find((n) => n.id === notificationId);
                if (notification) {
                    notification.is_read = true;
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

// Export actions
export const { addNotification, markAsReadLocally, initializeWebSocket, closeWebSocket } = notificationSlice.actions;

// Export reducer
export default notificationSlice.reducer;

export const resetNotificationService = () => {
  notificationService = null;
};
