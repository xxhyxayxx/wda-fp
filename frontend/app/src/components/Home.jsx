// Home.jsx
import React from 'react';
import LogoutButton from './LogoutButton';
import styles from './styles/Home.module.css';

const Home = () => {
  return (
    <div>
      <nav className={styles.navMenu}>
        <h1 className={styles.logo}>E-Learning</h1>
        <LogoutButton />
      </nav>
      <p>ここはログイン済みのユーザーのみが見れるコンテンツです。</p>
    </div>
  );
};

export default Home;
