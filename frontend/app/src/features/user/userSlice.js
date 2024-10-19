import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  userInfo: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 必要に応じてアクションを追加
    login: (state, action) => {
        state.isLoggedIn = true;
        state.userInfo = action.payload;
    },
  },
});

export default userSlice.reducer;
export const { login } = userSlice.actions;

