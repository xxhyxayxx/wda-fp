import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchProfile } from '../features/user/userSlice';
import { useNavigate, Link } from 'react-router-dom';
import styles from './styles/RegisterLoginForm.module.css';

const LoginForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userType = useSelector((state) => state.user.userInfo?.userType); // 修正：トップレベルで呼び出し

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

        // フォームのバリデーション
        if (!formData.email) {
            newErrors.email = 'Email is required';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                // ログインでトークンを取得
                await dispatch(loginUser({ username: formData.email, password: formData.password })).unwrap();

                const profileData = await dispatch(fetchProfile()).unwrap();
                console.log('Profile Data after fetchProfile:', profileData);

                // ユーザータイプに基づくリダイレクト
                if (userType === 'teacher') {
                    navigate('/teacher-home');
                } else {
                    navigate('/');
                }

            } catch (error) {
                console.log('Full error object:', error);

                // エラーメッセージの処理
                try {
                    const errorData = JSON.parse(error);
                    if (typeof errorData === 'object') {
                        if (errorData.non_field_errors) {
                            setErrors({ form: 'The email or password you entered is incorrect.' });
                        } else {
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

                {/* エラーメッセージを表示 */}
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
