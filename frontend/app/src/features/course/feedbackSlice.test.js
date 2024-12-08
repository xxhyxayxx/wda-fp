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
    // Mock successful response
    const mockFeedback = [
      { id: 1, comment: 'Great course!', rating: 5 },
      { id: 2, comment: 'Very informative.', rating: 4 },
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockFeedback });

    // Dispatch fetchFeedback action
    await store.dispatch(fetchFeedback());

    // Check state
    const state = store.getState().feedback;
    expect(state.feedbacks).toEqual(mockFeedback);
    expect(state.error).toBeNull();
  });

  test('should handle fetch feedback failure', async () => {
    // Mock failed response
    const mockError = 'Failed to fetch feedback';
    apiClient.get.mockRejectedValueOnce(new Error(mockError));

    // Dispatch fetchFeedback action
    await store.dispatch(fetchFeedback());

    // Check state
    const state = store.getState().feedback;
    expect(state.error).toBe(mockError);
  });

  test('should create feedback successfully', async () => {
    // Mock successful response
    const newFeedback = { id: 3, comment: 'Excellent course!', rating: 5 };
    apiClient.post.mockResolvedValueOnce({ data: newFeedback });

    // Dispatch createFeedback action
    await store.dispatch(createFeedback(newFeedback));

    // Check state
    const state = store.getState().feedback;
    expect(state.feedbacks).toContainEqual(newFeedback);
    expect(state.error).toBeNull();
  });

  test('should handle create feedback failure', async () => {
    // Mock failed response
    const mockError = 'Failed to create feedback';
    apiClient.post.mockRejectedValueOnce(new Error(mockError));

    // Dispatch createFeedback action
    await store.dispatch(createFeedback({ comment: 'Needs improvement.', rating: 3 }));

    // Check state
    const state = store.getState().feedback;
    expect(state.error).toBe(mockError);
  });
});
