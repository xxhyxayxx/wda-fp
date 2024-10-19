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

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.userInfo = action.payload;
    },
  },
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
      });
  },
});

export default userSlice.reducer;
export const { login } = userSlice.actions;
