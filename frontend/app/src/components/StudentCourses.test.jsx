import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import StudentCourses from './StudentCourses';
import courseReducer from '../features/course/courseSlice';
import enrollmentReducer from '../features/course/enrollmentSlice';
import apiClient from '../utils/apiClient';

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
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('renders the course list excluding BLOCKED enrollments', async () => {
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
        console.log('Mocked /courses/ response:', mockCourses);
        return Promise.resolve({ data: mockCourses });
      }
      if (url === '/courses/enrollments/') {
        console.log('Mocked /courses/enrollments/ response:', mockEnrollments);
        return Promise.resolve({ data: mockEnrollments });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    await act(async () => {
      renderWithProvider(<StudentCourses />);
    });

    // DOMが正しく更新されたことを確認
    await waitFor(() => {
      const enrolledCourse = screen.getByText('Course 1'); // ENROLLED のコース
      const blockedCourse = screen.queryByText('Course 2'); // BLOCKED のコース

      console.log('Enrolled Course Found:', enrolledCourse);
      console.log('Blocked Course Found:', blockedCourse);

      expect(enrolledCourse).toBeInTheDocument();
      expect(blockedCourse).not.toBeInTheDocument(); // BLOCKED コースが存在しない
    });
  });

  test('handles course enrollment and updates the list', async () => {
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

    await act(async () => {
      renderWithProvider(<StudentCourses />);
    });

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
    const mockEnrollments = [{ id: 1, course: { id: 1, title: 'Course 1' }, status: 'ENROLLED' }];

    apiClient.get.mockImplementation((url) => {
      if (url === '/courses/') {
        console.log('Mocked /courses/ response:', mockCourses);
        return Promise.resolve({ data: mockCourses });
      }
      if (url === '/courses/enrollments/') {
        console.log('Mocked /courses/enrollments/ response:', mockEnrollments);
        return Promise.resolve({ data: mockEnrollments });
      }
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
