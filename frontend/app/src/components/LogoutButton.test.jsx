import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogoutButton from './LogoutButton';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import apiClient from '../utils/apiClient';

// Mocking apiClient
jest.mock('../utils/apiClient');

describe('LogoutButton', () => {
  const renderWithProvider = (component) => {
    const store = configureStore({
      reducer: {
        user: userReducer,
      },
      preloadedState: {
        user: {
          isLoggedIn: true,
          userInfo: { email: 'test@example.com' },
          status: 'idle',
          error: null,
        },
      },
    });

    return {
      ...render(
        <Provider store={store}>
          {component}
        </Provider>
      ),
      store,
    };
  };

  it('renders the logout button', () => {
    renderWithProvider(<LogoutButton />);
    const logoutButton = screen.getByRole('button', { name: /Log out/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('dispatches logoutUser action and handles successful logout', async () => {
    // Mocking successful API response
    apiClient.post.mockResolvedValueOnce({});

    const { store } = renderWithProvider(<LogoutButton />);
    const logoutButton = screen.getByRole('button', { name: /Log out/i });

    // Click the logout button
    fireEvent.click(logoutButton);

    // Check if logout message is displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Logout successful!');
    });

    // Verify Redux store state
    const state = store.getState().user;
    expect(state.isLoggedIn).toBe(false);
  });

  it('handles logout failure', async () => {
    // Mocking failed API response
    apiClient.post.mockRejectedValueOnce({
      response: { data: 'Failed to log out' },
    });

    const { store } = renderWithProvider(<LogoutButton />);
    const logoutButton = screen.getByRole('button', { name: /Log out/i });

    // Click the logout button
    fireEvent.click(logoutButton);

    // Check if logout failure message is displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to log out');
    });

    // Verify Redux store state (still logged in due to failure)
    const state = store.getState().user;
    expect(state.isLoggedIn).toBe(true);
  });
});
