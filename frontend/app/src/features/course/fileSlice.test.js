import { configureStore } from '@reduxjs/toolkit';
import fileReducer, {
    fetchFiles,
    uploadFile,
    updateFile,
    deleteFile,
    deleteMultipleFiles,
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

    test('uploadFile - single file upload', async () => {
        const moduleId = 1;
        const newFile = { id: 2, title: 'New File', module: moduleId };
        const mockFiles = [{ id: 1, title: 'Existing File', module: moduleId }, newFile];
    
        apiClient.post.mockResolvedValue({ data: newFile });
        apiClient.get.mockResolvedValue({ data: mockFiles });
    
        await store.dispatch(uploadFile(newFile));
        const state = store.getState().file;
    
        expect(state.files).toEqual(mockFiles); // 一覧取得によるファイル更新を確認
        expect(state.error).toBeNull();
    });

    test('uploadFile - update existing file', async () => {
        const moduleId = 1;
        const existingFile = { id: 2, title: 'Existing File', module: moduleId };
        const updatedFile = { id: 2, title: 'Updated File', module: moduleId };
        const mockFiles = [{ id: 1, title: 'Another File', module: moduleId }, updatedFile];
        
        store.dispatch({ type: fetchFiles.fulfilled.type, payload: [existingFile] });
        apiClient.post.mockResolvedValue({ data: updatedFile });
        apiClient.get.mockResolvedValue({ data: mockFiles });
        
        await store.dispatch(uploadFile(updatedFile));
        const state = store.getState().file;

        expect(state.files).toEqual(mockFiles); // 更新後のファイルリストを確認
        expect(state.error).toBeNull();
    });

    // 3. 複数ファイルの新規アップロードテスト
    test('uploadFile - multiple new files upload', async () => {
        const moduleId = 1;
        const newFiles = [
            { id: 3, title: 'New File 1', module: moduleId },
            { id: 4, title: 'New File 2', module: moduleId }
        ];
        const mockFiles = [
            { id: 1, title: 'Existing File', module: moduleId },
            ...newFiles
        ];

        apiClient.post.mockResolvedValue({ data: newFiles });
        apiClient.get.mockResolvedValue({ data: mockFiles });

        await store.dispatch(uploadFile(newFiles));
        const state = store.getState().file;

        expect(state.files).toEqual(mockFiles); // 一覧取得によるファイル更新を確認
        expect(state.error).toBeNull();
    });

    test('uploadFile - mixed existing and new files upload', async () => {
        const moduleId = 1;
        const existingFile = { id: 2, title: 'Existing File', module: moduleId };
        const newFile = { id: 3, title: 'New File', module: moduleId };
        const mockFiles = [
            { id: 1, title: 'Another Existing File', module: moduleId },
            existingFile,
            newFile
        ];

        store.dispatch({ type: fetchFiles.fulfilled.type, payload: [existingFile] });
        apiClient.post.mockResolvedValue({ data: [existingFile, newFile] });
        apiClient.get.mockResolvedValue({ data: mockFiles });

        await store.dispatch(uploadFile([existingFile, newFile]));
        const state = store.getState().file;

        expect(state.files).toEqual(mockFiles); // 更新後のファイルリストを確認
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

    // 複数ファイル削除のテスト
    test('deleteMultipleFiles - fulfilled', async () => {
        const filesToDelete = [
            { id: 1, title: 'File 1' },
            { id: 2, title: 'File 2' },
        ];
        store.dispatch({ type: fetchFiles.fulfilled.type, payload: filesToDelete });
        apiClient.delete.mockResolvedValue();

        await store.dispatch(deleteMultipleFiles([1, 2]));
        const state = store.getState().file;

        expect(state.files).toEqual([]);
        expect(state.error).toBeNull();
    });
});
