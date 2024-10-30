import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../utils/apiClient';

// Mocking apiClient
jest.mock('../utils/apiClient');

// Mocking useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Function to render component with Redux store
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('RegisterForm Component', () => {
  test('renders the form fields', () => {
    renderWithProvider(<RegisterForm />);

    // Check that form elements exist
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/User Type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    // Mock successful responses
    apiClient.post.mockImplementation((url) => {
      if (url.includes('/register')) {
        return Promise.resolve({
          data: { email: 'test@example.com', name: 'Test User' },
        });
      }
      if (url.includes('/login')) {
        return Promise.resolve({
          data: { token: 'sampleToken' },
        });
      }
      if (url.includes('/profile')) {
        return Promise.resolve({
          data: { user_type: 'teacher' }, // fetchProfileのレスポンスをモック
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  
    renderWithProvider(<RegisterForm />);
  
    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const userTypeSelect = screen.getByLabelText(/User Type/i);
    const registerButton = screen.getByRole('button', { name: /Register/i });
  
    // 入力フィールドに値を入力
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(userTypeSelect, { target: { value: 'teacher' } });
  
    // 登録ボタンをクリック
    fireEvent.click(registerButton);
  
    // 登録とログインが正常に呼ばれたことを確認
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  test('displays error messages on failed registration', async () => {
    // Set mock API response to return an error
    apiClient.post.mockRejectedValueOnce({
      response: { data: { email: ['Registration failed'] } },
    });

    renderWithProvider(<RegisterForm />);

    const emailInput = screen.getByLabelText(/E-mail/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const registerButton = screen.getByRole('button', { name: /Register/i });

    // Fill in the input fields
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Click the register button
    fireEvent.click(registerButton);

    // Check that the error message is displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Registration failed');
    });
  });
});
