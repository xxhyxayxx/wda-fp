import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';

const Home = () => {
  const userType = useSelector((state) => state.user.userInfo?.user_type);
  const navigate = useNavigate();

  useEffect(() => {
    // ユーザータイプに基づくリダイレクト
    if (userType === 'teacher') {
      navigate('/teacher-home');
    }
  }, [userType, navigate]);

  return (
    <div>
      <NavBar />
      <div>
        <p>ここはログイン済みのユーザーのみが見れるコンテンツです。</p>
      </div>
    </div>
  );
};

export default Home;
