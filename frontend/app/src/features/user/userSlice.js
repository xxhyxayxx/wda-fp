// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  userInfo: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.userInfo = action.payload;
    },
    register: (state, action) => {
      state.userInfo = action.payload;  // 登録時にはログインの有無は変更しない
    },
  },
});

export default userSlice.reducer;
export const { login, register } = userSlice.actions;
