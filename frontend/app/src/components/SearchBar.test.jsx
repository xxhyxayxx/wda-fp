import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom'; // Router をインポート
import userReducer, { searchUsers, resetSearchResults } from '../features/user/userSlice';
import SearchBar from './SearchBar';

// Redux のモック
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDispatch: () => vi.fn(), // useDispatchをモック化
  };
});

// userSlice のモック
vi.mock('../features/user/userSlice', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    searchUsers: vi.fn(), // searchUsersをモック化
    resetSearchResults: vi.fn(), // resetSearchResultsをモック化
  };
});

describe('SearchBar Component', () => {
  let mockStore;

  beforeEach(() => {
    vi.clearAllMocks();

    // モックストアを初期化
    mockStore = configureStore({
      reducer: {
        user: userReducer,
      },
      preloadedState: {
        user: {
          searchResults: [],
          status: 'idle',
          error: null,
        },
      },
    });
  });

  const renderWithProvider = (component) =>
    render(
      <Provider store={mockStore}>
        <BrowserRouter>{component}</BrowserRouter> {/* Router をラップ */}
      </Provider>
    );

  it('renders the search input and placeholder', () => {
    renderWithProvider(<SearchBar />);

    expect(screen.getByPlaceholderText('Search for a user...')).toBeInTheDocument();
  });

  it('dispatches searchUsers on input change', () => {
    renderWithProvider(<SearchBar />);

    const input = screen.getByPlaceholderText('Search for a user...');
    fireEvent.change(input, { target: { value: 'Test User' } });

    // searchUsers が正しく呼び出されたかを確認
    expect(searchUsers).toHaveBeenCalledWith('Test User');
  });

  it('dispatches resetSearchResults when input is cleared', () => {
    renderWithProvider(<SearchBar />);

    const input = screen.getByPlaceholderText('Search for a user...');
    fireEvent.change(input, { target: { value: 'Test User' } });
    fireEvent.change(input, { target: { value: '' } });

    // resetSearchResults が呼び出されたかを確認
    expect(resetSearchResults).toHaveBeenCalled();
  });
});
