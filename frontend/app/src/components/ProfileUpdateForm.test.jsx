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
    beforeEach(() => {
      // Mock successful profile fetch response
      apiClient.get.mockResolvedValue({
        data: {
          name: 'Test User',
          user_type: 'student',
          profile_image: 'http://example.com/test_image.png',
        },
      });
    });
  
    test('renders the form fields including profile image input', async () => {
      await act(async () => {
        renderWithProvider(<ProfileUpdateForm />);
      });
  
      // Check that form elements exist
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/User Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Profile Image/i)).toBeInTheDocument(); // 新しい画像入力フィールドの確認
      expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
    });
  
    test('handles successful profile update including image', async () => {
      // Mock successful response for profile update
      apiClient.patch.mockResolvedValueOnce({
        data: {
          name: 'Updated User',
          user_type: 'teacher',
          profile_image: 'http://example.com/updated_image.png',
        },
      });
  
      await act(async () => {
        renderWithProvider(<ProfileUpdateForm />);
      });
  
      const nameInput = screen.getByLabelText(/Name/i);
      const userTypeSelect = screen.getByLabelText(/User Type/i);
      const profileImageInput = screen.getByLabelText(/Profile Image/i);
      const updateButton = screen.getByRole('button', { name: /Update/i });
  
      // Create a mock image file
      const file = new File(['(⌐□_□)'], 'test_image.png', { type: 'image/png' });
  
      // Fill in the input fields and click the update button
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Updated User' } });
        fireEvent.change(userTypeSelect, { target: { value: 'teacher' } });
        fireEvent.change(profileImageInput, { target: { files: [file] } }); // プロファイル画像の選択
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
        fireEvent.change(nameInput, { target: { value: '' } }); // 空の名前でバリデーションエラーを引き起こす
        fireEvent.click(updateButton);
      });
  
      // Check that the error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
    });
  });
  