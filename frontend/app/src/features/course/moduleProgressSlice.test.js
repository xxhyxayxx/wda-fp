import { configureStore } from '@reduxjs/toolkit';
import moduleProgressReducer, { completeProgress } from './moduleProgressSlice';
import apiClient from '../../utils/apiClient';

jest.mock('../../utils/apiClient');

describe('moduleProgressSlice', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                moduleProgress: moduleProgressReducer,
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('completeProgress - fulfilled', async () => {
        const moduleId = 1;
        const mockProgress = { progress: 100, completed: true };
        apiClient.post.mockResolvedValueOnce({ data: mockProgress });

        // アクションをディスパッチ
        await store.dispatch(completeProgress(moduleId));
        const state = store.getState().moduleProgress;

        // ステートを確認
        expect(state.progress[moduleId]).toEqual(mockProgress); // モジュール ID ごとの進捗データ
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(apiClient.post).toHaveBeenCalledWith(`/modules/${moduleId}/complete/`);
    });

    test('completeProgress - rejected', async () => {
        const moduleId = 1;
        const errorMessage = 'Error completing progress';
        apiClient.post.mockRejectedValueOnce(new Error(errorMessage));

        // アクションをディスパッチ
        await store.dispatch(completeProgress(moduleId));
        const state = store.getState().moduleProgress;

        // ステートを確認
        expect(state.progress[moduleId]).toBeUndefined(); // データが更新されていないことを確認
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(apiClient.post).toHaveBeenCalledWith(`/modules/${moduleId}/complete/`);
    });
});
