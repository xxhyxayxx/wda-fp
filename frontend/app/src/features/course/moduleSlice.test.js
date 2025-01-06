import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import moduleReducer, {
  fetchModules,
  createModule,
  updateModule,
  deleteModule,
} from './moduleSlice';
import apiClient from '../../utils/apiClient';

// API呼び出しをモック
vi.mock('../../utils/apiClient');

describe('moduleSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        module: moduleReducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetchModules - fulfilled', async () => {
    const mockData = [{ id: 1, title: 'Test Module' }];
    apiClient.get.mockResolvedValue({ data: mockData });

    await store.dispatch(fetchModules(1));
    const state = store.getState().module;

    expect(state.modules).toEqual(mockData);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchModules - rejected', async () => {
    apiClient.get.mockRejectedValue({ message: 'Error fetching modules' });

    await store.dispatch(fetchModules(1));
    const state = store.getState().module;

    expect(state.modules).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error fetching modules');
  });

  it('createModule - fulfilled', async () => {
    const newModule = { id: 2, title: 'New Module' };
    apiClient.post.mockResolvedValue({ data: newModule });

    await store.dispatch(createModule(newModule));
    const state = store.getState().module;

    expect(state.modules).toContainEqual(newModule);
    expect(state.error).toBeNull();
  });

  it('updateModule - fulfilled', async () => {
    const existingModule = { id: 1, title: 'Existing Module' };
    store.dispatch({ type: fetchModules.fulfilled.type, payload: [existingModule] });
    const updatedModule = { id: 1, title: 'Updated Module' };
    apiClient.put.mockResolvedValue({ data: updatedModule });

    await store.dispatch(updateModule({ id: 1, moduleData: updatedModule }));
    const state = store.getState().module;

    // モジュールが更新されたか確認
    expect(state.modules).toContainEqual(updatedModule);
    expect(state.error).toBeNull();
  });

  it('deleteModule - fulfilled', async () => {
    const existingModule = { id: 1, title: 'Module to Delete' };
    store.dispatch({ type: fetchModules.fulfilled.type, payload: [existingModule] });
    apiClient.delete.mockResolvedValue();

    await store.dispatch(deleteModule(1));
    const state = store.getState().module;

    // モジュールが削除されたか確認
    expect(state.modules).not.toContainEqual(existingModule);
    expect(state.error).toBeNull();
  });
});
