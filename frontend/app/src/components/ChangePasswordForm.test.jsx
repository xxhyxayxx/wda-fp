import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChangePasswordForm from './ChangePasswordForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../utils/apiClient';
import { MemoryRouter } from 'react-router-dom';

// Mock NavBar
jest.mock('../components/NavBar', () => () => <div data-testid="mocked-navbar" />);

// Mock apiClient
jest.mock('../utils/apiClient');

// Helper function to render a component with Redux store and MemoryRouter
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      user: () => ({
        userInfo: { name: 'Test User', id: 1 },
      }),
      notifications: () => ({
        notifications: [],
      }),
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

describe('ChangePasswordForm Component', () => {
  test('API client should use the correct base URL', () => {
    const expectedUrl = "http://127.0.0.1:8000";
    expect(apiClient.defaults.baseURL.replace(/\/$/, '')).toBe(expectedUrl.replace(/\/$/, ''));
  });

  test('renders the form fields', () => {
    renderWithProvider(<ChangePasswordForm />);

    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();

    const newPasswordFields = screen.getAllByLabelText(/New Password/i);
    expect(newPasswordFields[0]).toBeInTheDocument();
    expect(newPasswordFields[1]).toBeInTheDocument();

    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
  });

  test('handles successful password change', async () => {
    apiClient.put.mockResolvedValueOnce({});

    renderWithProvider(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldPass' } });
    const newPasswordFields = screen.getAllByLabelText(/New Password/i);
    fireEvent.change(newPasswordFields[0], { target: { value: 'newPass' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newPass' } });

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

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

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

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

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(mockErrorMessage);
    });
  });
});
