// src/components/Courses.test.jsx
import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'; // actをインポート
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from '../features/course/courseSlice';
import userReducer from '../features/user/userSlice';
import Courses from './Courses';
import apiClient from '../utils/apiClient';
import { BrowserRouter } from 'react-router-dom';

// Mock apiClient
jest.mock('../utils/apiClient');

// Function to render a component with Redux store
const renderWithProvider = (component) => {
    const store = configureStore({
        reducer: { 
            course: courseReducer,
            user: userReducer, // user スライスを追加
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
        preloadedState: {
            user: {
                userInfo: { name: 'Test User', email: 'test@example.com' }, // userInfo を設定
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
    test('fetches and displays courses', async () => {
        const mockCourses = [
            { id: 1, title: 'Course 1', description: 'Description 1', created_at: '2024-10-29T10:00:00Z', updated_at: '2024-10-29T10:05:00Z' },
            { id: 2, title: 'Course 2', description: 'Description 2', created_at: '2024-10-29T11:00:00Z', updated_at: '2024-10-29T11:05:00Z' },
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
            () => new Promise(() => { }) // 無限に待機するPromiseを返す
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

    test('renders Create Course button', async () => {
        // 正しいモックデータを設定
        const mockCourses = [
            { id: 1, name: 'Course 1', description: 'Description 1' },
        ];
        apiClient.get.mockResolvedValueOnce({ data: mockCourses });
    
        await act(async () => {
            renderWithProvider(<Courses />);
        });
    
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Create Course/i })).toBeInTheDocument();
        });
    });

    test('navigates to CourseForm when Create Course button is clicked', async () => {
        // 正しいモックデータを設定
        const mockCourses = [
            { id: 1, name: 'Course 1', description: 'Description 1' },
        ];
        apiClient.get.mockResolvedValueOnce({ data: mockCourses });
    
        await act(async () => {
            renderWithProvider(<Courses />);
        });
    
        // "Create Course" ボタンが存在することを確認
        const createCourseButton = await screen.findByRole('button', { name: /Create Course/i });
        expect(createCourseButton).toBeInTheDocument();
    
        // ボタンをクリック
        fireEvent.click(createCourseButton);
    
        // ページ遷移の確認 (モックナビゲーションを考慮する必要がある場合も)
        expect(window.location.pathname).toBe('/create-course');
    });
    

});
