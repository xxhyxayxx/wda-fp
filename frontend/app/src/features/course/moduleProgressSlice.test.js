import { configureStore } from '@reduxjs/toolkit';
import moduleProgressReducer, { completeProgress, fetchCourseProgress } from './moduleProgressSlice';
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

    // completeProgress テストケース
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
        expect(apiClient.post).toHaveBeenCalledWith(`courses/modules/${moduleId}/complete/`); // 修正済み URL
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
        expect(apiClient.post).toHaveBeenCalledWith(`courses/modules/${moduleId}/complete/`); // 修正済み URL
    });

    // fetchCourseProgress テストケース
    test('fetchCourseProgress - fulfilled', async () => {
        const courseId = 1;
        const mockCourseProgress = { progress: 75, completedModules: 3 };
        apiClient.get.mockResolvedValueOnce({ data: mockCourseProgress });

        // アクションをディスパッチ
        await store.dispatch(fetchCourseProgress(courseId));
        const state = store.getState().moduleProgress;

        // ステートを確認
        expect(state.courseProgress[courseId]).toEqual(mockCourseProgress); // コース ID ごとの進捗データ
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(apiClient.get).toHaveBeenCalledWith(`courses/courses/${courseId}/progress/`);
    });

    test('fetchCourseProgress - rejected', async () => {
        const courseId = 1;
        const errorMessage = 'Error fetching course progress';
        apiClient.get.mockRejectedValueOnce(new Error(errorMessage));

        // アクションをディスパッチ
        await store.dispatch(fetchCourseProgress(courseId));
        const state = store.getState().moduleProgress;

        // ステートを確認
        expect(state.courseProgress[courseId]).toBeUndefined(); // データが更新されていないことを確認
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(apiClient.get).toHaveBeenCalledWith(`courses/courses/${courseId}/progress/`);
    });
});
