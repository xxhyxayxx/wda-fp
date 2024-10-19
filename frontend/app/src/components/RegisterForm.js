// src/components/RegisterForm.js
import React from 'react';

const RegisterForm = () => {
  return (
    <form>
      <div>
        <label htmlFor="username">ユーザー名</label>
        <input type="text" id="username" name="username" />
      </div>
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input type="email" id="email" name="email" />
      </div>
      <div>
        <label htmlFor="password">パスワード</label>
        <input type="password" id="password" name="password" />
      </div>
      <button type="submit">登録</button>
    </form>
  );
};

export default RegisterForm;
