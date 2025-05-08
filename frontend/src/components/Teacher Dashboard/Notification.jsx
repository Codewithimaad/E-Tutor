import React, { useContext, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { UserContext } from '../../context/userContextApi';
import axios from 'axios';

const Notification = () => {
    const { token, user, notifications, setNotifications, fetchNotifications, backendUrl } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchNotifications();
            setLoading(false);
        };
        if (user?.role === 'teacher') load();
    }, [user]);

    const markAllAsRead = async () => {
        try {
            await axios.put(`${backendUrl}api/notification/mark-read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark notifications as read:', err);
        }
    };

    const clearNotifications = async () => {
        try {
            await axios.delete(`${backendUrl}api/notification/clear`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications([]);
        } catch (err) {
            console.error('Failed to clear notifications:', err);
        }
    };

    const toggleDropdown = () => setShowDropdown(prev => !prev);
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="relative p-2 rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-100">
                    <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <div className="flex space-x-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearNotifications}
                                    className="text-gray-500 text-xs font-medium hover:text-gray-700 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-6 text-center">
                                <div className="animate-pulse flex flex-col space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                </div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((n, index) => (
                                <div
                                    key={index}
                                    className={`p-4 border-b border-gray-100 last:border-0 transition-colors ${!n.read ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    <p className={`text-sm ${!n.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                        {n.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;