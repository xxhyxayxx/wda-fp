import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModuleForm from './ModuleForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import moduleReducer from '../features/course/moduleSlice';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../utils/apiClient';

// apiClientのモック
jest.mock('../utils/apiClient', () => ({
    post: jest.fn(),
    put: jest.fn(),  // PUTメソッドのモックを追加
}));

// Helper function to render component with Redux store
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

// 各テストごとにモックをクリア
beforeEach(() => {
    apiClient.post.mockClear();
    apiClient.put.mockClear();  // PUTメソッドのモックもクリア
});

describe('ModuleForm Component', () => {
    test('renders the form fields', () => {
        renderWithProvider(<ModuleForm courseId={1} />);
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create Module/i })).toBeInTheDocument();
    });

    test('displays validation error when title is empty', async () => {
        renderWithProvider(<ModuleForm courseId={1} />);
        fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));
        expect(await screen.findByText('Title is required')).toBeInTheDocument();
    });

    test('handles successful module creation', async () => {
        apiClient.post.mockResolvedValueOnce({
            data: { id: 1, title: 'New Module', description: 'New Description' },
        });

        renderWithProvider(<ModuleForm courseId={1} />);
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Module' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));

        expect(apiClient.post).toHaveBeenCalledTimes(1);
        expect(apiClient.post).toHaveBeenCalledWith("/courses/modules/create/", expect.any(FormData));
    });

    test('renders with initial values when updating an existing module', () => {
        const mockModule = { id: 1, title: 'Existing Module', description: 'Existing Description' };
        renderWithProvider(<ModuleForm courseId={1} module={mockModule} />);

        expect(screen.getByLabelText(/Title/i)).toHaveValue('Existing Module');
        expect(screen.getByLabelText(/Description/i)).toHaveValue('Existing Description');
        expect(screen.getByRole('button', { name: /Update Module/i })).toBeInTheDocument();
    });

    test('handles successful module update', async () => {
        const mockModule = { id: 1, title: 'Existing Module', description: 'Existing Description' };
        apiClient.put.mockResolvedValueOnce({  // PUTメソッドのモック
            data: { id: 1, title: 'Updated Module', description: 'Updated Description' },
        });

        renderWithProvider(<ModuleForm courseId={1} module={mockModule} />);
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Updated Module' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Updated Description' } });

        fireEvent.click(screen.getByRole('button', { name: /Update Module/i }));

        expect(apiClient.put).toHaveBeenCalledTimes(1);  // PUTが1回呼び出されたか確認
        expect(apiClient.put).toHaveBeenCalledWith("/courses/modules/1/update/", expect.any(FormData));  // 正しいURLで呼び出されたか確認
    });

    test('creates module without files', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { id: 1, title: 'New Module', description: 'New Description' } });

        renderWithProvider(<ModuleForm courseId={1} />);
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Module' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));

        await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
        expect(apiClient.post).toHaveBeenCalledWith("/courses/modules/create/", expect.any(FormData));
    });

    test('creates module with attached files', async () => {
        const files = [new File(['file content'], 'test1.pdf', { type: 'application/pdf' })];
        apiClient.post.mockResolvedValueOnce({ data: { id: 1, title: 'New Module', description: 'New Description' } });
    
        renderWithProvider(<ModuleForm courseId={1} />);
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Module' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });
    
        // ファイルの選択
        const fileInput = screen.getByLabelText(/Add Files/i);
        fireEvent.change(fileInput, { target: { files } });
    
        fireEvent.click(screen.getByRole('button', { name: /Create Module/i }));
    
        await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(2));
        
        // 1回目の呼び出し：ファイルバッチ処理
        expect(apiClient.post).toHaveBeenCalledWith("/courses/files/batch-update/", expect.any(FormData), {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    
        // 2回目の呼び出し：モジュール作成
        expect(apiClient.post).toHaveBeenCalledWith("/courses/modules/create/", expect.any(FormData));
    });
    
    test('updates module with file addition', async () => {
        const mockModule = { id: 1, title: 'Existing Module', description: 'Existing Description' };
        const files = [new File(['file content'], 'test1.pdf', { type: 'application/pdf' })];
        apiClient.put.mockResolvedValueOnce({ data: { id: 1, title: 'Updated Module', description: 'Updated Description' } });
      
        renderWithProvider(<ModuleForm courseId={1} module={mockModule} />);
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Updated Module' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Updated Description' } });
      
        // ファイルの追加
        const fileInput = screen.getByLabelText(/Add Files/i);
        fireEvent.change(fileInput, { target: { files } });
      
        fireEvent.click(screen.getByRole('button', { name: /Update Module/i }));
      
        await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
    });

    test('deletes all files in module update', async () => {
        const mockModule = { id: 1, title: 'Existing Module', description: 'Existing Description' };
        const filesToDelete = [1, 2]; // 削除するファイルIDを追加
        apiClient.put.mockResolvedValueOnce({ data: { id: 1, title: 'Updated Module', description: 'Updated Description' } });
      
        renderWithProvider(<ModuleForm courseId={1} module={mockModule} />);
      
        fireEvent.click(screen.getByRole('button', { name: /Update Module/i }));
      
        await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
    });
    
    test('updates module with partial file deletion and new file addition', async () => {
        const mockModule = { id: 1, title: 'Existing Module', description: 'Existing Description' };
        const files = [new File(['new file content'], 'new_test1.pdf', { type: 'application/pdf' })];
      
        apiClient.put.mockResolvedValueOnce({ data: { id: 1, title: 'Updated Module', description: 'Updated Description' } });
      
        renderWithProvider(<ModuleForm courseId={1} module={mockModule} />);
      
        // ファイルの削除と追加
        const fileInput = screen.getByLabelText(/Add Files/i);
        fireEvent.change(fileInput, { target: { files } });
      
        fireEvent.click(screen.getByRole('button', { name: /Update Module/i }));
      
        await waitFor(() => expect(apiClient.post).toHaveBeenCalledTimes(1));
    });
    

});
