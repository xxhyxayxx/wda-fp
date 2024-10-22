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
  const [formData, setFormData] = useState({ name: '', email: '', user_type: 'student' });
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
    if (status === 'succeeded' && isSubmitting) {
      setSuccessMessage('Profile updated successfully');
      setErrors({});
      setIsSubmitting(false);
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
        updatedData.append('user_type', formData.user_type);
        if (profileImage) {
          updatedData.append('profile_image', profileImage);
        }
  
        // プロフィールの更新をディスパッチ
        await dispatch(updateProfile(updatedData)).unwrap();
        setErrors({});
        setSuccessMessage('Profile updated successfully');
      } catch (error) {
        // Log full error response
        console.log('Full error object:', error);
  
        // error.messageを詳細にログ出力
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
          
        } catch (parseError) {
          console.error('Failed to parse error message:', parseError);
          setErrors({ form: 'Profile update failed' });
        }
        setIsSubmitting(false);
      }
    }
  };
  

  if (status === 'loading') {
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
