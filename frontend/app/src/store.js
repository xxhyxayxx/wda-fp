import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import courseReducer from './features/course/courseSlice';
import moduleReducer from './features/course/moduleSlice';  // moduleSlice をインポート

export const store = configureStore({
  reducer: {
    user: userReducer,
    course: courseReducer,
    module: moduleReducer,  // module スライスを追加
  },
});
