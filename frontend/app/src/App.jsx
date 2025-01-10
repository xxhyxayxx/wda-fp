import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  initializeWebSocket,
  closeWebSocket,
} from './features/notification/notificationSlice';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';
import TeacherRoute from './routes/TeacherRoute';
import StudentRoute from './routes/StudentRoute';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Home from './components/Home';
import TeacherHome from './components/TeacherHome';
import ProfileUpdateForm from './components/ProfileUpdateForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import Courses from './components/Courses';
import CreateCoursePage from './components/CreateCoursePage';
import EditCoursePage from './components/EditCoursePage';
import CourseDetailPage from './components/CourseDetailPage';
import CreateModulePage from './components/CreateModulePage';
import EditModulePage from './components/EditModulePage';
import StudentCourses from './components/StudentCourses';
import StudentCourseDetailPage from './components/StudentCourseDetailPage';
import StudentDetailPage from './components/StudentDetailPage';
import NotificationPage from './components/NotificationPage';
import NotificationDetailPage from './components/NotificationDetailPage';
import NavBar from './components/NavBar'; // ナビバーをインポート
import SearchResultPage from './components/SearchResultPage';
import MessageList from './components/ConversationList';
import MessageDetail from './components/MessageDetail';

const App = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  // 通知の取得とWebSocketの初期化
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchNotifications());
      dispatch(initializeWebSocket());
    }

    return () => {
      dispatch(closeWebSocket());
    };
  }, [dispatch, userInfo]);

  return (
    <Router>
      {/* ログイン済みの場合のみNavBarを表示 */}
      {userInfo && <NavBar />}
      <Routes>
        {/* ログインページ */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />
        {/* 登録ページ */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterForm />
            </PublicRoute>
          }
        />
        {/* ホームページ */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        {/* 教師用ホームページ */}
        <Route
          path="/teacher-home"
          element={
            <TeacherRoute>
              <TeacherHome />
            </TeacherRoute>
          }
        />
        {/* プロフィール更新ページ */}
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <ProfileUpdateForm />
            </PrivateRoute>
          }
        />
        {/* パスワード変更ページ */}
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePasswordForm />
            </PrivateRoute>
          }
        />
        {/* 教師用コースページ */}
        <Route
          path="/courses"
          element={
            <TeacherRoute>
              <Courses />
            </TeacherRoute>
          }
        />
        {/* コース作成ページ */}
        <Route
          path="/create-course"
          element={
            <TeacherRoute>
              <CreateCoursePage />
            </TeacherRoute>
          }
        />
        {/* コース編集ページ */}
        <Route
          path="/edit-course/:courseId"
          element={
            <TeacherRoute>
              <EditCoursePage />
            </TeacherRoute>
          }
        />
        {/* コース詳細ページ */}
        <Route
          path="/courses/:courseId"
          element={
            <TeacherRoute>
              <CourseDetailPage />
            </TeacherRoute>
          }
        />
        {/* モジュール作成ページ */}
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
        {/* 学生用コースページ */}
        <Route
          path="/student-courses"
          element={
            <StudentRoute>
              <StudentCourses />
            </StudentRoute>
          }
        />
        {/* 学生用コース詳細ページ */}
        <Route
          path="/student-courses/:courseId"
          element={
            <StudentRoute>
              <StudentCourseDetailPage />
            </StudentRoute>
          }
        />
        {/* 教師用: 生徒詳細ページ */}
        <Route
          path="/courses/:courseId/students/:studentId"
          element={
            <TeacherRoute>
              <StudentDetailPage />
            </TeacherRoute>
          }
        />
        {/* 通知ページ */}
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <NotificationPage />
            </PrivateRoute>
          }
        />
        {/* 通知詳細ページ */}
        <Route
          path="/notifications/:id"
          element={
            <PrivateRoute>
              <NotificationDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <PrivateRoute>
              <SearchResultPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <MessageList />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages/:receiverId"
          element={
            <PrivateRoute>
              <MessageDetail />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
