import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import courseReducer from './features/course/courseSlice';
import moduleReducer from './features/course/moduleSlice';
import fileReducer from './features/course/fileSlice'; // fileSlice をインポート

export const store = configureStore({
  reducer: {
    user: userReducer,
    course: courseReducer,
    module: moduleReducer,
    file: fileReducer, // file スライスを追加
  },
});
