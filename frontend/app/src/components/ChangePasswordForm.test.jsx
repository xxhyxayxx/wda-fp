import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChangePasswordForm from './ChangePasswordForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import apiClient from '../utils/apiClient';

// Mock apiClient
jest.mock('../utils/apiClient');

// Helper function to render a component with Redux store
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

describe('ChangePasswordForm Component', () => {
  test('renders the form fields', () => {
    renderWithProvider(<ChangePasswordForm />);

    // Check that form elements are present
    expect(screen.getByLabelText(/現在のパスワード/i)).toBeInTheDocument();
    // 修正箇所: getAllByLabelTextを使用
    const newPasswordFields = screen.getAllByLabelText(/新しいパスワード/i);
    expect(newPasswordFields).toHaveLength(2);
    expect(screen.getByLabelText(/新しいパスワード（確認用）/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /パスワードを変更する/i })).toBeInTheDocument();
  });

  test('handles successful password change', async () => {
    // Mock successful response
    apiClient.put.mockResolvedValueOnce({});

    renderWithProvider(<ChangePasswordForm />);

    // 修正箇所: getAllByLabelTextを使用
    fireEvent.change(screen.getByLabelText(/現在のパスワード/i), { target: { value: 'oldPass' } });
    const newPasswordFields = screen.getAllByLabelText(/新しいパスワード/i);
    fireEvent.change(newPasswordFields[0], { target: { value: 'newPass' } });
    fireEvent.change(screen.getByLabelText(/新しいパスワード（確認用）/i), { target: { value: 'newPass' } });

    // Click change password button
    fireEvent.click(screen.getByRole('button', { name: /パスワードを変更する/i }));

    // Wait for the API call
    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith('/change-password/', {
        current_password: 'oldPass',
        new_password: 'newPass',
      });
    });
  });

  test('displays error messages when passwords do not match', async () => {
    renderWithProvider(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/現在のパスワード/i), { target: { value: 'oldPass' } });
    const newPasswordFields = screen.getAllByLabelText(/新しいパスワード/i);
    fireEvent.change(newPasswordFields[0], { target: { value: 'newPass' } });
    fireEvent.change(screen.getByLabelText(/新しいパスワード（確認用）/i), { target: { value: 'wrongPass' } });

    // Click change password button
    fireEvent.click(screen.getByRole('button', { name: /パスワードを変更する/i }));

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('新しいパスワードと確認用パスワードが一致しません')).toBeInTheDocument();
    });
  });

  test('handles failed password change', async () => {
    const mockErrorMessage = 'パスワードの変更に失敗しました';
    apiClient.put.mockRejectedValueOnce(new Error(mockErrorMessage));

    renderWithProvider(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/現在のパスワード/i), { target: { value: 'oldPass' } });
    const newPasswordFields = screen.getAllByLabelText(/新しいパスワード/i);
    fireEvent.change(newPasswordFields[0], { target: { value: 'newPass' } });
    fireEvent.change(screen.getByLabelText(/新しいパスワード（確認用）/i), { target: { value: 'newPass' } });

    // Click change password button
    fireEvent.click(screen.getByRole('button', { name: /パスワードを変更する/i }));

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(mockErrorMessage)).toBeInTheDocument();
    });
  });
});
