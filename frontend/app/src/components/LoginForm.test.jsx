import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import { fireEvent } from '@testing-library/react';

describe('LoginForm', () => {
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

  it('renders the login button', () => {
    renderWithProvider(<LoginForm />);
    const loginButton = screen.getByRole('button', { name: /ログイン/i });
    expect(loginButton).toBeInTheDocument();
  });
});

describe('LoginForm', () => {
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
  
    it('renders the login button', () => {
      renderWithProvider(<LoginForm />);
      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      expect(loginButton).toBeInTheDocument();
    });
  
    it('renders email and password input fields', () => {
      renderWithProvider(<LoginForm />);
      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });
});
  
describe('LoginForm', () => {
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
  
    it('renders the login button', () => {
      renderWithProvider(<LoginForm />);
      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      expect(loginButton).toBeInTheDocument();
    });
  
    it('renders email and password input fields', () => {
      renderWithProvider(<LoginForm />);
      const emailInput = screen.getByLabelText(/メールアドレス/i);
      const passwordInput = screen.getByLabelText(/パスワード/i);
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });
  
    it('shows error messages when email or password is empty', async () => {
      renderWithProvider(<LoginForm />);
      const loginButton = screen.getByRole('button', { name: /ログイン/i });
  
      // メールアドレスとパスワードを空にしてログインボタンをクリック
      fireEvent.click(loginButton);
  
      // エラーメッセージが表示されることを確認
      expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument();
      expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
    });
});
  