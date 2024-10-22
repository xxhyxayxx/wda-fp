import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, fetchProfile } from '../features/user/userSlice';
import styles from './styles/ProfileUpdateForm.module.css';
import NavBar from './NavBar';

const ProfileUpdateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, status, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({ name: '', user_type: 'student' });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [previousFileName, setPreviousFileName] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // フォーム送信状態を管理するフラグ

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || '',
        user_type: userInfo.user_type || 'student',
      });
      if (userInfo.profile_image) {
        setPreviewImage(userInfo.profile_image);

        const splitUrl = userInfo.profile_image.split('/');
        const originalFileName = splitUrl[splitUrl.length - 1];
        const truncatedFileName = 
          originalFileName.length > 20 ? `${originalFileName.slice(0, 17)}...` : originalFileName;

        setPreviousFileName(truncatedFileName);
      }
    }
  }, [userInfo]);

  useEffect(() => {
    if (status === 'succeeded' && isSubmitting) { // 送信後にのみ成功メッセージをセット
      setSuccessMessage('Profile updated successfully');
      setErrors({});
      setIsSubmitting(false); // フォーム送信状態をリセット
    }
  }, [status, isSubmitting]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setFileName(file.name.length > 20 ? `${file.name.slice(0, 17)}...` : file.name);
    } else {
      setFileName('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    setSuccessMessage(''); // フォーム送信時に成功メッセージをリセット

    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true); // フォーム送信状態をセット
        const updatedData = new FormData();
        updatedData.append('name', formData.name);
        updatedData.append('user_type', formData.user_type);
        if (profileImage) {
          updatedData.append('profile_image', profileImage);
        }

        await dispatch(updateProfile(updatedData)).unwrap();
        setErrors({});
      } catch (err) {
        setErrors({ form: err.message });
        setIsSubmitting(false); // エラー時に送信状態をリセット
      }
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage}>Error: {error}</p>;
  }

  return (
    <div>
      <NavBar />
      <div className={styles.pageContainer}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Update Profile</h1>
          <form role="form" onSubmit={handleSubmit}>
            <div className={styles.formBlock}>
              {previewImage && (
                <div className={styles.imagePreview}>
                  <img src={previewImage} alt="Profile Preview" />
                </div>
              )}
              <div className={styles.imageUploadContainer}>
                {fileName && (
                  <span className={styles.fileName}>{fileName}</span>
                )}
                {previousFileName && !fileName && (
                  <span className={styles.fileName}>{previousFileName}</span>
                )}
                <label htmlFor="profile_image" className={styles.customFileUpload}>
                  Choose Image
                </label>
                <input
                  id="profile_image"
                  name="profile_image"
                  type="file"
                  onChange={handleImageChange}
                  className={styles.hiddenFileInput}
                />
              </div>
            </div>

            <div className={styles.formBlock}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={handleInputChange}
              />
              {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
            </div>
            <div className={styles.formBlock}>
              <label htmlFor="user_type">User Type</label>
              <select
                id="user_type"
                name="user_type"
                value={formData.user_type || 'student'}
                onChange={handleInputChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <button type="submit" className={styles.submitBtn}>Update</button>
            {errors.form && <div role="alert" className={styles.errorMessage}>{errors.form}</div>}
            {successMessage && <div role="alert" className={styles.successMessage}>{successMessage}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;
