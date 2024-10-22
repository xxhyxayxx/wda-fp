import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient'; // 作成したaxiosインスタンス

const initialState = {
  isLoggedIn: false,
  userInfo: null,
  status: 'idle',
  error: null,
};

// ローカルストレージに保存されたトークンをAxiosに設定
const token = localStorage.getItem('authToken');
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
}

// 非同期アクションの作成
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/register/', userData, {
        headers: {
          // Authorizationヘッダーを明示的に取り除く
          Authorization: undefined,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || '登録に失敗しました');
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      // 古いトークンを削除してからログインを試みる
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];

      const response = await apiClient.post('/login/', {
        username: userData.username,
        password: userData.password,
      });

      const token = response.data.token;
      console.log("Received Token:", response.data);

      if (!token) {
        throw new Error("トークンが存在しません");
      }

      // トークンをローカルストレージに保存
      localStorage.setItem('authToken', token);
      // ログイン後に新しいトークンをセット
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;

      return response.data;
    } catch (error) {
      console.error("Error during login:", error);
      return rejectWithValue(error.message || 'ログインに失敗しました');
    }
  }
);


export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/logout/');
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'ログアウトに失敗しました');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/profile/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'プロフィールの取得に失敗しました');
    }
  }
);

// 新しいupdateProfileアクションを追加
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch('/profile/update/', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'プロフィールの更新に失敗しました');
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
      })
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = { ...state.userInfo, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
