import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';

describe('RegisterForm validation', () => {
  test('displays validation messages when fields are empty', async () => {
    render(<RegisterForm />);

    // 登録ボタンをクリック
    const registerButton = screen.getByRole('button', { name: /登録/i });
    fireEvent.click(registerButton);

    // 各フィールドに対するバリデーションメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/ユーザー名は必須です/i)).toBeInTheDocument();
      expect(screen.getByText(/メールアドレスは必須です/i)).toBeInTheDocument();
      expect(screen.getByText(/パスワードは必須です/i)).toBeInTheDocument();
    });
  });
});
