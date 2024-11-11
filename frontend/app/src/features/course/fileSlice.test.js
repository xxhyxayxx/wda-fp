import { configureStore } from '@reduxjs/toolkit';
import fileReducer, {
    fetchFiles,
    batchUpdateFiles,
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

    test('batchUpdateFiles - create, update, delete files', async () => {
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

        apiClient.post.mockResolvedValue({ data: mockResponseData });
        apiClient.get.mockResolvedValue({ data: [...mockResponseData.created, ...mockResponseData.updated] });

        await store.dispatch(batchUpdateFiles({
            moduleId,
            filesToCreate,
            filesToUpdate,
            filesToDelete,
        }));

        const state = store.getState().file;
        const expectedFiles = [...mockResponseData.created, ...mockResponseData.updated];

        expect(state.files).toEqual(expectedFiles);  // 一覧取得によるファイル更新を確認
        expect(state.error).toBeNull();
    });
});
