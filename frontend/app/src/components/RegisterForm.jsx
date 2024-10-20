import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerUser } from '../features/user/userSlice';

const RegisterForm = () => {
  const dispatch = useDispatch();
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
        // ReduxのregisterUserアクションをディスパッチ
        await dispatch(registerUser(formData)).unwrap();
  
        // 登録成功メッセージを設定
        setSuccessMessage('登録が完了しました！');
        setErrors({});
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
          setErrors({ form: '登録に失敗しました' });
        }
      }
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
      <div>
        <label htmlFor="user_type">ユーザータイプ</label>
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
      <button type="submit">登録</button>
      {successMessage && <div role="alert">{successMessage}</div>}
      {errors.form && <div role="alert">{errors.form}</div>}
    </form>
  );
};

export default RegisterForm;
