import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// 非同期アクション: ファイル一覧の取得
export const fetchFiles = createAsyncThunk(
    'file/fetchFiles',
    async (moduleId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/courses/files/?module=${moduleId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 非同期アクション: ファイルのバッチ更新 (作成、更新、削除)
export const batchUpdateFiles = createAsyncThunk(
    'file/batchUpdateFiles',
    async ({ moduleId, filesToCreate, filesToUpdate, filesToDelete }, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();

            // 新規作成ファイルの追加
            filesToCreate.forEach((file) => formData.append('files_to_create', file));

            // 更新する既存ファイルの追加
            filesToUpdate.forEach((file) => formData.append('files_to_update', file));

            // 削除するファイルIDの追加
            filesToDelete.forEach((fileId) => formData.append('files_to_delete', fileId));

            // モジュールIDの追加
            formData.append('module', moduleId);

            // リクエスト送信
            const response = await apiClient.post('/courses/files/batch-update/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 更新されたファイル一覧を取得して状態を更新
            await dispatch(fetchFiles(moduleId));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const fileSlice = createSlice({
    name: 'file',
    initialState: {
        files: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFiles.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFiles.fulfilled, (state, action) => {
                state.loading = false;
                state.files = action.payload;
            })
            .addCase(fetchFiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // バッチアップデート後、ファイル一覧を再取得
            .addCase(batchUpdateFiles.pending, (state) => {
                state.loading = true;
            })
            .addCase(batchUpdateFiles.fulfilled, (state) => {
                state.loading = false;
                state.error = null;  // エラーをクリア
            })
            .addCase(batchUpdateFiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default fileSlice.reducer;
