import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// 非同期アクション: モジュール進捗を完了し、進捗状況を取得
export const completeProgress = createAsyncThunk(
    'moduleProgress/completeProgress',
    async (moduleId, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`/modules/${moduleId}/complete/`);
            return { moduleId, progressData: response.data }; // モジュールIDと進捗データを返す
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const moduleProgressSlice = createSlice({
    name: 'moduleProgress',
    initialState: {
        progress: {}, // モジュールIDごとの進捗データ
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(completeProgress.pending, (state) => {
                state.loading = true;
            })
            .addCase(completeProgress.fulfilled, (state, action) => {
                state.loading = false;
                const { moduleId, progressData } = action.payload;
                state.progress[moduleId] = progressData; // モジュールIDごとの進捗データを更新
            })
            .addCase(completeProgress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default moduleProgressSlice.reducer;
