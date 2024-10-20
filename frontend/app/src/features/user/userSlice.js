import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isLoggedIn: false,
  userInfo: null,
  status: 'idle', // 新しい状態のフィールドを追加
  error: null,    // エラー状態のフィールドを追加
};

// 非同期アクションの作成
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async (userData, { rejectWithValue }) => {
      try {
        const response = await axios.post('/api/login', userData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
);

export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, { rejectWithValue }) => {
      try {
        await axios.post('/api/logout');
        return true;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        // Register
        .addCase(registerUser.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.userInfo = action.payload;
        })
        .addCase(registerUser.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        })
        // Login
        .addCase(loginUser.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.isLoggedIn = true;
          state.userInfo = action.payload;
        })
        .addCase(loginUser.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
          state.isLoggedIn = false;
        })
        // Logout
        .addCase(logoutUser.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(logoutUser.fulfilled, (state) => {
          state.status = 'succeeded';
          state.isLoggedIn = false;
          state.userInfo = null;
        })
        .addCase(logoutUser.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        });
    },
});
export default userSlice.reducer;
