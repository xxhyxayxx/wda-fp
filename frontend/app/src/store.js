import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import courseReducer from './features/course/courseSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    course: courseReducer,
  },
});


