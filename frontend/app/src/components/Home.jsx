// Home.jsx
import React from 'react';
import NavBar from './NavBar';

const Home = () => {
  return (
    <div>
      <NavBar />
      <div>
        <p>ここはログイン済みのユーザーのみが見れるコンテンツです。</p>
      </div>
    </div>
  );
};

export default Home;
