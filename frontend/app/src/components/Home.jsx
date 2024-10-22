// Home.jsx
import React from 'react';
import LogoutButton from './LogoutButton';
import styles from './styles/Home.module.css';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <nav className={styles.navMenu}>
        <h1 className={styles.logo}>E-Learning</h1>
        <Link to="/account" className={styles.navLink}>
          Account
        </Link>
        <LogoutButton />
      </nav>
      <p>ここはログイン済みのユーザーのみが見れるコンテンツです。</p>
    </div>
  );
};

export default Home;
