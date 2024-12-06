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
      const response = await apiClient.get('/courses/enrollments/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 非同期アクション: コースに登録されている学生一覧の取得
export const fetchCourseStudents = createAsyncThunk(
  'enrollment/fetchCourseStudents',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/students/`);
      return response.data; // 学生一覧を返す
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
    courseStudents: [], // コースに登録されている学生のリスト
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
        state.enrollments.push(action.payload);
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
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // コースに登録されている学生一覧の取得
      .addCase(fetchCourseStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.courseStudents = action.payload;
      })
      .addCase(fetchCourseStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default enrollmentSlice.reducer;