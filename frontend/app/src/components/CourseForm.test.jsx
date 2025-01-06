import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CourseForm from './CourseForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from '../features/course/courseSlice';
import { MemoryRouter } from 'react-router-dom';

// Mock the apiClient
vi.mock('../utils/apiClient', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

// Helper function to render the component with Redux store
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      course: courseReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

describe('CourseForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form fields', () => {
    renderWithProvider(<CourseForm />);

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Publish/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Course/i })).toBeInTheDocument();
  });

  it('displays validation error when title is empty', async () => {
    renderWithProvider(<CourseForm />);

    fireEvent.click(screen.getByRole('button', { name: /Create Course/i }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });

  it('handles successful course creation', async () => {
    const apiClient = (await import('../utils/apiClient')).default;
    apiClient.post.mockResolvedValueOnce({
      data: {
        id: 1,
        title: 'New Course',
        description: 'New Description',
        category: 'Science',
        is_published: true,
      },
    });

    renderWithProvider(<CourseForm />);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Course' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Science' } });
    fireEvent.click(screen.getByLabelText(/Publish/i));

    fireEvent.click(screen.getByRole('button', { name: /Create Course/i }));

    expect(await screen.findByText('Course created successfully')).toBeInTheDocument();
  });

  it('handles successful course update', async () => {
    const apiClient = (await import('../utils/apiClient')).default;
    apiClient.put.mockResolvedValueOnce({
      data: {
        id: 1,
        title: 'Updated Course',
        description: 'Updated Description',
        category: 'Math',
        is_published: false,
      },
    });

    const existingCourse = {
      id: 1,
      title: 'Old Course',
      description: 'Old Description',
      category: 'History',
      is_published: true,
    };

    renderWithProvider(<CourseForm course={existingCourse} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Updated Course' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Math' } });
    fireEvent.click(screen.getByLabelText(/Publish/i));

    fireEvent.click(screen.getByRole('button', { name: /Update Course/i }));

    expect(await screen.findByText('Course updated successfully')).toBeInTheDocument();
  });

  it('displays validation error when title is empty during course update', async () => {
    const existingCourse = {
      id: 1,
      title: 'Old Course',
      description: 'Old Description',
      category: 'History',
      is_published: true,
    };

    renderWithProvider(<CourseForm course={existingCourse} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Course/i }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });
});
