import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './styles/NavBar.module.css';
import LogoutButton from './LogoutButton';

const NavBar = () => {
    const { userInfo } = useSelector((state) => state.user);
    const { notifications } = useSelector((state) => state.notifications);

    // 未読通知があるかを確認
    const hasUnreadNotifications = notifications.some((notification) => !notification.is_read);

    return (
        <nav className={styles.navMenu}>
            <Link to="/">
                <h1 className={styles.logo}>E-Learning</h1>
            </Link>
            <ul className={styles.navLinks}>
                {/* Teacher用リンク */}
                {userInfo?.user_type === 'teacher' && (
                    <li>
                        <Link to="/courses" className={styles.navLink}>
                            Courses
                        </Link>
                    </li>
                )}
                {/* Student用リンク */}
                {userInfo?.user_type === 'student' && (
                    <li>
                        <Link to="/student-courses" className={styles.navLink}>
                            Courses
                        </Link>
                    </li>
                )}
                {/* 通知リンク */}
                <li className={styles.notificationLink}>
                    <Link to="/notifications" className={styles.navLink}>
                        Notifications
                        {hasUnreadNotifications && <span className={styles.unreadIndicator}></span>}
                    </Link>
                </li>
                {/* プロフィールリンク */}
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
                {/* ログアウトボタン */}
                <li>
                    <LogoutButton />
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
