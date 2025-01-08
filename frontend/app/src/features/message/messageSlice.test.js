import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import messageReducer, {
  fetchMessages,
  sendMessage,
  markMessageAsRead,
  resetMessages,
} from './messageSlice';
import apiClient from '../../utils/apiClient';

// API 呼び出しをモック
vi.mock('../../utils/apiClient');

describe('messageSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        messages: messageReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false, // 非シリアライズ可能な値を許可
        }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetchMessages - fulfilled', async () => {
    const mockMessages = [
      { id: 1, content: 'Hello', sender: 1, receiver: 2, is_read: false },
      { id: 2, content: 'Hi', sender: 2, receiver: 1, is_read: true },
    ];
    apiClient.get.mockResolvedValue({ data: mockMessages });

    await store.dispatch(fetchMessages(2));
    const state = store.getState().messages;

    expect(apiClient.get).toHaveBeenCalledWith('/accounts/messages/?receiver=2');
    expect(state.messages).toEqual(mockMessages);
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });

  it('fetchMessages - rejected', async () => {
    apiClient.get.mockRejectedValue(new Error('Failed to fetch messages'));

    await store.dispatch(fetchMessages(2));
    const state = store.getState().messages;

    expect(apiClient.get).toHaveBeenCalledWith('/accounts/messages/?receiver=2');
    expect(state.messages).toEqual([]);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Failed to fetch messages');
  });

  it('sendMessage - fulfilled', async () => {
    const newMessage = { id: 3, content: 'New message', sender: 1, receiver: 2, is_read: false };
    apiClient.post.mockResolvedValue({ data: newMessage });

    await store.dispatch(sendMessage({ receiver: 2, content: 'New message' }));
    const state = store.getState().messages;

    expect(apiClient.post).toHaveBeenCalledWith('/accounts/messages/send/', {
      receiver: 2,
      content: 'New message',
    });
    expect(state.messages).toContainEqual(newMessage);
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });

  it('sendMessage - rejected', async () => {
    apiClient.post.mockRejectedValue(new Error('Failed to send message'));

    await store.dispatch(sendMessage({ receiver: 2, content: 'New message' }));
    const state = store.getState().messages;

    expect(apiClient.post).toHaveBeenCalledWith('/accounts/messages/send/', {
      receiver: 2,
      content: 'New message',
    });
    expect(state.messages).toEqual([]);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Failed to send message');
  });

  it('markMessageAsRead - fulfilled', async () => {
    const mockMessages = [
      { id: 1, content: 'Hello', sender: 1, receiver: 2, is_read: false },
    ];
    apiClient.post.mockResolvedValue({ data: {} });

    store = configureStore({
      reducer: {
        messages: messageReducer,
      },
      preloadedState: {
        messages: {
          messages: mockMessages,
          status: 'idle',
          error: null,
        },
      },
    });

    await store.dispatch(markMessageAsRead(1));
    const state = store.getState().messages;

    expect(apiClient.post).toHaveBeenCalledWith('/accounts/messages/1/mark-as-read/');
    expect(state.messages[0].is_read).toBe(true);
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });

  it('markMessageAsRead - rejected', async () => {
    apiClient.post.mockRejectedValue(new Error('Failed to mark message as read'));

    await store.dispatch(markMessageAsRead(1));
    const state = store.getState().messages;

    expect(apiClient.post).toHaveBeenCalledWith('/accounts/messages/1/mark-as-read/');
    expect(state.messages).toEqual([]);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Failed to mark message as read');
  });

  it('resetMessages - resets the state', () => {
    store.dispatch(resetMessages());
    const state = store.getState().messages;

    expect(state.messages).toEqual([]);
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });
});
