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

// 非同期アクション: ファイルのアップロード
export const uploadFile = createAsyncThunk(
    'file/uploadFile',
    async (fileData, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiClient.post('/courses/files/create/', fileData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // アップロード後にファイル一覧を再取得して状態を更新
            await dispatch(fetchFiles(fileData.module));
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 非同期アクション: 単一ファイルの削除
export const deleteFile = createAsyncThunk(
    'file/deleteFile',
    async (id, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/courses/files/${id}/delete/`);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 非同期アクション: 複数ファイルの削除
export const deleteMultipleFiles = createAsyncThunk(
    'file/deleteMultipleFiles',
    async (fileIds, { rejectWithValue }) => {
        try {
            await apiClient.delete('/courses/files/delete/', {
                data: { file_ids: fileIds },
            });
            return fileIds;
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
            // ファイルのアップロード、編集、削除も同様に追加
            .addCase(uploadFile.fulfilled, (state) => {
                // アップロード後の一覧再取得でstate.filesが更新されるので、ここで特に処理しなくてもOK
                state.error = null;
            })
            .addCase(deleteFile.fulfilled, (state, action) => {
                state.files = state.files.filter(file => file.id !== action.payload);
            })
            .addCase(deleteMultipleFiles.fulfilled, (state, action) => {
                state.files = state.files.filter(file => !action.payload.includes(file.id));
            });
    },
});

export default fileSlice.reducer;
