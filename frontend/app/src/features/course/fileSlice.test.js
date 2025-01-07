import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import fileReducer, { fetchFiles, batchUpdateFiles } from './fileSlice';
import apiClient from '../../utils/apiClient';

// API 呼び出しをモック
vi.mock('../../utils/apiClient');

describe('fileSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        file: fileReducer,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetchFiles - fulfilled', async () => {
    const mockData = [{ id: 1, title: 'Test File' }];
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    await store.dispatch(fetchFiles(1)); // モジュールIDを1としてテスト
    const state = store.getState().file;

    expect(state.files[1]).toEqual(mockData); // モジュールIDをキーにデータが格納されているか確認
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchFiles - rejected', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('Error fetching files'));

    await store.dispatch(fetchFiles(1));
    const state = store.getState().file;

    expect(state.files[1]).toBeUndefined(); // モジュールIDがキーに設定されていないことを確認
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error fetching files');
  });

  it('batchUpdateFiles - create, update, delete files', async () => {
    const moduleId = 1;

    const filesToCreate = [
      new File(['file1 content'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['file2 content'], 'file2.pdf', { type: 'application/pdf' }),
    ];
    const filesToUpdate = [
      { id: 2, file: new File(['updated file content'], 'updated_file.pdf', { type: 'application/pdf' }) },
    ];
    const filesToDelete = [3];

    const mockResponseData = {
      created: [{ id: 4, title: 'file1.pdf' }, { id: 5, title: 'file2.pdf' }],
      updated: [{ id: 2, title: 'updated_file.pdf' }],
      deleted: filesToDelete,
    };

    const mockUpdatedFiles = [...mockResponseData.created, ...mockResponseData.updated];

    apiClient.post.mockResolvedValueOnce({ data: mockResponseData });
    apiClient.get.mockResolvedValueOnce({ data: mockUpdatedFiles });

    await store.dispatch(
      batchUpdateFiles({
        moduleId,
        filesToCreate,
        filesToUpdate,
        filesToDelete,
      })
    );

    const state = store.getState().file;

    expect(state.files[moduleId]).toEqual(mockUpdatedFiles); // 更新後のファイルが正しく設定されているか確認
    expect(apiClient.get).toHaveBeenCalledWith(`/courses/files/?module=${moduleId}`); // fetchFiles が呼ばれたか確認
    expect(state.error).toBeNull();
  });
});
