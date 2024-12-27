import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchNotifications,
    initializeWebSocket,
    closeWebSocket,
    markNotificationAsRead,
    markAsReadLocally,
} from '../features/notification/notificationSlice';
import styles from './styles/NotificationPage.module.css';

const NotificationPage = () => {
    const dispatch = useDispatch();
    const { notifications, status, error } = useSelector((state) => state.notifications);
    const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

    // Fetch notifications when component mounts
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchNotifications());
        }
        dispatch(initializeWebSocket({ url: 'ws://localhost:8000/ws/notifications/' }));

        // Cleanup WebSocket on component unmount
        return () => {
            dispatch(closeWebSocket());
        };
    }, [dispatch, status]);

    const toggleNotificationDrawer = () => {
        setNotificationDrawerOpen((prev) => !prev);
    };

    const handleNotificationClick = (notificationId) => {
        // ローカルで既読状態を即座に更新
        dispatch(markAsReadLocally(notificationId));

        // サーバーに既読状態を送信
        dispatch(markNotificationAsRead(notificationId));
    };

    return (
        <div>
            <div className={styles.notificationPageContainer}>
                <div className={styles.header}>
                    <h2>Notifications</h2>
                    <i
                        className={`fa-solid ${notificationDrawerOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                        onClick={toggleNotificationDrawer}
                        style={{ cursor: 'pointer' }}
                    ></i>
                </div>
                {notificationDrawerOpen && (
                    <div className={styles.notificationDrawer}>
                        {status === 'loading' ? (
                            <p>Loading notifications...</p>
                        ) : status === 'failed' ? (
                            <p>Error: {error}</p>
                        ) : (
                            <ul>
                                {notifications.map((notification) => (
                                    <li
                                        key={notification.id}
                                        className={`${styles.notificationItem} ${
                                            notification.is_read ? styles.read : styles.unread
                                        }`}
                                        onClick={() => handleNotificationClick(notification.id)}
                                    >
                                        <p>{notification.message}</p>
                                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPage;
