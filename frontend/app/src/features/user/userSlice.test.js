import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  searchUsers,
  fetchUserDetails,
  resetSearchResults,
  resetSelectedUser,
} from './userSlice';
import apiClient from '../../utils/apiClient';

// Mock API クライアント
vi.mock('../../utils/apiClient');

let store;

beforeEach(() => {
  // ストアの初期化
  store = configureStore({
    reducer: {
      user: userReducer,
    },
  });

  // Mock をクリア
  vi.clearAllMocks();
});

describe('userSlice - 非同期アクションのテスト', () => {
  it('searchUsers - 成功時に searchResults が更新される', async () => {
    const mockSearchResults = [
      { id: 1, name: 'Test User 1' },
      { id: 2, name: 'Test User 2' },
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockSearchResults });

    await store.dispatch(searchUsers('Test'));

    const state = store.getState().user;

    expect(apiClient.get).toHaveBeenCalledWith('/accounts/search/?q=Test');
    expect(state.searchResults).toEqual(mockSearchResults);
    expect(state.status).toBe('idle');
  });

  it('searchUsers - 失敗時にエラーが設定される', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('検索に失敗しました'));

    await store.dispatch(searchUsers('Test'));

    const state = store.getState().user;

    expect(apiClient.get).toHaveBeenCalledWith('/accounts/search/?q=Test');
    expect(state.searchResults).toEqual([]);
    expect(state.error).toBe('検索に失敗しました');
    expect(state.status).toBe('failed');
  });

  it('fetchUserDetails - 成功時に selectedUser が更新される', async () => {
    const mockUserDetails = { id: 1, name: 'Test User', email: 'test@example.com' };
    apiClient.get.mockResolvedValueOnce({ data: mockUserDetails });

    await store.dispatch(fetchUserDetails(1));

    const state = store.getState().user;

    expect(apiClient.get).toHaveBeenCalledWith('/accounts/users/1/');
    expect(state.selectedUser).toEqual(mockUserDetails);
    expect(state.status).toBe('idle');
  });

  it('fetchUserDetails - 失敗時にエラーが設定される', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('ユーザー詳細の取得に失敗しました'));

    await store.dispatch(fetchUserDetails(1));

    const state = store.getState().user;

    expect(apiClient.get).toHaveBeenCalledWith('/accounts/users/1/');
    expect(state.selectedUser).toBe(null);
    expect(state.error).toBe('ユーザー詳細の取得に失敗しました');
    expect(state.status).toBe('failed');
  });
});

describe('userSlice - Reducer アクションのテスト', () => {
  it('resetSearchResults - searchResults をリセットする', () => {
    store.dispatch(resetSearchResults());

    const state = store.getState().user;

    expect(state.searchResults).toEqual([]);
  });

  it('resetSelectedUser - selectedUser をリセットする', () => {
    store.dispatch(resetSelectedUser());

    const state = store.getState().user;

    expect(state.selectedUser).toBe(null);
  });
});
