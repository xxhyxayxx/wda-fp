import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileUpdateForm from './ProfileUpdateForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../utils/apiClient';

// Mocking apiClient
jest.mock('../utils/apiClient');

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

describe('ProfileUpdateForm Component', () => {
  test('renders the form fields', async () => {
    await act(async () => {
      renderWithProvider(<ProfileUpdateForm />);
    });

    // Check that form elements exist
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/User Type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
  });

  test('handles successful profile update', async () => {
    // Mock successful response
    apiClient.patch.mockResolvedValueOnce({
      data: {
        name: 'Updated User',
        user_type: 'teacher',
      },
    });

    await act(async () => {
      renderWithProvider(<ProfileUpdateForm />);
    });

    const nameInput = screen.getByLabelText(/Name/i);
    const userTypeSelect = screen.getByLabelText(/User Type/i);
    const updateButton = screen.getByRole('button', { name: /Update/i });

    // Fill in the input fields and click the update button
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Updated User' } });
      fireEvent.change(userTypeSelect, { target: { value: 'teacher' } });
      fireEvent.click(updateButton);
    });

    // Check that success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
    });
  });

  test('displays error messages on failed profile update', async () => {
    // Set mock API response to return an error
    apiClient.patch.mockRejectedValueOnce({
      response: { data: { name: ['Name is required'] } },
    });

    await act(async () => {
      renderWithProvider(<ProfileUpdateForm />);
    });

    const nameInput = screen.getByLabelText(/Name/i);
    const updateButton = screen.getByRole('button', { name: /Update/i });

    // Fill in the input fields and click the update button
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: '' } }); // Empty name to trigger validation error
      fireEvent.click(updateButton);
    });

    // Check that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });
  });
});
