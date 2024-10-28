import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react'; 
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import ProfileUpdateForm from './ProfileUpdateForm';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../utils/apiClient';

// Mocking apiClient
jest.mock('../utils/apiClient');

// Mocking URL.createObjectURL
beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'http://example.com/preview_image.png');
});

// Reduxストアとラップする関数
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: { user: userReducer },
  });

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>{component}</MemoryRouter>
      </Provider>
    ),
    store,
  };
};

describe('ProfileUpdateForm Component', () => {
  test('renders form with fetched user data', async () => {
    const mockUserData = {
      name: 'Test User',
      email: 'test@example.com',
      user_type: 'student',
      profile_image: 'http://example.com/test_image.png',
    };

    apiClient.get.mockResolvedValueOnce({ data: mockUserData });

    renderWithProvider(<ProfileUpdateForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toHaveValue(mockUserData.name);
      expect(screen.getByLabelText(/Email/i)).toHaveValue(mockUserData.email);
      expect(screen.getByLabelText(/User Type/i)).toHaveValue(mockUserData.user_type);
    });

    expect(screen.getByAltText('Profile Preview')).toHaveAttribute('src', mockUserData.profile_image);
  });

  test('updates status to succeeded after profile update', async () => {
    const mockUpdatedUserData = {
      name: 'Updated User',
      email: 'updated@example.com',
      user_type: 'teacher',
      profile_image: 'http://example.com/updated_image.png',
    };

    apiClient.patch.mockResolvedValueOnce({ data: mockUpdatedUserData });

    const { store } = renderWithProvider(<ProfileUpdateForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: mockUpdatedUserData.name } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: mockUpdatedUserData.email } });
    fireEvent.change(screen.getByLabelText(/User Type/i), { target: { value: mockUpdatedUserData.user_type } });

    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      const status = store.getState().user.status;
      expect(status).toBe('succeeded');
    });
  });
});
