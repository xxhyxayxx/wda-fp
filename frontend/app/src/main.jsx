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
import TeacherRoute from './routes/TeacherRoute';
import StudentRoute from './routes/StudentRoute';
import './styles/global.css';
import ProfileUpdateForm from './components/ProfileUpdateForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import Courses from './components/Courses';
import CreateCoursePage from './components/CreateCoursePage';
import EditCoursePage from './components/EditCoursePage';
import CourseDetailPage from './components/CourseDetailPage';
import CreateModulePage from './components/CreateModulePage'; // 新規モジュール作成ページをインポート
import EditModulePage from './components/EditModulePage';     // モジュール編集ページをインポート
import StudentCourses from './components/StudentCourses';
import StudentCourseDetailPage from './components/StudentCourseDetailPage'; // 新しいコンポーネントをインポート
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'normalize.css';

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
                <CreateCoursePage />
              </TeacherRoute>
            }
          />
          <Route
            path="/edit-course/:courseId"
            element={
              <TeacherRoute>
                <EditCoursePage />
              </TeacherRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <TeacherRoute>
                <CourseDetailPage />
              </TeacherRoute>
            }
          />
          {/* 新しいモジュール作成ページ */}
          <Route
            path="/create-module"
            element={
              <TeacherRoute>
                <CreateModulePage />
              </TeacherRoute>
            }
          />
          {/* モジュール編集ページ */}
          <Route
            path="/edit-module/:moduleId"
            element={
              <TeacherRoute>
                <EditModulePage />
              </TeacherRoute>
            }
          />
          <Route
            path="/student-courses"
            element={
              <StudentRoute>
                <StudentCourses />
              </StudentRoute>
            }
          />
          <Route
            path="/student-courses/:courseId"
            element={
              <StudentRoute>
                <StudentCourseDetailPage />
              </StudentRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  </StrictMode>
);
