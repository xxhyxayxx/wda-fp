import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'; // actをインポート
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import StudentCourses from './StudentCourses';
import courseReducer from '../features/course/courseSlice';
import enrollmentReducer from '../features/course/enrollmentSlice';
import apiClient from '../utils/apiClient';

// Mock API Client
jest.mock('../utils/apiClient');

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
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('StudentCourses Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the course list', async () => {
    const mockCourses = [
      { id: 1, title: 'Course 1', description: 'Description 1', category: 'Category 1' },
      { id: 2, title: 'Course 2', description: 'Description 2', category: 'Category 2' },
    ];
    const mockEnrollments = [{ id: 1, course: { id: 1, title: 'Course 1' } }];

    apiClient.get.mockImplementation((url) => {
      if (url === '/courses/') return Promise.resolve({ data: mockCourses });
      if (url === '/courses/enrollments/') return Promise.resolve({ data: mockEnrollments });
      return Promise.reject(new Error('Unknown endpoint'));
    });

    await act(async () => {
      renderWithProvider(<StudentCourses />);
    });

    // Wait for the courses to be rendered
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
    });
  });

  test('handles course enrollment', async () => {
    const mockCourses = [
      { id: 1, title: 'Course 1', description: 'Description 1', category: 'Category 1' },
      { id: 2, title: 'Course 2', description: 'Description 2', category: 'Category 2' },
    ];
    const mockEnrollments = [{ id: 1, course: { id: 1, title: 'Course 1' } }];

    apiClient.get.mockImplementation((url) => {
      if (url === '/courses/') return Promise.resolve({ data: mockCourses });
      if (url === '/courses/enrollments/') return Promise.resolve({ data: mockEnrollments });
      return Promise.reject(new Error('Unknown endpoint'));
    });

    await act(async () => {
      renderWithProvider(<StudentCourses />);
    });

    const enrollButton = await screen.findByText('Enroll');
    expect(enrollButton).toBeInTheDocument();

    apiClient.post.mockResolvedValueOnce({});
    apiClient.get.mockResolvedValueOnce({
      data: [...mockEnrollments, { id: 2, course: { id: 2, title: 'Course 2' } }],
    });

    fireEvent.click(enrollButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/courses/2/enroll/');
      expect(screen.getAllByText('Enrolled')).toHaveLength(2);
    });
  });

  test('displays error message on fetch failure', async () => {
    const errorMessage = 'Failed to fetch courses';

    apiClient.get.mockRejectedValueOnce(new Error(errorMessage));

    await act(async () => {
      renderWithProvider(<StudentCourses />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch courses/i)).toBeInTheDocument();
    });
  });

  test('displays "Enrolled" badge for enrolled courses', async () => {
    const mockCourses = [{ id: 1, title: 'Course 1', description: 'Description 1', category: 'Category 1' }];
    const mockEnrollments = [{ id: 1, course: { id: 1, title: 'Course 1' } }];

    apiClient.get.mockImplementation((url) => {
      if (url === '/courses/') return Promise.resolve({ data: mockCourses });
      if (url === '/courses/enrollments/') return Promise.resolve({ data: mockEnrollments });
      return Promise.reject(new Error('Unknown endpoint'));
    });

    await act(async () => {
      renderWithProvider(<StudentCourses />);
    });

    await waitFor(() => {
      expect(screen.getByText('Enrolled')).toBeInTheDocument();
    });
  });
});
