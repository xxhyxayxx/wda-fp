import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/user/userSlice';
import style from './styles/LogoutButton.module.css';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // 必要なら、ここで別のリダイレクト処理を追加
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={status === 'loading'}
      className={style.logoutBtn}
    >
      Log out
    </button>
  );
};

export default LogoutButton;
