import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './styles/NavBar.module.css';
import LogoutButton from './LogoutButton';
import SearchBar from './SearchBar'; // SearchBarコンポーネントをインポート

const NavBar = () => {
    const { userInfo } = useSelector((state) => state.user);
    const { notifications } = useSelector((state) => state.notifications);

    // 未読通知の数を計算
    const unreadCount = notifications.filter((notification) => !notification.is_read).length;

    return (
        <nav className={styles.navMenu}>
            <div className={styles.leftSection}>
                <Link to="/">
                    <h1 className={styles.logo}>E-Learning</h1>
                </Link>
                {/* 検索バー */}
                <SearchBar />
            </div>
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
                        {unreadCount > 0 && (
                            <span className={styles.unreadIndicator}>
                                {unreadCount}
                            </span>
                        )}
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
