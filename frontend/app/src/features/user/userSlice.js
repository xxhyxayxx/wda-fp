import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient'; // 作成したaxiosインスタンス

const initialState = {
  isLoggedIn: false,
  userInfo: null,
  searchResults: [], // 検索結果を保持
  selectedUser: null, // 選択されたユーザー詳細
  status: 'idle',
  error: null,
};

// ローカルストレージに保存されたトークンをAxiosに設定
const token = localStorage.getItem('authToken');
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
}

// ユーザー検索の非同期アクション
export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/accounts/search/?q=${query}`);
      return response.data; // 検索結果を返す
    } catch (error) {
      return rejectWithValue(error.message || '検索に失敗しました');
    }
  }
);

// ユーザー詳細取得の非同期アクション
export const fetchUserDetails = createAsyncThunk(
  'user/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/accounts/users/${userId}/`);
      return response.data; // ユーザー詳細を返す
    } catch (error) {
      return rejectWithValue(error.message || 'ユーザー詳細の取得に失敗しました');
    }
  }
);

// 非同期アクションの作成
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/accounts/register/', userData, {
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
      // 古いトークンを削除
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];

      // ログインリクエスト
      const response = await apiClient.post('/accounts/login/', {
        username: userData.username,
        password: userData.password,
      });

      const { token } = response.data;
      console.log("Received Token:", token);

      if (!token) {
        throw new Error("トークンが存在しません");
      }

      // トークンをローカルストレージに保存し、Axiosに設定
      localStorage.setItem('authToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;

      return { token };
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
      await apiClient.post('/accounts/logout/');
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
      const response = await apiClient.get('/accounts/profile/update/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'プロフィールの取得に失敗しました');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch('/accounts/profile/update/', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'プロフィールの更新に失敗しました');
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/accounts/change-password/', passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'パスワードの変更に失敗しました');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 状態をリセットするアクション
    resetSearchResults: (state) => {
      state.searchResults = [];
    },
    resetSelectedUser: (state) => {
      state.selectedUser = null;
    },
    resetStatus: (state) => {
      state.status = 'idle';
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
        state.status = 'idle';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.status = 'idle';
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isLoggedIn = true;
        state.userInfo = { token: action.payload.token }; // トークンのみ
        state.status = 'idle';
      })         
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isLoggedIn = false;
        state.status = 'idle';
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
        state.status = 'idle';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.status = 'idle';
      })
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.status = 'idle';
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      // updateProfile.fulfilledの修正
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { user_type, ...updatedData } = action.payload;
        state.userInfo = { ...state.userInfo, ...updatedData };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.status = 'idle';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.status = 'idle';
      })
      // searchUsers
      .addCase(searchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload; // 検索結果を保存
        state.status = 'idle';
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.searchResults = [];
      })
      // fetchUserDetails
      .addCase(fetchUserDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedUser = action.payload; // ユーザー詳細を保存
        state.status = 'idle';
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.selectedUser = null;
      });
  },
});

// resetStatusアクションをエクスポート
export const { resetSearchResults, resetSelectedUser, resetStatus } = userSlice.actions;

export default userSlice.reducer;
