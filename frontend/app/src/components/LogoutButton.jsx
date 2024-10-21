import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/user/userSlice';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const [logoutMessage, setLogoutMessage] = useState('');
  const { status } = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setLogoutMessage('ログアウトが完了しました！');
    } catch (error) {
      setLogoutMessage('ログアウトに失敗しました');
    }
  };

  return (
    <div>
      <button onClick={handleLogout} disabled={status === 'loading'}>
        ログアウト
      </button>
      {logoutMessage && <div role="alert">{logoutMessage}</div>}
    </div>
  );
};

export default LogoutButton;
