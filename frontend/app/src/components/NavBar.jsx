// NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/NavBar.module.css';
import LogoutButton from './LogoutButton';

const NavBar = () => {
  return (
    <nav className={styles.navMenu}>
      <Link to="/">
        <h1 className={styles.logo}>E-Learning</h1>
      </Link>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/account">Account</Link>
        </li>
        <li>
          <LogoutButton/>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
