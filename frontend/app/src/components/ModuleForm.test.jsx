import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModuleForm from './ModuleForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import moduleReducer from '../features/course/moduleSlice';
import fileReducer from '../features/course/fileSlice';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../utils/apiClient';

// apiClientのモック
jest.mock('../utils/apiClient', () => ({
    post: jest.fn(),
    put: jest.fn(),
}));

// Helper function to render component with Redux store
const renderWithProvider = (component) => {
  const store = configureStore({
    reducer: {
      module: moduleReducer,
      file: fileReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

describe('ModuleForm Component', () => {
  test('renders the form fields', () => {
    renderWithProvider(<ModuleForm />);

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Order/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Add Files/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Module/i })).toBeInTheDocument();
  });

  test('displays validation error when title is empty', async () => {
    renderWithProvider(<ModuleForm />);

    fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });

  test('displays error when invalid file type is selected', async () => {
    renderWithProvider(<ModuleForm />);

    const fileInput = screen.getByLabelText(/Add Files/i);
    const invalidFile = new File(['(⌐□_□)'], 'invalid.exe', { type: 'application/x-msdownload' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(await screen.findByText(/Invalid file type/)).toBeInTheDocument();
  });

  test('handles successful module creation with files', async () => {
    apiClient.post.mockResolvedValueOnce({
      data: { id: 1, title: 'New Module', description: 'New Description', order: 1 },
    });

    renderWithProvider(<ModuleForm />);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Module' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText(/Order/i), { target: { value: 1 } });

    const validFile = new File(['file content'], 'example.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/Add Files/i), { target: { files: [validFile] } });

    fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));

    expect(await screen.findByText('Module created successfully')).toBeInTheDocument();
  });

  test('handles successful module update', async () => {
    apiClient.put.mockResolvedValueOnce({
      data: { id: 1, title: 'Updated Module', description: 'Updated Description', order: 2 },
    });

    const existingModule = {
      id: 1,
      title: 'Old Module',
      description: 'Old Description',
      order: 1,
    };

    renderWithProvider(<ModuleForm module={existingModule} onClose={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Updated Module' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByLabelText(/Order/i), { target: { value: 2 } });

    fireEvent.click(screen.getByRole('button', { name: /Update Module/i }));

    expect(await screen.findByText('Module updated successfully')).toBeInTheDocument();
  });

  test('displays validation error when title is empty during module update', async () => {
    const existingModule = {
      id: 1,
      title: 'Old Module',
      description: 'Old Description',
      order: 1,
    };

    renderWithProvider(<ModuleForm module={existingModule} onClose={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Module/i }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });
});
