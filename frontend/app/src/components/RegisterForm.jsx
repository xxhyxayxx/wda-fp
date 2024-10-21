import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerUser, loginUser } from '../features/user/userSlice';
import { useNavigate, Link } from 'react-router-dom';
import styles from './styles/RegisterForm.module.css';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', user_type: 'student' });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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
  
    // Form validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0) {
      try {
        // Dispatch registerUser action
        await dispatch(registerUser(formData)).unwrap();
        // Execute login process after registration
        await dispatch(loginUser({ username: formData.email, password: formData.password })).unwrap();
        navigate('/');
  
        // Set success message
        //setSuccessMessage('Registration successful!');
        //setErrors({});
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
          setErrors({ form: 'Registration failed' });
        }
      }
    }
  };
  

  return (
    <div className={styles.pageContainer}>
    <div className={styles.formContainer}> 
    <form role="form" onSubmit={handleSubmit}>
      <div className={styles.formBlock}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
      </div>
      <div className={styles.formBlock}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
        />
        {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
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
      <button type="submit">Register</button>
      {successMessage && <div role="alert">{successMessage}</div>}
      {errors.form && <div role="alert">{errors.form}</div>}
    </form>
    <p>Already registered? <Link to="/login" className={styles.link}>Login here</Link></p>
    </div>
    </div>
  );
};

export default RegisterForm;
