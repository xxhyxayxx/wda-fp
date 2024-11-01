import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { updateProfile, fetchProfile, resetStatus } from '../features/user/userSlice';
import styles from './styles/ProfileUpdateForm.module.css';
import NavBar from './NavBar';

const ProfileUpdateForm = () => {
  const dispatch = useDispatch();
  const { userInfo, status, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [previousFileName, setPreviousFileName] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || '',
        email: userInfo.email || '',
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
    console.log('Current status:', status); // 現在のstatusを出力
  
    if (status === 'succeeded') {
      setSuccessMessage('Profile updated successfully');
      setErrors({});
      setIsSubmitting(false);
  
      // 成功メッセージが表示された後にstatusをidleにリセット
      setTimeout(() => {
        dispatch(resetStatus());
        console.log('Status after reset dispatched');
      }, 1000); // 1秒待ってからリセット
    }
  }, [status, dispatch]);

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
  
    // フォームのバリデーション
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
  
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        const updatedData = new FormData();
        updatedData.append('name', formData.name);
        updatedData.append('email', formData.email);
        if (profileImage) {
          updatedData.append('profile_image', profileImage);
        }
  
        // プロフィールの更新をディスパッチ
        await dispatch(updateProfile(updatedData)).unwrap();
        
        // 成功メッセージの設定
        setSuccessMessage('Profile updated successfully');
        setErrors({});
      } catch (error) {
        console.error('Full error object:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // statusがloadingの時だけ表示するように変更
  if (status === 'loading' && !isSubmitting) {
    return <p>Loading...</p>;
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
                  <img src={previewImage} alt="Profile" />
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
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
            </div>

            <div className={styles.formBlock}>
              <Link to="/change-password" className={styles.changePasswordLink}>
                Change Password
              </Link>
            </div>
            <button type="submit" className={styles.submitBtn}>Update</button>
            {errors.form && <div role="alert" className={styles.errorMessage}>{errors.form}</div>}
            {successMessage && (
              <div className={styles.successMessage} data-testid="success-message">
                {successMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;
