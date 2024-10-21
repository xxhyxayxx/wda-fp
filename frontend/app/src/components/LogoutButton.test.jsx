import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogoutButton from './LogoutButton';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import apiClient from '../utils/apiClient';

// apiClientのモック
jest.mock('../utils/apiClient');

describe('LogoutButton', () => {
  const renderWithProvider = (component) => {
    const store = configureStore({
      reducer: {
        user: userReducer,
      },
      preloadedState: {
        user: {
          isLoggedIn: true,
          userInfo: { email: 'test@example.com' },
          status: 'idle',
          error: null,
        },
      },
    });

    return {
      ...render(
        <Provider store={store}>
          {component}
        </Provider>
      ),
      store,
    };
  };

  it('renders the logout button', () => {
    renderWithProvider(<LogoutButton />);
    const logoutButton = screen.getByRole('button', { name: /ログアウト/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('dispatches logoutUser action and handles successful logout', async () => {
    // モックしたAPIレスポンス（成功）
    apiClient.post.mockResolvedValueOnce({});

    const { store } = renderWithProvider(<LogoutButton />);
    const logoutButton = screen.getByRole('button', { name: /ログアウト/i });

    // ログアウトボタンをクリック
    fireEvent.click(logoutButton);

    // ログアウトメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('ログアウトが完了しました！');
    });

    // Redux storeの状態を確認
    const state = store.getState().user;
    expect(state.isLoggedIn).toBe(false);
  });

  it('handles logout failure', async () => {
    // モックしたAPIレスポンス（失敗）
    apiClient.post.mockRejectedValueOnce({
      response: { data: 'ログアウトに失敗しました' },
    });

    const { store } = renderWithProvider(<LogoutButton />);
    const logoutButton = screen.getByRole('button', { name: /ログアウト/i });

    // ログアウトボタンをクリック
    fireEvent.click(logoutButton);

    // ログアウト失敗メッセージが表示されていることを確認
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('ログアウトに失敗しました');
    });

    // Redux storeの状態を確認（失敗したため、ログイン状態のまま）
    const state = store.getState().user;
    expect(state.isLoggedIn).toBe(true);
  });
});
