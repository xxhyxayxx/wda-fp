import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../features/user/userSlice';
import styles from './styles/ChangePasswordForm.module.css';

const ChangePasswordForm = () => {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const { status, error: changeError } = useSelector((state) => state.user);

  const handleSubmit = (e) => {
    e.preventDefault();

    // バリデーションチェック
    if (newPassword !== confirmPassword) {
      setError('新しいパスワードと確認用パスワードが一致しません');
      return;
    }

    // パスワード変更アクションをディスパッチ
    dispatch(changePassword({ current_password: currentPassword, new_password: newPassword }));
  };

  return (
    <div className={styles.container}>
      <h2>パスワード変更</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="currentPassword">現在のパスワード</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="newPassword">新しいパスワード</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="confirmPassword">新しいパスワード（確認用）</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {changeError && <p className={styles.error}>{changeError}</p>}
        {status === 'loading' ? (
          <p>パスワードを変更中...</p>
        ) : (
          <button type="submit" className={styles.button}>
            パスワードを変更する
          </button>
        )}
      </form>
    </div>
  );
};

export default ChangePasswordForm;
