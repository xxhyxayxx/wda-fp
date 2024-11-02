import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// 非同期アクション: モジュール一覧の取得
export const fetchModules = createAsyncThunk(
    'module/fetchModules',
    async (courseId, { rejectWithValue }) => {
      try {
        const response = await apiClient.get(`/courses/modules/?course=${courseId}`);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 非同期アクション: モジュールの作成
  export const createModule = createAsyncThunk(
    'module/createModule',
    async (moduleData, { rejectWithValue }) => {
      try {
        const response = await apiClient.post('/courses/modules/create/', moduleData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 非同期アクション: モジュールの編集
  export const updateModule = createAsyncThunk(
    'module/updateModule',
    async ({ id, moduleData }, { rejectWithValue }) => {
      try {
        const response = await apiClient.put(`/courses/modules/${id}/update/`, moduleData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // 非同期アクション: モジュールの削除
  export const deleteModule = createAsyncThunk(
    'module/deleteModule',
    async (id, { rejectWithValue }) => {
      try {
        await apiClient.delete(`/courses/modules/${id}/delete/`);
        return id;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  const moduleSlice = createSlice({
    name: 'module',
    initialState: {
      modules: [],
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchModules.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchModules.fulfilled, (state, action) => {
          state.loading = false;
          state.modules = action.payload;
        })
        .addCase(fetchModules.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // モジュールの作成、編集、削除も同様に追加
        .addCase(createModule.fulfilled, (state, action) => {
          state.modules.push(action.payload);
        })
        .addCase(updateModule.fulfilled, (state, action) => {
          const index = state.modules.findIndex(module => module.id === action.payload.id);
          if (index !== -1) state.modules[index] = action.payload;
        })
        .addCase(deleteModule.fulfilled, (state, action) => {
          state.modules = state.modules.filter(module => module.id !== action.payload);
        });
    },
  });
  
  export default moduleSlice.reducer;
  