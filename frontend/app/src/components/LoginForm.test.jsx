import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import apiClient from '../utils/apiClient';

// apiClient のモック
jest.mock('../utils/apiClient');

// Redux ストアを含んだコンポーネントをレンダリングするための関数
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });

  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('LoginForm Component', () => {
  test('renders the form fields', () => {
    renderWithProvider(<LoginForm />);

    // 各フォームの要素が存在するか確認
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    // 成功レスポンスをモック
    apiClient.post.mockResolvedValueOnce({
      data: { token: 'mockToken', email: 'test@example.com', name: 'Test User' },
    });

    renderWithProvider(<LoginForm />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const loginButton = screen.getByRole('button', { name: /ログイン/i });

    // 入力フィールドにデータを入力
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // ログインボタンをクリック
    fireEvent.click(loginButton);

    // 成功メッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('ログインに成功しました！');
    });
  });

  test('displays error messages on failed login', async () => {
    // モックAPIレスポンスでエラーを返すように設定
    apiClient.post.mockRejectedValueOnce({
      response: { data: { detail: '無効な認証情報です' } },
    });

    renderWithProvider(<LoginForm />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const loginButton = screen.getByRole('button', { name: /ログイン/i });

    // 入力フィールドにデータを入力
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // ログインボタンをクリック
    fireEvent.click(loginButton);

    // エラーメッセージが表示されていることを確認
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('ログインに失敗しました');
    });
  });

  test('shows error messages when email or password is empty', async () => {
    renderWithProvider(<LoginForm />);
    const loginButton = screen.getByRole('button', { name: /ログイン/i });

    // メールアドレスとパスワードを空にしてログインボタンをクリック
    fireEvent.click(loginButton);

    // エラーメッセージが表示されることを確認
    expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument();
    expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
  });
});
