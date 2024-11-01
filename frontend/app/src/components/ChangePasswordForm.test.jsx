import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChangePasswordForm from './ChangePasswordForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import apiClient from '../utils/apiClient';
import { MemoryRouter } from 'react-router-dom';

// Mock apiClient
jest.mock('../utils/apiClient');

// Helper function to render a component with Redux store and MemoryRouter
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

describe('ChangePasswordForm Component', () => {
  test('renders the form fields', () => {
    renderWithProvider(<ChangePasswordForm />);

    // 正しいフィールドを取得するため、getAllByLabelTextを使用
    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();

    const newPasswordFields = screen.getAllByLabelText(/New Password/i);
    expect(newPasswordFields[0]).toBeInTheDocument();
    expect(newPasswordFields[1]).toBeInTheDocument();

    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
  });

  test('handles successful password change', async () => {
    // Mock successful response
    apiClient.put.mockResolvedValueOnce({});

    renderWithProvider(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldPass' } });
    
    const newPasswordFields = screen.getAllByLabelText(/New Password/i);
    fireEvent.change(newPasswordFields[0], { target: { value: 'newPass' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newPass' } });

    // Click change password button
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    // Wait for the API call
    await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith('/accounts/change-password/', {
            current_password: 'oldPass',
            new_password: 'newPass',
        });
    });
});

  
  test('displays error messages when passwords do not match', async () => {
    renderWithProvider(<ChangePasswordForm />);
  
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldPass' } });
  
    const newPasswordFields = screen.getAllByLabelText(/New Password/i);
    fireEvent.change(newPasswordFields[0], { target: { value: 'newPass' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'wrongPass' } });
  
    // Change password buttonをクリック
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
  
    // エラーメッセージの確認
    expect(await screen.findByText(/New password and confirmation do not match/i)).toBeInTheDocument();
  });
  
  test('handles failed password change', async () => {
    const mockErrorMessage = 'Password change failed';
    apiClient.put.mockRejectedValueOnce(new Error(JSON.stringify({ form: mockErrorMessage })));

    renderWithProvider(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldPass' } });
    
    const newPasswordFields = screen.getAllByLabelText(/New Password/i);
    fireEvent.change(newPasswordFields[0], { target: { value: 'newPass' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newPass' } });

    // Click change password button
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    // Check for error message display
    await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(mockErrorMessage);
    });
});
  
});
