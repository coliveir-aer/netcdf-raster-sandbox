// /src/contexts/NotificationContext.jsx
import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';

const NotificationContext = createContext();

export const useNotifier = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Only set a timeout for non-error notifications
        if (type !== 'error') {
            setTimeout(() => {
                removeNotification(id);
            }, 5000); // Notification disappears after 5 seconds
        }
    }, [removeNotification]);

    const notifier = useMemo(() => ({
        info: (message) => addNotification(message, 'info'),
        success: (message) => addNotification(message, 'success'),
        error: (message) => addNotification(message, 'error'),
    }), [addNotification]);

    return (
        <NotificationContext.Provider value={notifier}>
            {children}
            <NotificationContainer notifications={notifications} onClose={removeNotification} />
        </NotificationContext.Provider>
    );
};

// The container component now passes the onClose handler
const NotificationContainer = ({ notifications, onClose }) => {
    return (
        <div className="notification-container">
            {notifications.map(n => (
                <NotificationToast key={n.id} notification={n} onClose={onClose} />
            ))}
        </div>
    );
};

// A dedicated component for the toast makes adding a button easier
const NotificationToast = ({ notification, onClose }) => {
    return (
        <div className={`notification-toast notification-${notification.type}`}>
            <div className="notification-message">{notification.message}</div>
            {notification.type === 'error' && (
                <button className="notification-close-btn" onClick={() => onClose(notification.id)}>
                    &times;
                </button>
            )}
        </div>
    );
};