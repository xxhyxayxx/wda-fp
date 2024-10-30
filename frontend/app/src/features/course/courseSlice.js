import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// 非同期アクション: コース一覧の取得
export const fetchCourses = createAsyncThunk(
    'course/fetchCourses',
    async (_, { rejectWithValue }) => {
      try {
        const response = await apiClient.get('/courses/');  // Djangoのコース一覧APIに一致するように確認
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  

// 非同期アクション: コースの作成
export const createCourse = createAsyncThunk(
  'course/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/courses/create/', courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 非同期アクション: コースの編集
export const updateCourse = createAsyncThunk(
  'course/updateCourse',
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/courses/${id}/update/`, courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 非同期アクション: コースの削除
export const deleteCourse = createAsyncThunk(
  'course/deleteCourse',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/courses/${id}/delete/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// courseSliceの定義
const courseSlice = createSlice({
  name: 'course',
  initialState: {
    courses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // コース一覧取得
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // コースの作成
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // コースの編集
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(course => course.id === action.payload.id);
        if (index !== -1) state.courses[index] = action.payload;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // コースの削除
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(course => course.id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default courseSlice.reducer;
