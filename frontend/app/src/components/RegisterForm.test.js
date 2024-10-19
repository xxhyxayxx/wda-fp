import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';

describe('RegisterForm validation', () => {
  test('displays validation messages when fields are empty', async () => {
    renderWithProvider(<RegisterForm />);

    // 登録ボタンをクリック
    const registerButton = screen.getByRole('button', { name: /登録/i });
    fireEvent.click(registerButton);

    // 各フィールドに対するバリデーションメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/メールアドレスは必須です/i)).toBeInTheDocument();
      expect(screen.getByText(/パスワードは必須です/i)).toBeInTheDocument();
    });
  });
});

const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
  });

  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('RegisterForm input handling', () => {
  test('updates email and password fields correctly', () => {
    renderWithProvider(<RegisterForm />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);

    // Emailフィールドの変更
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');

    // Passwordフィールドの変更
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });
});