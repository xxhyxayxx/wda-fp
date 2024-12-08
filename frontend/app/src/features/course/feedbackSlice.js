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
  async (feedbackData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/courses/feedback/create/', feedbackData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
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
