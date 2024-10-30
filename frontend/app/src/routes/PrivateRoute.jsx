import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const userType = useSelector((state) => state.user.userInfo?.userType);
  const location = useLocation();

  // 未ログインの場合、ログインページにリダイレクト
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // /account へのアクセスはどのユーザータイプでも許可
  if (location.pathname === '/account') {
    return children;
  }

  // 教師の場合、教師ホームにリダイレクト
  if (userType === 'teacher' && location.pathname !== '/teacher-home') {
    return <Navigate to="/teacher-home" replace />;
  }

  // 生徒の場合、通常のホームにリダイレクト
  if (userType === 'student' && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }

  // 認証済みユーザーが適切なページにアクセスする場合
  return children;
};

export default PrivateRoute;
