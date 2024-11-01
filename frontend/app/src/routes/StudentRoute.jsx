// StudentRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const StudentRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const userType = useSelector((state) => state.user.userInfo?.user_type);
  const location = useLocation();

  // ログアウト時のリダイレクト
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 教師の場合のリダイレクト
  if (userType && userType !== 'student') {
    return <Navigate to="/teacher-home" replace />;
  }

  // 認証中の状態を表示
  if (!userType) {
    return <div>Loading...</div>;
  }

  // 生徒の場合、ページをそのまま表示
  return children;
};

export default StudentRoute;