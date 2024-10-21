import userReducer, { registerUser, loginUser, logoutUser } from './userSlice';
import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { expect } from '@jest/globals';

// Mocking API client
jest.mock('../../utils/apiClient');

// registerUserの非同期アクションに対するテスト
describe('userSlice - registerUser', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  it('登録成功時の処理を確認する', async () => {
    const mockResponseData = { username: 'testUser', email: 'test@example.com' };
    apiClient.post.mockResolvedValueOnce({ data: mockResponseData });

    await store.dispatch(registerUser({ username: 'testUser', email: 'test@example.com', password: 'password123' }));

    const state = store.getState().user;
    expect(state.status).toBe('succeeded');
    expect(state.userInfo).toEqual(mockResponseData);
  });
});

// loginUserの非同期アクションに対するテスト
describe('userSlice - loginUser', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  it('ログイン成功時の処理を確認する', async () => {
    const mockResponseData = { token: 'mockToken', username: 'testUser' };
    apiClient.post.mockResolvedValueOnce({ data: mockResponseData });

    await store.dispatch(loginUser({ username: 'testUser', password: 'password123' }));

    const state = store.getState().user;
    expect(state.status).toBe('succeeded');
    expect(state.isLoggedIn).toBe(true);
    expect(state.userInfo).toEqual(mockResponseData);
  });

  it('ログイン失敗時の処理を確認する', async () => {
    const mockErrorMessage = 'ログインに失敗しました';
    apiClient.post.mockRejectedValueOnce(new Error(mockErrorMessage));

    await store.dispatch(loginUser({ username: 'testUser', password: 'wrongPassword' }));

    const state = store.getState().user;
    expect(state.status).toBe('failed');
    expect(state.isLoggedIn).toBe(false);
    expect(state.error).toBe(mockErrorMessage);
  });
});

// logoutUserの非同期アクションに対するテスト
describe('userSlice - logoutUser', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  it('ログアウト成功時の処理を確認する', async () => {
    apiClient.post.mockResolvedValueOnce({});

    await store.dispatch(logoutUser());

    const state = store.getState().user;
    expect(state.status).toBe('succeeded');
    expect(state.isLoggedIn).toBe(false);
    expect(state.userInfo).toBeNull();
  });

  it('ログアウト失敗時の処理を確認する', async () => {
    const mockErrorMessage = 'ログアウトに失敗しました';
    apiClient.post.mockRejectedValueOnce(new Error(mockErrorMessage));

    await store.dispatch(logoutUser());

    const state = store.getState().user;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(mockErrorMessage);
  });
});
