// Home.jsx
import React from 'react';
import LogoutButton from './LogoutButton';

const Home = () => {
  return (
    <div>
      <nav>
        <LogoutButton />
      </nav>
      <h1>ホームページへようこそ！</h1>
      <p>ここはログイン済みのユーザーのみが見れるコンテンツです。</p>
    </div>
  );
};

export default Home;
