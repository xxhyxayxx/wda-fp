import { configureStore } from '@reduxjs/toolkit';
import moduleReducer, {
  fetchModules,
  createModule,
  updateModule,
  deleteModule,
} from './moduleSlice';
import apiClient from '../../utils/apiClient';
import thunk from 'redux-thunk';

// API呼び出しをモック
jest.mock('../../utils/apiClient');

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
    jest.clearAllMocks();
  });

  test('fetchModules - fulfilled', async () => {
    const mockData = [{ id: 1, title: 'Test Module' }];
    apiClient.get.mockResolvedValue({ data: mockData });

    await store.dispatch(fetchModules(1));
    const state = store.getState().module;
    
    expect(state.modules).toEqual(mockData);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('fetchModules - rejected', async () => {
    apiClient.get.mockRejectedValue({ message: 'Error fetching modules' });

    await store.dispatch(fetchModules(1));
    const state = store.getState().module;

    expect(state.modules).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error fetching modules');
  });

  test('createModule - fulfilled', async () => {
    const newModule = { id: 2, title: 'New Module' };
    apiClient.post.mockResolvedValue({ data: newModule });

    await store.dispatch(createModule(newModule));
    const state = store.getState().module;

    expect(state.modules).toContainEqual(newModule);
    expect(state.error).toBeNull();
  });

  test('updateModule - fulfilled', async () => {
    const existingModule = { id: 1, title: 'Existing Module' };
    store.dispatch({ type: fetchModules.fulfilled.type, payload: [existingModule] });
    const updatedModule = { id: 1, title: 'Updated Module' };
    apiClient.put.mockResolvedValue({ data: updatedModule });

    await store.dispatch(updateModule({ id: 1, moduleData: updatedModule }));
    const state = store.getState().module;

    expect(state.modules).toContainEqual(updatedModule);
    expect(state.error).toBeNull();
  });

  test('deleteModule - fulfilled', async () => {
    const existingModule = { id: 1, title: 'Module to Delete' };
    store.dispatch({ type: fetchModules.fulfilled.type, payload: [existingModule] });
    apiClient.delete.mockResolvedValue();

    await store.dispatch(deleteModule(1));
    const state = store.getState().module;

    expect(state.modules).not.toContainEqual(existingModule);
    expect(state.error).toBeNull();
  });
});
