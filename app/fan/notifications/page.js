'use client';
import FanLayout from '@/components/FanLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchNotifications(parsedUser.email);
        }
    }, []);

    const fetchNotifications = async (email) => {
        try {
            const res = await fetch(`/api/notifications?fanEmail=${email}`);
            const data = await res.json();
            if (res.ok) setNotifications(data.notifications || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleClick = async (notification) => {
        if (!notification.isRead) {
            // Mark as read
            try {
                await fetch('/api/notifications', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notificationId: notification._id })
                });
                // Update local state
                setNotifications(prev => prev.map(n =>
                    n._id === notification._id ? { ...n, isRead: true } : n
                ));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        // Navigate
        if (notification.type === 'new_post') {
            router.push(`/fan/creator?email=${notification.senderEmail}`);
        }
    };

    return (
        <FanLayout>
            <div className="max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h1>
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-gray-500">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification._id}
                                onClick={() => handleClick(notification)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${notification.isRead
                                        ? 'bg-white border-gray-200 hover:border-indigo-300'
                                        : 'bg-indigo-50 border-indigo-200 shadow-sm'
                                    } hover:shadow-md`}
                            >
                                <div className="flex items-start">
                                    <div className={`w-3 h-3 mt-1.5 rounded-full mr-4 flex-shrink-0 ${notification.isRead ? 'bg-transparent' : 'bg-indigo-500'
                                        }`} />
                                    <div>
                                        <p className="text-gray-900 font-medium">{notification.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </FanLayout>
    );
}
