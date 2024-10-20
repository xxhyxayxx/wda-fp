import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';

describe('RegisterForm success message', () => {
  test('displays success message after successful registration', async () => {
    renderWithProvider(<RegisterForm />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const userTypeSelect = screen.getByLabelText(/ユーザータイプ/i);
    const registerButton = screen.getByRole('button', { name: /登録/i });

    // 正しい入力をして登録ボタンをクリック
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(userTypeSelect, { target: { value: 'teacher' } });
    fireEvent.click(registerButton);

    // 成功メッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('登録が完了しました！');
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
