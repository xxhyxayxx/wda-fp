import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/user/userSlice';
import { useNavigate, Link } from 'react-router-dom';

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
    
        // フォームのバリデーション
        if (!formData.email) {
            newErrors.email = 'メールアドレスは必須です';
        }
        if (!formData.password) {
            newErrors.password = 'パスワードは必須です';
        }
    
        setErrors(newErrors);
    
        if (Object.keys(newErrors).length === 0) {
            try {
                // ReduxのloginUserアクションをディスパッチ
                await dispatch(loginUser({ username: formData.email, password: formData.password })).unwrap();
                navigate('/');
                // ログイン成功メッセージを設定
                // setSuccessMessage('ログインに成功しました！');
                // setErrors({});
            } catch (error) {
                // エラーレスポンスの中身を詳細にログ出力
                console.log('Full error object:', error);
    
                // エラーメッセージの設定
                try {
                    const errorData = JSON.parse(error);
                    
                    if (typeof errorData === 'object') {
                        // 各フィールドに対応するエラーメッセージを設定
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
                    setErrors({ form: 'ログインに失敗しました' });
                }
            }
        }
    };

    return (
        <div>
        <form role="form" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">メールアドレス</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                />
                {errors.email && <span>{errors.email}</span>}
            </div>
            <div>
                <label htmlFor="password">パスワード</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                />
                {errors.password && <span>{errors.password}</span>}
            </div>
            <button type="submit">ログイン</button>
            {successMessage && <div role="alert">{successMessage}</div>}
            {errors.form && <div role="alert">{errors.form}</div>}
        </form>
        <p>未登録ですか？<Link to="/register">新規登録はこちら</Link></p>
        </div>
    );
};

export default LoginForm;
