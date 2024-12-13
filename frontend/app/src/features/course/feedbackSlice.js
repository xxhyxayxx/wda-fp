import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// 非同期アクション: フィードバック一覧の取得
export const fetchFeedback = createAsyncThunk(
    'feedback/fetchFeedback',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/courses/feedback/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 非同期アクション: フィードバックの作成
export const createFeedback = createAsyncThunk(
    'feedback/createFeedback',
    async ({ enrollment_id, rating, comment }, { rejectWithValue }) => {
        try {
            // 送信データを確認
            console.log('Sending Feedback Data:', { enrollment_id, rating, comment });

            // enrollment_idをURLに組み込む
            const response = await apiClient.post(
                `/courses/feedback/create/${enrollment_id}/`,
                { enrollment_id, rating, comment }// データをオブジェクトとして送信
            );
            return response.data;
        } catch (error) {
            console.error('Error in createFeedback:', error.response?.data || error.message);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// feedbackSliceの定義
const feedbackSlice = createSlice({
    name: 'feedback',
    initialState: {
        feedbacks: [], // フィードバックのリスト
        loading: false, // ローディング状態
        error: null, // エラー情報
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // フィードバック一覧取得
            .addCase(fetchFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeedback.fulfilled, (state, action) => {
                state.loading = false;
                state.feedbacks = action.payload;
            })
            .addCase(fetchFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // フィードバックの作成
            .addCase(createFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFeedback.fulfilled, (state, action) => {
                state.loading = false;
                state.feedbacks.push(action.payload);
            })
            .addCase(createFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default feedbackSlice.reducer;
