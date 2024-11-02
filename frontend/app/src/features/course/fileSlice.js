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
    async (fileData, { rejectWithValue }) => {
      try {
        const response = await apiClient.post('/courses/files/create/', fileData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 非同期アクション: ファイルの編集
  export const updateFile = createAsyncThunk(
    'file/updateFile',
    async ({ id, fileData }, { rejectWithValue }) => {
      try {
        const response = await apiClient.put(`/courses/files/${id}/update/`, fileData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 非同期アクション: ファイルの削除
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
        .addCase(uploadFile.fulfilled, (state, action) => {
          state.files.push(action.payload);
        })
        .addCase(updateFile.fulfilled, (state, action) => {
          const index = state.files.findIndex(file => file.id === action.payload.id);
          if (index !== -1) state.files[index] = action.payload;
        })
        .addCase(deleteFile.fulfilled, (state, action) => {
          state.files = state.files.filter(file => file.id !== action.payload);
        });
    },
  });
  
  export default fileSlice.reducer;
  