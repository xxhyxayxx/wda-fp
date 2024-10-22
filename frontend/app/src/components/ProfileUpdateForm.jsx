import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, fetchProfile } from '../features/user/userSlice';
import styles from './styles/ProfileUpdateForm.module.css';

const ProfileUpdateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, status, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({ name: '', user_type: 'student' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userInfo) {
      setFormData({ name: userInfo.name, user_type: userInfo.user_type });
    } else {
      dispatch(fetchProfile());
    }
  }, [userInfo, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await dispatch(updateProfile(formData)).unwrap();
        setErrors({ form: 'Profile updated successfully' });
        // navigate('/profile');  // 成功メッセージを確認後にリダイレクトしたい場合はこの行をコメントアウト解除
      } catch (err) {
        setErrors({ form: err.message });
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Update Profile</h1>
        <form role="form" onSubmit={handleSubmit}>
          <div className={styles.formBlock}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>
          <div className={styles.formBlock}>
            <label htmlFor="user_type">User Type</label>
            <select
              id="user_type"
              name="user_type"
              value={formData.user_type}
              onChange={handleInputChange}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <button type="submit" className={styles.submitBtn}>Update</button>
          {errors.form && <div role="alert" className={styles.errorMessage}>{errors.form}</div>}
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;
