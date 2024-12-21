import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

let notificationSocket = null;

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
      const response = await apiClient.get('/notifications/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications.');
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
    initializeWebSocket: (state, action) => {
      const { url } = action.payload;
      if (!global.notificationSocket) {
        console.log('Initializing WebSocket...');
        const mockSocket = new WebSocket(url); // モック WebSocket を生成
        global.notificationSocket = mockSocket; // グローバル変数に割り当て
        global.notificationSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          state.notifications.unshift(data); // 通知を追加
        };
      }
    },    
    closeWebSocket: () => {
      console.log('Closing WebSocket...', global.notificationSocket);
      if (global.notificationSocket) {
        console.log('Calling close on notificationSocket...');
        global.notificationSocket.close();
        console.log('WebSocket successfully closed.');
        global.notificationSocket = null;
      } else {
        console.log('No WebSocket to close.');
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
      });
  },
});

// Export actions
export const { addNotification, initializeWebSocket, closeWebSocket } = notificationSlice.actions;

// Export reducer
export default notificationSlice.reducer;
