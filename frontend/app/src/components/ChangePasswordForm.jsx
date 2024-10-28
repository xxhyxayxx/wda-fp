import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../features/user/userSlice';
import styles from './styles/ProfileUpdateForm.module.css';
import NavBar from './NavBar';

const ChangePasswordForm = () => {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const { status } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // バリデーションチェック
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'New password and confirmation do not match';
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      // パスワード変更アクションをディスパッチ
      await dispatch(changePassword({ current_password: currentPassword, new_password: newPassword })).unwrap();
      
      setSuccessMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Log full error response
      console.log('Full error object:', error);

      // Set error messages
      try {
        const errorData = JSON.parse(error);

        if (typeof errorData === 'object') {
          // Set error messages for each field
          const dynamicErrors = {};
          Object.entries(errorData).forEach(([key, value]) => {
            dynamicErrors[key] = Array.isArray(value) ? value.join(', ') : value;
          });
          setErrors(dynamicErrors);
        } else {
          setErrors({ form: errorData });
        }
      } catch (e) {
        console.error('Failed to parse error message:', e);
        setErrors({ form: 'Password change failed' });
      }
    }
  };

  return (
    <div>
      <NavBar />
      <div className={styles.pageContainer}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Change Password</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles.formBlock}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              {errors.current_password && <span className={styles.errorMessage}>{errors.current_password}</span>}
            </div>
            <div className={styles.formBlock}>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {errors.new_password && <span className={styles.errorMessage}>{errors.new_password}</span>}
            </div>
            <div className={styles.formBlock}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
            </div>
            {errors.form && <div role="alert" className={styles.errorMessage}>{errors.form}</div>}
            {successMessage && <div role="alert" className={styles.successMessage}>{successMessage}</div>}
            {status === 'loading' ? (
              <p>Changing password...</p>
            ) : (
              <button type="submit" className={styles.submitBtn}>
                Change Password
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
