import { configureStore } from '@reduxjs/toolkit';
import fileReducer, {
  fetchFiles,
  uploadFile,
  updateFile,
  deleteFile,
} from './fileSlice';
import apiClient from '../../utils/apiClient';

// API呼び出しをモック
jest.mock('../../utils/apiClient');

describe('fileSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        file: fileReducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetchFiles - fulfilled', async () => {
    const mockData = [{ id: 1, title: 'Test File' }];
    apiClient.get.mockResolvedValue({ data: mockData });

    await store.dispatch(fetchFiles(1));  // モジュールIDを1としてテスト
    const state = store.getState().file;

    expect(state.files).toEqual(mockData);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('fetchFiles - rejected', async () => {
    apiClient.get.mockRejectedValue({ message: 'Error fetching files' });

    await store.dispatch(fetchFiles(1));
    const state = store.getState().file;

    expect(state.files).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error fetching files');
  });

  test('uploadFile - fulfilled', async () => {
    const newFile = { id: 2, title: 'New File' };
    apiClient.post.mockResolvedValue({ data: newFile });

    await store.dispatch(uploadFile(newFile));
    const state = store.getState().file;

    expect(state.files).toContainEqual(newFile);
    expect(state.error).toBeNull();
  });

  test('updateFile - fulfilled', async () => {
    const existingFile = { id: 1, title: 'Existing File' };
    store.dispatch({ type: fetchFiles.fulfilled.type, payload: [existingFile] });
    const updatedFile = { id: 1, title: 'Updated File' };
    apiClient.put.mockResolvedValue({ data: updatedFile });

    await store.dispatch(updateFile({ id: 1, fileData: updatedFile }));
    const state = store.getState().file;

    expect(state.files).toContainEqual(updatedFile);
    expect(state.error).toBeNull();
  });

  test('deleteFile - fulfilled', async () => {
    const existingFile = { id: 1, title: 'File to Delete' };
    store.dispatch({ type: fetchFiles.fulfilled.type, payload: [existingFile] });
    apiClient.delete.mockResolvedValue();

    await store.dispatch(deleteFile(1));
    const state = store.getState().file;

    expect(state.files).not.toContainEqual(existingFile);
    expect(state.error).toBeNull();
  });
});
