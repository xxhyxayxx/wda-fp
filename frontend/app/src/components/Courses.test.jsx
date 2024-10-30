// src/components/Courses.test.jsx
import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'; // actをインポート
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from '../features/course/courseSlice';
import Courses from './Courses';
import apiClient from '../utils/apiClient';
import { BrowserRouter } from 'react-router-dom';

// Mock apiClient
jest.mock('../utils/apiClient');

// Function to render a component with Redux store
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: { course: courseReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('Courses Component', () => {
    test('fetches and displays courses', async () => {
        const mockCourses = [
          { id: 1, name: 'Course 1', description: 'Description 1' },
          { id: 2, name: 'Course 2', description: 'Description 2' },
        ];
    
        apiClient.get.mockResolvedValueOnce({ data: mockCourses });
    
        await act(async () => {
          renderWithProvider(<Courses />);
        });
    
        await waitFor(() => {
          expect(screen.getByText('Course 1')).toBeInTheDocument();
          expect(screen.getByText('Course 2')).toBeInTheDocument();
        });
      });

      test('shows loading message while fetching', async () => {
        // APIレスポンスを遅延させるモックを設定
        apiClient.get.mockImplementationOnce(
          () => new Promise(() => {}) // 無限に待機するPromiseを返す
        );
    
        await act(async () => {
          renderWithProvider(<Courses />);
        });
    
        // ローディングメッセージの表示を確認
        expect(screen.getByText(/Loading courses.../i)).toBeInTheDocument();
      });

      test('displays error message if fetch fails', async () => {
        apiClient.get.mockRejectedValueOnce(new Error('Fetch failed'));
    
        await act(async () => {
          renderWithProvider(<Courses />);
        });
    
        await waitFor(() => {
          expect(screen.getByText(/Error: Fetch failed/i)).toBeInTheDocument();
        });
      });
});
