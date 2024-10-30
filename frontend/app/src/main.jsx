import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import TeacherHome from './components/TeacherHome'; 
import { store } from './store';
import PrivateRoute from './routes/PrivateRoute';
import TeacherRoute from './routes/TeacherRoute'; // 追加
import './styles/global.css';
import ProfileUpdateForm from './components/ProfileUpdateForm'; 
import ChangePasswordForm from './components/ChangePasswordForm';
import Courses from './components/Courses';
import CourseForm from './components/CourseForm'; // 追加

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          {/* 教師用のホーム、TeacherRouteで保護 */}
          <Route
            path="/teacher-home"
            element={
              <TeacherRoute>
                <TeacherHome />
              </TeacherRoute>
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
          <Route
            path="/courses"
            element={
              <TeacherRoute>
                <Courses />
              </TeacherRoute>
            }
          />
          <Route
            path="/create-course"
            element={
              <TeacherRoute>
                <CourseForm />
              </TeacherRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  </StrictMode>
);
