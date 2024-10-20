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

  const handleSubmit = (event) => {
    event.preventDefault();
    const { email, password, user_type } = event.target.elements;
    const newErrors = {};

    if (!email.value) {
      newErrors.email = 'メールアドレスは必須です';
    }
    if (!password.value) {
      newErrors.password = 'パスワードは必須です';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      dispatch(registerUser({
        email: email.value,
        password: password.value,
        user_type: user_type.value,
      }));
      setSuccessMessage('登録が完了しました！');
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
    </form>
  );
};

export default RegisterForm;
