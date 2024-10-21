import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../utils/apiClient';

// apiClient のモック
jest.mock('../utils/apiClient');

// useNavigate のモック
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('RegisterForm Component', () => {
  test('renders the form fields', () => {
    renderWithProvider(<RegisterForm />);

    // 各フォームの要素が存在するか確認
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ユーザータイプ/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登録/i })).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    // 成功レスポンスをモック (登録とログインの両方)
    apiClient.post.mockImplementation((url) => {
      if (url.includes('/register')) {
        return Promise.resolve({
          data: { email: 'test@example.com', name: 'Test User' },
        });
      }
      if (url.includes('/login')) {
        return Promise.resolve({
          data: { token: 'sampleToken' },
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  
    renderWithProvider(<RegisterForm />);
  
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const userTypeSelect = screen.getByLabelText(/ユーザータイプ/i);
    const registerButton = screen.getByRole('button', { name: /登録/i });
  
    // 入力フィールドにデータを入力
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(userTypeSelect, { target: { value: 'teacher' } });
  
    // 登録ボタンをクリック
    fireEvent.click(registerButton);
  
    // navigate('/')が呼び出されることを確認する
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });  

  test('displays error messages on failed registration', async () => {
    // モックAPIレスポンスでエラーを返すように設定
    apiClient.post.mockRejectedValueOnce({
      response: { data: { email: ['エラーが発生しました'] } },
    });

    renderWithProvider(<RegisterForm />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const registerButton = screen.getByRole('button', { name: /登録/i });

    // 入力フィールドにデータを入力
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 登録ボタンをクリック
    fireEvent.click(registerButton);

    // エラーメッセージが表示されていることを確認
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('登録に失敗しました');
    });
  });
});
