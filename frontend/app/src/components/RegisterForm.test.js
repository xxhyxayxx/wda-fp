import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // 追加: Jest DOMのマッチャーをインポート
import RegisterForm from './RegisterForm';

describe('RegisterForm', () => {
  test('renders RegisterForm with correct fields', () => {
    render(<RegisterForm />);
    
    // フォームの項目（ユーザー名、メールアドレス、パスワード）の存在を確認
    expect(screen.getByLabelText(/ユーザー名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
  });
});
