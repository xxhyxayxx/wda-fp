import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/user/userSlice';
import style from './styles/LogoutButton.module.css';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const [logoutMessage, setLogoutMessage] = useState('');
  const { status } = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setLogoutMessage('Logout successful!');
    } catch (error) {
      setLogoutMessage('Failed to log out');
    }
  };

  return (
    <div>
      <button onClick={handleLogout} disabled={status === 'loading'} className={style.logoutBtn}>
        Log out
      </button>
      {logoutMessage && <div role="alert">{logoutMessage}</div>}
    </div>
  );
};

export default LogoutButton;
