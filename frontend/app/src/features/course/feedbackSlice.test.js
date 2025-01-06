import { configureStore } from '@reduxjs/toolkit';
import feedbackReducer, { fetchFeedback, createFeedback } from './feedbackSlice';
import apiClient from '../../utils/apiClient';

// Mocking apiClient
jest.mock('../../utils/apiClient');

let store;

beforeEach(() => {
  store = configureStore({
    reducer: {
      feedback: feedbackReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });
});

describe('feedbackSlice', () => {
  test('should fetch feedback successfully', async () => {
    const mockFeedback = [
      { id: 1, comment: 'Great course!', rating: 5 },
      { id: 2, comment: 'Very informative.', rating: 4 },
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockFeedback });

    await store.dispatch(fetchFeedback());

    const state = store.getState().feedback;
    expect(state.feedbacks).toEqual(mockFeedback);
    expect(state.error).toBeNull();
  });

  test('should handle fetch feedback failure', async () => {
    const mockError = 'Failed to fetch feedback';
    apiClient.get.mockRejectedValueOnce(new Error(mockError));

    await store.dispatch(fetchFeedback());

    const state = store.getState().feedback;
    expect(state.error).toBe(mockError);
  });

  test('should create feedback successfully', async () => {
    const newFeedback = { id: 3, comment: 'Excellent course!', rating: 5, enrollment_id: 1 };
    const enrollmentId = 1;

    apiClient.post.mockResolvedValueOnce({ data: newFeedback });

    await store.dispatch(
      createFeedback({ enrollment_id: enrollmentId, comment: 'Excellent course!', rating: 5 })
    );

    const state = store.getState().feedback;
    expect(state.feedbacks).toContainEqual(newFeedback);
    expect(state.error).toBeNull();

    expect(apiClient.post).toHaveBeenCalledWith(
      `/courses/feedback/create/${enrollmentId}/`,
      { enrollment_id: enrollmentId, comment: 'Excellent course!', rating: 5 }
    );
  });

  test('should handle create feedback failure', async () => {
    const mockError = 'Failed to create feedback';
    const enrollmentId = 1;

    apiClient.post.mockRejectedValueOnce(new Error(mockError));

    await store.dispatch(
      createFeedback({ enrollment_id: enrollmentId, comment: 'Needs improvement.', rating: 3 })
    );

    const state = store.getState().feedback;
    expect(state.error).toBe(mockError);

    expect(apiClient.post).toHaveBeenCalledWith(
      `/courses/feedback/create/${enrollmentId}/`,
      { enrollment_id: enrollmentId, comment: 'Needs improvement.', rating: 3 }
    );
  });
});
