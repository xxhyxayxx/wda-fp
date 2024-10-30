// TeacherRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const TeacherRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const userType = useSelector((state) => state.user.userInfo?.user_type);
  const location = useLocation();

  // ログアウト時のリダイレクト
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 生徒の場合のリダイレクト
  if (userType && userType !== 'teacher') {
    return <Navigate to="/" replace />;
  }

  // 認証中の状態を表示
  if (!userType) {
    return <div>Loading...</div>;
  }

  // 教師の場合、ページをそのまま表示
  return children;
};

export default TeacherRoute;