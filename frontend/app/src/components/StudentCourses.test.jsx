import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import StudentCourses from './StudentCourses';
import courseReducer from '../features/course/courseSlice';
import enrollmentReducer from '../features/course/enrollmentSlice';
import apiClient from '../utils/apiClient';

// Mocking apiClient
vi.mock('../utils/apiClient');

// Function to render a component with Redux store and BrowserRouter
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      course: courseReducer,
      enrollment: enrollmentReducer,
      user: () => ({
        userInfo: { name: 'Test User', user_type: 'student', profile_image: 'profile_images/default_profile.jpeg' },
      }),
    },
    preloadedState: {
      course: { courses: [], loading: false, error: null },
      enrollment: { enrollments: [], loading: false, error: null },
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('StudentCourses Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the course list excluding BLOCKED enrollments', async () => {
    const mockCourses = [
      { id: 1, title: 'Course 1', description: 'Description 1', category: 'Category 1' },
      { id: 2, title: 'Course 2', description: 'Description 2', category: 'Category 2' },
    ];
    const mockEnrollments = [
      { id: 1, course: { id: 1, title: 'Course 1' }, status: 'ENROLLED' },
      { id: 2, course: { id: 2, title: 'Course 2' }, status: 'BLOCKED' },
    ];

    apiClient.get.mockImplementation((url) => {
      if (url === '/courses/') {
        return Promise.resolve({ data: mockCourses });
      }
      if (url === '/courses/enrollments/') {
        return Promise.resolve({ data: mockEnrollments });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    renderWithProvider(<StudentCourses />);

    // Verify the DOM updates correctly
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument(); // ENROLLED course
      expect(screen.queryByText('Course 2')).not.toBeInTheDocument(); // BLOCKED course
    });
  });

  it('handles course enrollment and updates the list', async () => {
    const mockCourses = [
      { id: 1, title: 'Course 1', description: 'Description 1', category: 'Category 1' },
      { id: 2, title: 'Course 2', description: 'Description 2', category: 'Category 2' },
    ];
    const mockEnrollments = [
      { id: 1, course: { id: 1, title: 'Course 1' }, status: 'ENROLLED' },
    ];

    apiClient.get.mockImplementation((url) => {
      if (url === '/courses/') {
        return Promise.resolve({ data: mockCourses });
      }
      if (url === '/courses/enrollments/') {
        return Promise.resolve({ data: mockEnrollments });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    renderWithProvider(<StudentCourses />);

    const enrollButton = await screen.findByText('Enroll');
    expect(enrollButton).toBeInTheDocument();

    apiClient.post.mockResolvedValueOnce({});
    apiClient.get.mockResolvedValueOnce({
      data: [
        ...mockEnrollments,
        { id: 2, course: { id: 2, title: 'Course 2' }, status: 'ENROLLED' },
      ],
    });

    fireEvent.click(enrollButton);

    await waitFor(() => {
      expect(screen.getByText('Course 2')).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    const errorMessage = 'Failed to fetch courses';

    apiClient.get.mockRejectedValueOnce(new Error(errorMessage));

    renderWithProvider(<StudentCourses />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch courses/i)).toBeInTheDocument();
    });
  });

  it('displays "Enrolled" badge for enrolled courses', async () => {
    const mockCourses = [{ id: 1, title: 'Course 1', description: 'Description 1', category: 'Category 1' }];
    const mockEnrollments = [{ id: 1, course: { id: 1, title: 'Course 1' }, status: 'ENROLLED' }];

    apiClient.get.mockImplementation((url) => {
      if (url === '/courses/') {
        return Promise.resolve({ data: mockCourses });
      }
      if (url === '/courses/enrollments/') {
        return Promise.resolve({ data: mockEnrollments });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    renderWithProvider(<StudentCourses />);

    await waitFor(() => {
      expect(screen.getByText('Enrolled')).toBeInTheDocument();
    });
  });
});
