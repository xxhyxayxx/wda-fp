import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import messageReducer, {
  fetchMessages,
  sendMessage,
  markMessageAsRead,
  fetchConversations,
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

  // fetchConversations のテスト
  it('fetchConversations - fulfilled', async () => {
    const mockConversations = [
      {
        other_user: { id: 2, name: 'User 2', profile_image: null },
        last_message: { id: 1, content: 'Hello', timestamp: '2025-01-10T00:00:00Z', is_read: false },
      },
      {
        other_user: { id: 3, name: 'User 3', profile_image: '/media/user3.png' },
        last_message: { id: 2, content: 'Hi there', timestamp: '2025-01-10T01:00:00Z', is_read: true },
      },
    ];
    apiClient.get.mockResolvedValue({ data: mockConversations });

    await store.dispatch(fetchConversations());
    const state = store.getState().messages;

    expect(apiClient.get).toHaveBeenCalledWith('/accounts/conversations/');
    expect(state.conversations).toEqual(mockConversations);
    expect(state.status).toBe('succeeded');
    expect(state.error).toBeNull();
  });

  it('fetchConversations - rejected', async () => {
    apiClient.get.mockRejectedValue(new Error('Failed to fetch conversations'));

    await store.dispatch(fetchConversations());
    const state = store.getState().messages;

    expect(apiClient.get).toHaveBeenCalledWith('/accounts/conversations/');
    expect(state.conversations).toEqual([]);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Failed to fetch conversations');
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
    apiClient.post.mockRejectedValue({ response: null }); // エラーオブジェクトの構造を確認

    await store.dispatch(sendMessage({ receiver: 2, content: 'New message' }));
    const state = store.getState().messages;

    expect(apiClient.post).toHaveBeenCalledWith('/accounts/messages/send/', {
        receiver: 2,
        content: 'New message',
    });
    expect(state.messages).toEqual([]);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Failed to send message'); // このメッセージが設定されることを確認
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
          conversations: [],
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
    expect(state.conversations).toEqual([]);
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });
});
