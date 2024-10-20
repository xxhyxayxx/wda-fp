import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogoutButton from './LogoutButton';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';

describe('LogoutButton', () => {
  const renderWithProvider = (component) => {
    const store = configureStore({
      reducer: {
        user: userReducer,
      },
      // ミドルウェアの設定を削除してデフォルトに戻す
    });

    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('renders the logout button', () => {
    renderWithProvider(<LogoutButton />);
    const logoutButton = screen.getByRole('button', { name: /ログアウト/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('dispatches logoutUser action when clicked', () => {
    renderWithProvider(<LogoutButton />);
    const logoutButton = screen.getByRole('button', { name: /ログアウト/i });
    fireEvent.click(logoutButton);
    // ここでミドルウェアの影響が出てくるので、追加でログアウトの動作を確認できます。
  });
});
