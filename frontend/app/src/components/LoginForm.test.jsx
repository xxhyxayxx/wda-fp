import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import apiClient from '../utils/apiClient';
import { BrowserRouter } from 'react-router-dom';

// Mock apiClient
jest.mock('../utils/apiClient');

// Function to render a component with Redux store
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginForm Component', () => {
  test('renders the form fields', () => {
    renderWithProvider(<LoginForm />);

    // Check that form elements are present
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    // Mock successful response
    apiClient.post.mockResolvedValueOnce({
      data: { token: 'mockToken', email: 'test@example.com', name: 'Test User' },
    });

    renderWithProvider(<LoginForm />);

    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Input data into fields
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Click login button
    fireEvent.click(loginButton);

    // Verify navigation to home page (check if redirect was called)
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/login/', {
        username: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('displays error messages on failed login', async () => {
    // Mock API response to return an error
    apiClient.post.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid credentials' } },
    });

    renderWithProvider(<LoginForm />);

    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Input data into fields
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Click login button
    fireEvent.click(loginButton);

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Login failed');
    });
  });

  test('shows error messages when email or password is empty', async () => {
    renderWithProvider(<LoginForm />);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Click login button with empty fields
    fireEvent.click(loginButton);

    // Check that error messages are displayed
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
