import { configureStore } from '@reduxjs/toolkit';
import enrollmentReducer, { enrollInCourse, fetchEnrollments } from './enrollmentSlice';
import apiClient from '../../utils/apiClient';

// Mock API calls
jest.mock('../../utils/apiClient');

let store;

beforeEach(() => {
  store = configureStore({
    reducer: {
      enrollment: enrollmentReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });
});

describe('enrollmentSlice', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should enroll in a course successfully', async () => {
    const mockEnrollment = { id: 1, course: 1, student: 1, status: 'ENROLLED' };
    apiClient.post.mockResolvedValueOnce({ data: mockEnrollment });

    await store.dispatch(enrollInCourse(1)); // コースID: 1
    const state = store.getState().enrollment;

    expect(state.enrollments).toContainEqual(mockEnrollment);
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
  });

  test('should handle enrollment failure', async () => {
    const mockError = 'Failed to enroll';
    apiClient.post.mockRejectedValueOnce(new Error(mockError));

    await store.dispatch(enrollInCourse(1)); // コースID: 1
    const state = store.getState().enrollment;

    expect(state.enrollments).toHaveLength(0); // 登録なし
    expect(state.error).toBe(mockError);
    expect(state.loading).toBe(false);
  });

  test('should fetch enrollments successfully', async () => {
    const mockEnrollments = [
      { id: 1, course: 1, student: 1, status: 'ENROLLED' },
      { id: 2, course: 2, student: 1, status: 'ENROLLED' },
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockEnrollments });

    await store.dispatch(fetchEnrollments());
    const state = store.getState().enrollment;

    expect(state.enrollments).toEqual(mockEnrollments);
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
  });

  test('should handle fetch enrollments failure', async () => {
    const mockError = 'Failed to fetch enrollments';
    apiClient.get.mockRejectedValueOnce(new Error(mockError));

    await store.dispatch(fetchEnrollments());
    const state = store.getState().enrollment;

    expect(state.enrollments).toHaveLength(0); // 登録データなし
    expect(state.error).toBe(mockError);
    expect(state.loading).toBe(false);
  });
});
