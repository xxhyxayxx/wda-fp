import { configureStore } from '@reduxjs/toolkit';
import courseReducer, { fetchCourses, createCourse, updateCourse, deleteCourse } from './courseSlice';
import apiClient from '../../utils/apiClient';

// Mocking apiClient
jest.mock('../../utils/apiClient');

let store;

beforeEach(() => {
  store = configureStore({
    reducer: {
      course: courseReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });
});

describe('courseSlice', () => {
  test('should fetch courses successfully', async () => {
    // Mock successful response
    const mockCourses = [
      { id: 1, title: 'Course 1' },
      { id: 2, title: 'Course 2' },
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockCourses });

    // Dispatch fetchCourses action
    await store.dispatch(fetchCourses());

    // Check state
    const state = store.getState().course;
    expect(state.courses).toEqual(mockCourses);
    expect(state.error).toBeNull();
  });

  test('should handle fetch courses failure', async () => {
    // Mock failed response
    const mockError = 'Failed to fetch courses';
    apiClient.get.mockRejectedValueOnce(new Error(mockError));

    // Dispatch fetchCourses action
    await store.dispatch(fetchCourses());

    // Check state
    const state = store.getState().course;
    expect(state.error).toBe(mockError);
  });

  test('should create a course successfully', async () => {
    // Mock successful response
    const newCourse = { id: 3, title: 'New Course' };
    apiClient.post.mockResolvedValueOnce({ data: newCourse });

    // Dispatch createCourse action
    await store.dispatch(createCourse(newCourse));

    // Check state
    const state = store.getState().course;
    expect(state.courses).toContainEqual(newCourse);
    expect(state.error).toBeNull();
  });

  test('should handle create course failure', async () => {
    // Mock failed response
    const mockError = 'Failed to create course';
    apiClient.post.mockRejectedValueOnce(new Error(mockError));

    // Dispatch createCourse action
    await store.dispatch(createCourse({ title: 'New Course' }));

    // Check state
    const state = store.getState().course;
    expect(state.error).toBe(mockError);
  });

  test('should update a course successfully', async () => {
    // Initial state
    const initialState = [{ id: 1, title: 'Old Course' }];
    store = configureStore({
      reducer: {
        course: courseReducer,
      },
      preloadedState: {
        course: { courses: initialState, loading: false, error: null },
      },
    });

    // Mock successful response
    const updatedCourse = { id: 1, title: 'Updated Course' };
    apiClient.put.mockResolvedValueOnce({ data: updatedCourse });

    // Dispatch updateCourse action
    await store.dispatch(updateCourse({ id: 1, courseData: updatedCourse }));

    // Check state
    const state = store.getState().course;
    expect(state.courses[0].title).toBe('Updated Course');
    expect(state.error).toBeNull();
  });

  test('should handle update course failure', async () => {
    // Mock failed response
    const mockError = 'Failed to update course';
    apiClient.put.mockRejectedValueOnce(new Error(mockError));

    // Dispatch updateCourse action
    await store.dispatch(updateCourse({ id: 1, courseData: { title: 'Updated Course' } }));

    // Check state
    const state = store.getState().course;
    expect(state.error).toBe(mockError);
  });

  test('should delete a course successfully', async () => {
    // Initial state
    const initialState = [{ id: 1, title: 'Course to Delete' }];
    store = configureStore({
      reducer: {
        course: courseReducer,
      },
      preloadedState: {
        course: { courses: initialState, loading: false, error: null },
      },
    });

    // Mock successful response
    apiClient.delete.mockResolvedValueOnce();

    // Dispatch deleteCourse action
    await store.dispatch(deleteCourse(1));

    // Check state
    const state = store.getState().course;
    expect(state.courses).toHaveLength(0);
    expect(state.error).toBeNull();
  });

  test('should handle delete course failure', async () => {
    // Mock failed response
    const mockError = 'Failed to delete course';
    apiClient.delete.mockRejectedValueOnce(new Error(mockError));

    // Dispatch deleteCourse action
    await store.dispatch(deleteCourse(1));

    // Check state
    const state = store.getState().course;
    expect(state.error).toBe(mockError);
  });
});
