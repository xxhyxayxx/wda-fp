import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
    const userInfo = useSelector((state) => state.user.userInfo);

    // ログイン済みの場合はホームページにリダイレクト
    if (userInfo) {
        return <Navigate to="/" />;
    }

    // 未ログインの場合はコンテンツを表示
    return children;
};

export default PublicRoute;
