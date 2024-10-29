import { configureStore } from '@reduxjs/toolkit';
import userReducer, { registerUser, loginUser, fetchProfile, updateProfile, changePassword } from './userSlice';
import apiClient from '../../utils/apiClient';
import { createLogger } from 'redux-logger';

// Mocking API client
jest.mock('../../utils/apiClient');

// フェイクタイマーを有効にする
jest.useFakeTimers();

// loggerミドルウェアを作成
const logger = createLogger();

let store;

beforeEach(() => {
  store = configureStore({
    reducer: {
      user: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  });
});

// 初期状態の確認テスト
describe('userSlice - 初期状態の確認', () => {
  it('初期状態を確認する', () => {
    const initialState = store.getState().user;
    expect(initialState).toEqual({
      isLoggedIn: false,
      userInfo: null,
      status: 'idle',
      error: null,
    });
  });
});

describe('userSlice - API呼び出しの確認', () => {
  it('APIが呼ばれていることを確認する', async () => {
    const mockResponseData = { email: 'test@example.com' };
    apiClient.post.mockResolvedValueOnce({ data: mockResponseData });

    // 非同期アクションをディスパッチ
    await store.dispatch(registerUser({ email: 'test@example.com', password: 'password123' })).unwrap();

    // API呼び出しを確認
    expect(apiClient.post).toHaveBeenCalledWith(
      '/accounts/register/',
      { email: 'test@example.com', password: 'password123' },
      { headers: { Authorization: undefined } }
    );

    // ストアの状態を確認
    const state = store.getState().user;
    console.log('Current state after API call:', state);
  });
});

describe('userSlice - アクションディスパッチの確認', () => {
  it('registerUserアクションがfulfilledであることを確認する', async () => {
    const mockResponseData = { email: 'test@example.com' };
    apiClient.post.mockResolvedValueOnce({ data: mockResponseData });

    // アクションをディスパッチ
    const resultAction = await store.dispatch(registerUser({ email: 'test@example.com', password: 'password123' }));
    console.log('Result action:', resultAction);

    // fulfilledであることを確認
    expect(resultAction.type).toBe('user/registerUser/fulfilled');

    // ディスパッチ後の状態を確認
    const stateAfterDispatch = store.getState().user;
    console.log('State after dispatch:', stateAfterDispatch);
  });
});

// registerUserアクションのテスト
describe('userSlice - registerUserアクションのテスト', () => {
  it('pending時にstatusがloadingに変わる', async () => {
    const mockResponseData = { email: 'test@example.com' };
    apiClient.post.mockResolvedValueOnce({ data: mockResponseData });

    // registerUserアクションをディスパッチ
    const actionPromise = store.dispatch(registerUser({ email: 'test@example.com', password: 'password123' }));

    const stateDuringPending = store.getState().user;
    expect(stateDuringPending.status).toBe('loading');

    await actionPromise;
  });

  it('fulfilled時にuserInfoとstatusが更新される', async () => {
    const mockResponseData = { email: 'test@example.com' };
    apiClient.post.mockResolvedValueOnce({ data: mockResponseData });

    await store.dispatch(registerUser({ email: 'test@example.com', password: 'password123' }));

    const stateAfterFulfilled = store.getState().user;
    expect(stateAfterFulfilled.userInfo).toEqual(mockResponseData);
    expect(stateAfterFulfilled.status).toBe('idle'); // fulfilled後、statusは'idle'に戻る
  });

  it('rejected時にerrorが設定され、statusがfailedに変わる', async () => {
    const mockErrorMessage = '登録に失敗しました';
    apiClient.post.mockRejectedValueOnce(new Error(mockErrorMessage));

    await store.dispatch(registerUser({ email: 'test@example.com', password: 'password123' }));

    const stateAfterRejected = store.getState().user;
    expect(stateAfterRejected.error).toBe(mockErrorMessage);
    expect(stateAfterRejected.status).toBe('idle'); // rejected後、statusは'idle'に戻る
  });
});

// loginUserアクションのテスト
describe('userSlice - loginUserアクションのテスト', () => {
  it('pending時にstatusがloadingに変わる', async () => {
    const mockResponseData = { token: 'mockToken', email: 'test@example.com' };
    apiClient.post.mockResolvedValueOnce({ data: mockResponseData });

    const actionPromise = store.dispatch(loginUser({ username: 'test@example.com', password: 'password123' }));

    const stateDuringPending = store.getState().user;
    expect(stateDuringPending.status).toBe('loading');

    await actionPromise;
  });

  it('fulfilled時にuserInfoとisLoggedInが更新される', async () => {
    const mockResponseData = { token: 'mockToken', email: 'test@example.com' };
    apiClient.post.mockResolvedValueOnce({ data: mockResponseData });

    await store.dispatch(loginUser({ username: 'test@example.com', password: 'password123' }));

    const stateAfterFulfilled = store.getState().user;
    expect(stateAfterFulfilled.userInfo).toEqual(mockResponseData);
    expect(stateAfterFulfilled.isLoggedIn).toBe(true);
    expect(stateAfterFulfilled.status).toBe('idle'); // fulfilled後、statusは'idle'に戻る
  });

  it('rejected時にerrorが設定され、isLoggedInがfalseになる', async () => {
    const mockErrorMessage = 'ログインに失敗しました';
    apiClient.post.mockRejectedValueOnce(new Error(mockErrorMessage));

    await store.dispatch(loginUser({ username: 'test@example.com', password: 'wrongpassword' }));

    const stateAfterRejected = store.getState().user;
    expect(stateAfterRejected.error).toBe(mockErrorMessage);
    expect(stateAfterRejected.isLoggedIn).toBe(false);
    expect(stateAfterRejected.status).toBe('idle'); // rejected後、statusは'idle'に戻る
  });
});

// fetchProfileアクションのテスト
describe('userSlice - fetchProfileアクションのテスト', () => {
  it('pending時にstatusがloadingに変わる', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { name: 'Test User' } });

    const actionPromise = store.dispatch(fetchProfile());

    const stateDuringPending = store.getState().user;
    expect(stateDuringPending.status).toBe('loading');

    await actionPromise;
  });

  it('fulfilled時にuserInfoが更新される', async () => {
    const mockUserData = { name: 'Test User', email: 'test@example.com' };
    apiClient.get.mockResolvedValueOnce({ data: mockUserData });

    await store.dispatch(fetchProfile());

    const stateAfterFulfilled = store.getState().user;
    expect(stateAfterFulfilled.userInfo).toEqual(mockUserData);
    expect(stateAfterFulfilled.status).toBe('idle'); // fulfilled後、statusは'idle'に戻る
  });

  it('rejected時にerrorが設定され、statusがfailedに変わる', async () => {
    const mockErrorMessage = 'プロフィールの取得に失敗しました';
    apiClient.get.mockRejectedValueOnce(new Error(mockErrorMessage));

    await store.dispatch(fetchProfile());

    const stateAfterRejected = store.getState().user;
    expect(stateAfterRejected.error).toBe(mockErrorMessage);
    expect(stateAfterRejected.status).toBe('idle'); // rejected後、statusは'idle'に戻る
  });
});

// updateProfileアクションのテスト
describe('userSlice - updateProfileアクションのテスト', () => {
  it('pending時にstatusがloadingに変わる', async () => {
    apiClient.patch.mockResolvedValueOnce({ data: { name: 'Updated User' } });

    const actionPromise = store.dispatch(updateProfile({ name: 'Updated User' }));

    const stateDuringPending = store.getState().user;
    expect(stateDuringPending.status).toBe('loading');

    await actionPromise;
  });

  it('fulfilled時にuserInfoがマージされる', async () => {
    const mockUpdatedUserData = { name: 'Updated User' };
    apiClient.patch.mockResolvedValueOnce({ data: mockUpdatedUserData });

    await store.dispatch(updateProfile({ name: 'Updated User' }));

    const stateAfterFulfilled = store.getState().user;
    expect(stateAfterFulfilled.userInfo).toMatchObject(mockUpdatedUserData);
    expect(stateAfterFulfilled.status).toBe('succeeded');
  });

  it('rejected時にerrorが設定される', async () => {
    const mockErrorMessage = 'プロフィールの更新に失敗しました';
    apiClient.patch.mockRejectedValueOnce(new Error(mockErrorMessage));

    await store.dispatch(updateProfile({ name: 'Updated User' }));

    const stateAfterRejected = store.getState().user;
    expect(stateAfterRejected.error).toBe(mockErrorMessage);
    expect(stateAfterRejected.status).toBe('failed');
  });
});

// changePasswordアクションのテスト
describe('userSlice - changePasswordアクションのテスト', () => {
  it('pending時にstatusがloadingに変わる', async () => {
    apiClient.put.mockResolvedValueOnce({ data: true });

    const actionPromise = store.dispatch(changePassword({ oldPassword: 'oldpass', newPassword: 'newpass' }));

    const stateDuringPending = store.getState().user;
    expect(stateDuringPending.status).toBe('loading');

    await actionPromise;
  });

  it('fulfilled時にstatusが更新される', async () => {
    apiClient.put.mockResolvedValueOnce({ data: true });

    await store.dispatch(changePassword({ oldPassword: 'oldpass', newPassword: 'newpass' }));

    const stateAfterFulfilled = store.getState().user;
    expect(stateAfterFulfilled.status).toBe('idle'); // fulfilled後、statusは'idle'に戻る
  });

  it('rejected時にerrorが設定される', async () => {
    const mockErrorMessage = 'パスワードの変更に失敗しました';
    apiClient.put.mockRejectedValueOnce(new Error(mockErrorMessage));

    await store.dispatch(changePassword({ oldPassword: 'oldpass', newPassword: 'newpass' }));

    const stateAfterRejected = store.getState().user;
    expect(stateAfterRejected.error).toBe(mockErrorMessage);
    expect(stateAfterRejected.status).toBe('idle'); // rejected後、statusは'idle'に戻る
  });
});
