import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './styles/NavBar.module.css';
import LogoutButton from './LogoutButton';

const NavBar = () => {
    const { userInfo } = useSelector((state) => state.user);

    // userInfoの内容をコンソールに出力
    //console.log('NavBar - userInfo:', userInfo);

    return (
        <nav className={styles.navMenu}>
            <Link to="/">
                <h1 className={styles.logo}>E-Learning</h1>
            </Link>
            <ul className={styles.navLinks}>
                {userInfo?.user_type === 'teacher' && ( // user_type が 'teacher' の場合のみ表示
                    <li>
                        <Link to="/courses" className={styles.navLink}>
                            Courses
                        </Link>
                    </li>
                )}
                <li>
                    <Link to="/account" className={styles.profileLink}>
                        {userInfo?.profile_image && (
                            <img
                                src={userInfo.profile_image}
                                alt="Profile"
                                className={styles.profileImage}
                            />
                        )}
                    </Link>
                </li>
                <li>
                    <LogoutButton />
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
