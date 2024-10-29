import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const userInfo = useSelector((state) => state.user.userInfo);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // ユーザーがログインしている場合、属性に応じて遷移
  if (userInfo?.userType === 'teacher') {
    return <Navigate to="/teacher-home" />;
  }

  // 生徒の場合はそのままページを表示
  return children;
};

export default PrivateRoute;
