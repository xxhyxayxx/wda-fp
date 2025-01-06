import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeAll, afterAll, beforeEach, vi, expect } from 'vitest';
import ModuleForm from './ModuleForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import moduleReducer from '../features/course/moduleSlice';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../utils/apiClient';

// apiClientのモック
vi.mock('../utils/apiClient', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
  global.URL.createObjectURL.mockRestore();
  global.URL.revokeObjectURL.mockRestore();
});

const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      module: moduleReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ModuleForm Component', () => {
  it('renders the form fields', () => {
    renderWithProvider(<ModuleForm courseId={1} />);
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Module/i })).toBeInTheDocument();
  });

  it('displays validation error when title is empty', async () => {
    renderWithProvider(<ModuleForm courseId={1} />);
    fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });

  it('handles successful module creation', async () => {
    apiClient.post.mockResolvedValueOnce({
      data: { id: 1, title: 'New Module', description: 'New Description' },
    });

    renderWithProvider(<ModuleForm courseId={1} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Module' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith('/courses/modules/create/', expect.any(FormData));
  });

  it('creates module with attached files', async () => {
    const files = [new File(['file content'], 'test1.pdf', { type: 'application/pdf' })];
    apiClient.post.mockResolvedValueOnce({ data: { id: 1, title: 'New Module', description: 'New Description' } });

    renderWithProvider(<ModuleForm courseId={1} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Module' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });

    const fileInput = screen.getByLabelText(/Add Files/i);
    Object.defineProperty(fileInput, 'files', { value: files });
    fireEvent.change(fileInput);

    fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));

    await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(2));

    expect(apiClient.post).toHaveBeenCalledWith('/courses/files/batch-update/', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(apiClient.post).toHaveBeenCalledWith('/courses/modules/create/', expect.any(FormData));
  });

  it('updates module with file addition', async () => {
    const mockModule = { id: 1, title: 'Existing Module', description: 'Existing Description' };
    const files = [new File(['file content'], 'test1.pdf', { type: 'application/pdf' })];
    apiClient.put.mockResolvedValueOnce({
      data: { id: 1, title: 'Updated Module', description: 'Updated Description' },
    });

    renderWithProvider(<ModuleForm courseId={1} module={mockModule} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Updated Module' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Updated Description' } });

    const fileInput = screen.getByLabelText(/Add Files/i);
    Object.defineProperty(fileInput, 'files', { value: files });
    fireEvent.change(fileInput);

    fireEvent.click(screen.getByRole('button', { name: /Update Module/i }));

    await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
  });
});
