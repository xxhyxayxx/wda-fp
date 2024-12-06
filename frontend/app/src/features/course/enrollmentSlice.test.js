import { configureStore } from '@reduxjs/toolkit';
import enrollmentReducer, { enrollInCourse, fetchEnrollments, fetchCourseStudents } from './enrollmentSlice';
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

  test('should fetch course students successfully', async () => {
    const mockStudents = [
      { id: 1, name: 'Student One', email: 'student1@example.com', profile_image: null },
      { id: 2, name: 'Student Two', email: 'student2@example.com', profile_image: 'http://example.com/image.jpg' },
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockStudents });

    await store.dispatch(fetchCourseStudents(1)); // コースID: 1
    const state = store.getState().enrollment;

    expect(state.courseStudents).toEqual(mockStudents);
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
  });

  test('should handle fetch course students failure', async () => {
    const mockError = 'Failed to fetch course students';
    apiClient.get.mockRejectedValueOnce(new Error(mockError));

    await store.dispatch(fetchCourseStudents(1)); // コースID: 1
    const state = store.getState().enrollment;

    expect(state.courseStudents).toHaveLength(0); // 学生データなし
    expect(state.error).toBe(mockError);
    expect(state.loading).toBe(false);
  });
});
