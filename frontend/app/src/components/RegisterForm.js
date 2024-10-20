// RegisterForm.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../features/user/userSlice';

const RegisterForm = () => {
  const dispatch = useDispatch();
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const { email, password } = event.target.elements;
    const newErrors = {};

    if (!email.value) {
      newErrors.email = 'メールアドレスは必須です';
    }
    if (!password.value) {
      newErrors.password = 'パスワードは必須です';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      dispatch(register({ email: email.value, password: password.value }));
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
      <button type="submit">登録</button>
      {successMessage && <div role="alert">{successMessage}</div>}
    </form>
  );
};

export default RegisterForm;
