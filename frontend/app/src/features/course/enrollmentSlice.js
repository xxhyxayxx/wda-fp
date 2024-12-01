import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// 非同期アクション: コース登録
export const enrollInCourse = createAsyncThunk(
  'enrollment/enrollInCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 非同期アクション: 登録済みコース一覧の取得
export const fetchEnrollments = createAsyncThunk(
  'enrollment/fetchEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/courses/enrollments/'); // 登録済みコース一覧を取得するAPI
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// enrollmentSliceの定義
const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState: {
    enrollments: [], // 登録済みコースのリスト
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // コース登録
      .addCase(enrollInCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments.push(action.payload); // 新しく登録されたコースを追加
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 登録済みコース一覧の取得
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload; // 登録済みコース一覧を更新
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default enrollmentSlice.reducer;
