import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import courseReducer from './features/course/courseSlice';
import moduleReducer from './features/course/moduleSlice';
import fileReducer from './features/course/fileSlice'; // fileSlice をインポート
import enrollmentReducer from './features/course/enrollmentSlice';
import moduleProgressReducer from './features/course/moduleProgressSlice';
import feedbackReducer from './features/course/feedbackSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    course: courseReducer,
    module: moduleReducer,
    file: fileReducer,
    enrollment: enrollmentReducer, // enrollment スライス
    moduleProgress: moduleProgressReducer, // moduleProgress スライス
    feedback: feedbackReducer,
  },
});