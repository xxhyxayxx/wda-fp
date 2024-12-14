import { configureStore } from '@reduxjs/toolkit';
import enrollmentReducer, { enrollInCourse, fetchEnrollments, fetchCourseStudents, toggleBlockStudent } from './enrollmentSlice';
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

    await store.dispatch(enrollInCourse(1));
    const state = store.getState().enrollment;

    expect(state.enrollments).toContainEqual(mockEnrollment);
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
  });

  test('should handle enrollment failure', async () => {
    const mockError = 'Failed to enroll';
    apiClient.post.mockRejectedValueOnce(new Error(mockError));

    await store.dispatch(enrollInCourse(1));
    const state = store.getState().enrollment;

    expect(state.enrollments).toHaveLength(0);
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

    expect(state.enrollments).toHaveLength(0);
    expect(state.error).toBe(mockError);
    expect(state.loading).toBe(false);
  });

  test('should fetch course students successfully', async () => {
    const mockStudents = [
      { id: 1, name: 'Student One', email: 'student1@example.com', profile_image: null },
      { id: 2, name: 'Student Two', email: 'student2@example.com', profile_image: 'http://example.com/image.jpg' },
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockStudents });

    await store.dispatch(fetchCourseStudents(1));
    const state = store.getState().enrollment;

    expect(state.courseStudents).toEqual(mockStudents);
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
  });

  test('should handle fetch course students failure', async () => {
    const mockError = 'Failed to fetch course students';
    apiClient.get.mockRejectedValueOnce(new Error(mockError));

    await store.dispatch(fetchCourseStudents(1));
    const state = store.getState().enrollment;

    expect(state.courseStudents).toHaveLength(0);
    expect(state.error).toBe(mockError);
    expect(state.loading).toBe(false);
  });

  test('should toggle student block status successfully', async () => {
    // 初期状態のモックデータ
    const initialStudents = [
      { id: 1, name: 'Student One', status: 'ENROLLED', block_reason: null },
      { id: 2, name: 'Student Two', status: 'ENROLLED', block_reason: null },
    ];
    store = configureStore({
      reducer: {
        enrollment: enrollmentReducer,
      },
      preloadedState: {
        enrollment: {
          enrollments: [],
          courseStudents: initialStudents, // 初期状態に学生データを設定
          loading: false,
          error: null,
        },
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
  
    const mockResponse = { id: 1, name: 'Student One', status: 'BLOCKED', block_reason: 'Violation' };
    apiClient.post.mockResolvedValueOnce({ data: mockResponse });
  
    const result = await store.dispatch(toggleBlockStudent({ courseId: 1, studentId: 1, reason: 'Violation' }));
  
    expect(result.payload).toEqual(mockResponse);
  
    const state = store.getState().enrollment;
    const updatedStudent = state.courseStudents.find((student) => student.id === mockResponse.id);
    expect(updatedStudent.status).toBe('BLOCKED'); // ブロック状態の確認
    expect(updatedStudent.block_reason).toBe('Violation'); // ブロック理由の確認
  });  
});
