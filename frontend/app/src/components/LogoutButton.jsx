import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/user/userSlice';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const [logoutMessage, setLogoutMessage] = useState('');
  const { status } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    setLogoutMessage('ログアウトが完了しました！');
    console.log('ログアウトが完了しました！');
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
