import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// 非同期アクション: モジュール進捗を完了
export const completeProgress = createAsyncThunk(
    'moduleProgress/completeProgress',
    async (moduleId, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`courses/modules/${moduleId}/complete/`);
            return { moduleId, progressData: response.data }; // モジュールIDと進捗データを返す
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 非同期アクション: コース進捗を取得
export const fetchCourseProgress = createAsyncThunk(
    'moduleProgress/fetchCourseProgress',
    async (courseId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`courses/courses/${courseId}/progress/`);
            return { courseId, courseProgress: response.data }; // コースIDと進捗データを返す
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const moduleProgressSlice = createSlice({
    name: 'moduleProgress',
    initialState: {
        progress: {}, // モジュールIDごとの進捗データ
        courseProgress: {}, // コースIDごとの進捗データ
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // モジュール進捗
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
            })
            // コース進捗
            .addCase(fetchCourseProgress.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCourseProgress.fulfilled, (state, action) => {
                state.loading = false;
                const { courseId, courseProgress } = action.payload;
            
                // コース全体の進捗率を保存
                state.courseProgress[courseId] = courseProgress;
            
                // モジュールごとの進捗を保存
                if (courseProgress.module_progress) {
                    courseProgress.module_progress.forEach((moduleProgress) => {
                        state.progress[moduleProgress.module.id] = moduleProgress;
                    });
                }
            
                console.log('Updated state.progress:', state.progress); // デバッグ用
            })            
            .addCase(fetchCourseProgress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default moduleProgressSlice.reducer;
