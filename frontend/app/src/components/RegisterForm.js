import React, { useState } from 'react';

const RegisterForm = () => {
  const [errors, setErrors] = useState({});

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
      // バリデーションエラーがない場合の処理
    }
  };
  
  return (
    <form role="form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input id="email" name="email" type="email" />
        {errors.email && <span>{errors.email}</span>}
      </div>
      <div>
        <label htmlFor="password">パスワード</label>
        <input id="password" name="password" type="password" />
        {errors.password && <span>{errors.password}</span>}
      </div>
      <button type="submit">登録</button>
    </form>
  );
};

export default RegisterForm;
