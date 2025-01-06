import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { describe, it, expect, beforeEach } from 'vitest';
import configureStore from 'redux-mock-store';
import PrivateRoute from './PrivateRoute';

// モックストアの設定
const mockStore = configureStore([]);

describe('PrivateRoute', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      user: {
        isLoggedIn: false,
        userInfo: null,
      },
    });
  });

  it('ログインしていない場合、ログインページにリダイレクトされること', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <div>ホームページ</div>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<div>ログインページ</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(container.textContent).toBe('ログインページ');
  });

  it('ログインしていて生徒の場合、子コンポーネントが表示されること', () => {
    store = mockStore({
      user: {
        isLoggedIn: true,
        userInfo: { userType: 'student' },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <div>ホームページ</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(container.textContent).toBe('ホームページ');
  });

  it('ログインしていて教師の場合、教師ホームページにリダイレクトされること', () => {
    store = mockStore({
      user: {
        isLoggedIn: true,
        userInfo: { userType: 'teacher' },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <div>ホームページ</div>
                </PrivateRoute>
              }
            />
            <Route path="/teacher-home" element={<div>教師ホームページ</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(container.textContent).toBe('教師ホームページ');
  });
});
