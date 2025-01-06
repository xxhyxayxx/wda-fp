// src/components/Courses.test.jsx
import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from '../features/course/courseSlice';
import userReducer from '../features/user/userSlice';
import Courses from './Courses';
import apiClient from '../utils/apiClient';
import { BrowserRouter } from 'react-router-dom';

// Mock apiClient
vi.mock('../utils/apiClient');

// Function to render a component with Redux store
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      course: courseReducer,
      user: userReducer,
    },
    preloadedState: {
      user: {
        userInfo: { name: 'Test User', email: 'test@example.com' },
      },
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('Courses Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays courses', async () => {
    const mockCourses = [
      {
        id: 1,
        title: 'Course 1',
        description: 'Description 1',
        created_at: '2024-10-29T10:00:00Z',
        updated_at: '2024-10-29T10:05:00Z',
      },
      {
        id: 2,
        title: 'Course 2',
        description: 'Description 2',
        created_at: '2024-10-29T11:00:00Z',
        updated_at: '2024-10-29T11:05:00Z',
      },
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

  it('shows loading message while fetching', async () => {
    apiClient.get.mockImplementationOnce(
      () => new Promise(() => {}) // Mock an unresolved Promise
    );

    await act(async () => {
      renderWithProvider(<Courses />);
    });

    expect(screen.getByText(/Loading courses.../i)).toBeInTheDocument();
  });

  it('displays error message if fetch fails', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('Fetch failed'));

    await act(async () => {
      renderWithProvider(<Courses />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Fetch failed/i)).toBeInTheDocument();
    });
  });

  it('renders Create Course button', async () => {
    const mockCourses = [
      { id: 1, title: 'Course 1', description: 'Description 1' },
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockCourses });

    await act(async () => {
      renderWithProvider(<Courses />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Course/i })).toBeInTheDocument();
    });
  });

  it('navigates to CourseForm when Create Course button is clicked', async () => {
    const mockCourses = [
      { id: 1, title: 'Course 1', description: 'Description 1' },
    ];
    apiClient.get.mockResolvedValueOnce({ data: mockCourses });

    await act(async () => {
      renderWithProvider(<Courses />);
    });

    const createCourseButton = await screen.findByRole('button', {
      name: /Create Course/i,
    });
    expect(createCourseButton).toBeInTheDocument();

    fireEvent.click(createCourseButton);

    // Verify that the navigation happens
    await waitFor(() => {
      expect(window.location.pathname).toBe('/create-course');
    });
  });
});
