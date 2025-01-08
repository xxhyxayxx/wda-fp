import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// 初期状態
const initialState = {
    messages: [], // メッセージリスト
    status: 'idle', // APIリクエストの状態: 'idle', 'loading', 'succeeded', 'failed'
    error: null, // エラー情報
};

// 非同期アクション: メッセージリストの取得
export const fetchMessages = createAsyncThunk(
    'messages/fetchMessages',
    async (receiverId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/accounts/messages/?receiver=${receiverId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch messages'); // 統一されたエラーメッセージ
        }
    }
);

// 非同期アクション: 新しいメッセージの送信
export const sendMessage = createAsyncThunk(
    'messages/sendMessage',
    async (messageData, { rejectWithValue }) => {
        try {
            // APIに送信するペイロードにreceiverを含める
            const payload = {
                receiver: messageData.receiver, // receiverId
                content: messageData.content,  // メッセージ内容
            };

            const response = await apiClient.post('/accounts/messages/send/', payload);
            return response.data;
        } catch (error) {
            console.error("API Error:", error.response.data); // デバッグ用
            return rejectWithValue(error.response.data || 'Failed to send message');
        }
    }
);

// 非同期アクション: メッセージを既読にする
export const markMessageAsRead = createAsyncThunk(
    'messages/markMessageAsRead',
    async (messageId, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`/accounts/messages/${messageId}/mark-as-read/`);
            return { messageId, ...response.data };
        } catch (error) {
            return rejectWithValue('Failed to mark message as read'); // 統一されたエラーメッセージ
        }
    }
);

// Sliceの作成
const messageSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        resetMessages: (state) => {
            state.messages = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // メッセージリストの取得
            .addCase(fetchMessages.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.status = 'idle'; // fulfilled後にidleに戻す
                state.messages = action.payload;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // 新しいメッセージの送信
            .addCase(sendMessage.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.status = 'idle'; // fulfilled後にidleに戻す
                state.messages.push(action.payload);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // メッセージを既読にする
            .addCase(markMessageAsRead.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(markMessageAsRead.fulfilled, (state, action) => {
                state.status = 'idle'; // fulfilled後にidleに戻す
                const messageIndex = state.messages.findIndex(
                    (message) => message.id === action.payload.messageId
                );
                if (messageIndex !== -1) {
                    state.messages[messageIndex].is_read = true;
                }
            })
            .addCase(markMessageAsRead.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

// アクションとリデューサーのエクスポート
export const { resetMessages } = messageSlice.actions;
export default messageSlice.reducer;
