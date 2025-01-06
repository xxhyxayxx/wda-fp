import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import ProfileUpdateForm from './ProfileUpdateForm';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../utils/apiClient';

// Mocking apiClient
vi.mock('../utils/apiClient');

// Mocking URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'http://example.com/preview_image.png');

// Reduxストアとラップする関数
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: { user: userReducer },
  });

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>{component}</MemoryRouter>
      </Provider>
    ),
    store,
  };
};

describe('ProfileUpdateForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with fetched user data', async () => {
    const mockUserData = {
      name: 'Test User',
      email: 'test@example.com',
      profile_image: 'http://example.com/test_image.png',
    };

    // APIクライアントのモック設定
    apiClient.get.mockResolvedValueOnce({ data: mockUserData });

    const { store } = renderWithProvider(<ProfileUpdateForm />);

    // Reduxストアの状態を確認
    await waitFor(() => {
      const state = store.getState().user;
      expect(state.userInfo.name).toBe(mockUserData.name);
      expect(state.userInfo.email).toBe(mockUserData.email);
      expect(state.userInfo.profile_image).toBe(mockUserData.profile_image);
    });

    // フォームフィールドに値が正しく設定されているか確認
    expect(screen.getByLabelText(/Name/i)).toHaveValue(mockUserData.name);
    expect(screen.getByLabelText(/Email/i)).toHaveValue(mockUserData.email);
  });

  it('updates status to succeeded after profile update', async () => {
    const mockUpdatedUserData = {
      name: 'Updated User',
      email: 'updated@example.com',
      profile_image: 'http://example.com/updated_image.png',
    };

    // APIクライアントのモック設定
    apiClient.patch.mockResolvedValueOnce({ data: mockUpdatedUserData });

    const { store } = renderWithProvider(<ProfileUpdateForm />);

    // Reduxストアが読み込み中の状態になることを確認
    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });

    // フォーム入力をシミュレート
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: mockUpdatedUserData.name } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: mockUpdatedUserData.email } });

    // アップデートボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    // Reduxストアの状態を確認
    await waitFor(() => {
      const state = store.getState().user;
      expect(state.status).toBe('succeeded');
      expect(state.userInfo.name).toBe(mockUpdatedUserData.name);
      expect(state.userInfo.email).toBe(mockUpdatedUserData.email);
      expect(state.userInfo.profile_image).toBe(mockUpdatedUserData.profile_image);
    });

    // 成功メッセージが表示されることを確認
    expect(screen.getByTestId('success-message')).toHaveTextContent('Profile updated successfully');
  });
});
