import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { markNotificationAsRead } from '../features/notification/notificationSlice';
import styles from './styles/NotificationDetailPage.module.css';

const NotificationDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const notifications = useSelector((state) => state.notifications.notifications);

    const notification = notifications.find((n) => n.id === parseInt(id));

    useEffect(() => {
        if (notification && !notification.is_read) {
            dispatch(markNotificationAsRead(notification.id));
        }
    }, [dispatch, notification]);

    if (!notification) {
        return <p>Notification not found.</p>;
    }

    return (
        <div className={styles.notificationDetailPage}>
            <h2>{notification.title}</h2>
            <p>{notification.message}</p>
            <span>{new Date(notification.created_at).toLocaleString()}</span>
        </div>
    );
};

export default NotificationDetailPage;
