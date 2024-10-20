import userReducer, { login, registerUser, loginUser } from './userSlice';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

jest.mock('axios');

describe('userSlice', () => {
  const initialState = {
    isLoggedIn: false,
    userInfo: null,
    status: 'idle',
    error: null,
  };

  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });
});

describe('userSlice async actions', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  it('should handle registerUser successfully', async () => {
    // モックAPIレスポンスの準備
    axios.post.mockResolvedValueOnce({
      data: { email: 'newuser@example.com', name: 'New User' },
    });

    // `registerUser` のディスパッチをテスト
    await store.dispatch(registerUser({ email: 'newuser@example.com', password: 'password123' }));

    // 期待する状態を確認
    const state = store.getState().user;
    expect(state.status).toBe('succeeded');
    expect(state.userInfo).toEqual({ email: 'newuser@example.com', name: 'New User' });
  });

  it('should handle registerUser failure', async () => {
    // モックAPIレスポンスでエラーを返すように設定
    axios.post.mockRejectedValueOnce({
      response: { data: 'エラーが発生しました' },
    });

    // `registerUser` のディスパッチをテスト
    await store.dispatch(registerUser({ email: 'test@example.com', password: 'password123' }));

    // 期待する状態を確認
    const state = store.getState().user;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('エラーが発生しました');
  });
});

describe('userSlice async actions', () => {
    let store;
  
    beforeEach(() => {
      store = configureStore({
        reducer: {
          user: userReducer,
        },
      });
    });
  
    it('should handle loginUser successfully', async () => {
      // モックAPIレスポンスの準備
      axios.post.mockResolvedValueOnce({
        data: { email: 'test@example.com', name: 'Test User' },
      });
  
      // `loginUser` のディスパッチをテスト
      await store.dispatch(loginUser({ email: 'test@example.com', password: 'password123' }));
  
      // 期待する状態を確認
      const state = store.getState().user;
      expect(state.status).toBe('succeeded');
      expect(state.isLoggedIn).toBe(true);
      expect(state.userInfo).toEqual({ email: 'test@example.com', name: 'Test User' });
    });
  
    it('should handle loginUser failure', async () => {
      // モックAPIレスポンスでエラーを返すように設定
      axios.post.mockRejectedValueOnce({
        response: { data: 'ログインエラーが発生しました' },
      });
  
      // `loginUser` のディスパッチをテスト
      await store.dispatch(loginUser({ email: 'test@example.com', password: 'password123' }));
  
      // 期待する状態を確認
      const state = store.getState().user;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('ログインエラーが発生しました');
      expect(state.isLoggedIn).toBe(false);
    });
});
