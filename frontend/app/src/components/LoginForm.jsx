import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/user/userSlice';

const LoginForm = () => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const { status, error, isLoggedIn } = useSelector((state) => state.user);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // 修正箇所
    const handleSubmit = (event) => {
        event.preventDefault();
        const { email, password } = formData;
        const newErrors = {};

        if (!email) {
            newErrors.email = 'メールアドレスは必須です';
        }
        if (!password) {
            newErrors.password = 'パスワードは必須です';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // emailフィールドをusernameに変更して送信
            dispatch(loginUser({ username: email, password }));
        }
    };


    return (
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
            {status === 'loading' && <div>ログイン中...</div>}
            {status === 'failed' && <div role="alert">エラー: {error}</div>}
            {isLoggedIn && <div role="alert">ログインに成功しました！</div>}
        </form>
    );
};

export default LoginForm;
