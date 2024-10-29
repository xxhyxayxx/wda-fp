import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser, fetchProfile } from '../features/user/userSlice';
import { useNavigate, Link } from 'react-router-dom';
import styles from './styles/RegisterLoginForm.module.css';

const LoginForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
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
                // Dispatch loginUser action
                await dispatch(loginUser({ username: formData.email, password: formData.password })).unwrap();
                await dispatch(fetchProfile()).unwrap();
                navigate('/');
            } catch (error) {
                console.log('Full error object:', error);
            
                // エラーメッセージをパース
                try {
                    const errorData = JSON.parse(error);
            
                    if (typeof errorData === 'object') {
                        // 'non_field_errors' を個別に処理
                        if (errorData.non_field_errors) {
                            setErrors({ form: 'The email or password you entered is incorrect.' });
                        } else {
                            // 各フィールドのエラーメッセージを設定
                            const dynamicErrors = {};
                            Object.entries(errorData).forEach(([key, value]) => {
                                dynamicErrors[key] = Array.isArray(value) ? value.join(', ') : value;
                            });
                            setErrors(dynamicErrors);
                        }
                    } else {
                        setErrors({ form: errorData });
                    }
                } catch (e) {
                    console.error('Failed to parse error message:', e);
                    setErrors({ form: 'Login failed. Please try again.' });
                }
            }
            
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>WELCOME</h1>
    
                {/* Display form error below the logo */}
                {errors.form && (
                    <div role="alert" className={styles.errorMessage} style={{ marginBottom: '1rem' }}>
                        {errors.form}
                    </div>
                )}
    
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
                    <div>
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
                    <button type="submit" className={styles.submitBtn}>Login</button>
                    {successMessage && <div role="alert">{successMessage}</div>}
                </form>
                <p>Not registered? <Link to="/register">Register here</Link></p>
            </div>
        </div>
    );
    
};

export default LoginForm;
