import userReducer, { registerUser, loginUser, logoutUser, fetchProfile, updateProfile, changePassword } from './userSlice';
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

// fetchProfileの非同期アクションに対するテスト
describe('userSlice - fetchProfile', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  it('プロフィール取得成功時の処理を確認する', async () => {
    const mockProfileData = { name: 'testUser', user_type: 'student' };
    apiClient.get.mockResolvedValueOnce({ data: mockProfileData });

    await store.dispatch(fetchProfile());

    const state = store.getState().user;
    expect(state.status).toBe('succeeded');
    expect(state.userInfo).toEqual(mockProfileData);
  });

  it('プロフィール取得失敗時の処理を確認する', async () => {
    const mockErrorMessage = 'プロフィール取得に失敗しました';
    apiClient.get.mockRejectedValueOnce(new Error(mockErrorMessage));

    await store.dispatch(fetchProfile());

    const state = store.getState().user;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(mockErrorMessage);
  });
});

// updateProfileの非同期アクションに対するテスト
describe('userSlice - updateProfile', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  it('プロフィール更新成功時の処理を確認する', async () => {
    const mockProfileData = { name: 'updatedUser', user_type: 'teacher' };
    apiClient.patch.mockResolvedValueOnce({ data: mockProfileData });

    await store.dispatch(updateProfile({ name: 'updatedUser', user_type: 'teacher' }));

    const state = store.getState().user;
    expect(state.status).toBe('succeeded');
    expect(state.userInfo).toEqual(expect.objectContaining(mockProfileData));
  });

  it('プロフィール更新失敗時の処理を確認する', async () => {
    const mockErrorMessage = 'プロフィールの更新に失敗しました';
    apiClient.patch.mockRejectedValueOnce(new Error(mockErrorMessage));

    await store.dispatch(updateProfile({ name: 'updatedUser', user_type: 'teacher' }));

    const state = store.getState().user;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(mockErrorMessage);
  });
});

// changePasswordの非同期アクションに対するテスト
describe('userSlice - changePassword', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  it('パスワード変更成功時の処理を確認する', async () => {
    apiClient.put.mockResolvedValueOnce({}); // 成功時のレスポンスをモック

    await store.dispatch(changePassword({ current_password: 'oldPass', new_password: 'newPass' }));

    const state = store.getState().user;
    expect(state.status).toBe('succeeded');
    expect(state.error).toBeNull();
  });

  it('パスワード変更失敗時の処理を確認する', async () => {
    const mockErrorMessage = 'パスワードの変更に失敗しました';
    apiClient.put.mockRejectedValueOnce(new Error(mockErrorMessage)); // エラー時のレスポンスをモック

    await store.dispatch(changePassword({ current_password: 'oldPass', new_password: 'newPass' }));

    const state = store.getState().user;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(mockErrorMessage);
  });
});
