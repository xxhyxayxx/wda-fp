import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import TeacherHome from './components/TeacherHome'; // 追加
import { store } from './store';
import PrivateRoute from './routes/PrivateRoute';
import './styles/global.css';
import ProfileUpdateForm from './components/ProfileUpdateForm'; 
import ChangePasswordForm from './components/ChangePasswordForm';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          {/* 生徒用のホーム */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          {/* 教師用のホーム */}
          <Route
            path="/teacher-home"
            element={
              <PrivateRoute>
                <TeacherHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <ProfileUpdateForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <ChangePasswordForm />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  </StrictMode>
);
