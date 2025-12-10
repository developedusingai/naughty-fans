'use client';

import CreatorLayout from '@/components/CreatorLayout';
import { useState, useEffect } from 'react';

export default function CreatorDashboardPage() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        scubscribers: 0,
        posts: 0,
        revenue: '$0', // Keeping static as requested
        engagement: '0%' // Keeping static as requested
    });
    const [notifications, setNotifications] = useState([]);
    const [recentSubscribers, setRecentSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchDashboardData(parsedUser.email);
        }
    }, []);

    const fetchDashboardData = async (email) => {
        try {
            // Fetch Subscribers Count
            const subsRes = await fetch(`/api/subscriptions?type=subscribers&creatorEmail=${email}`);
            const subsData = await subsRes.json();
            const subscriberCount = subsData.subscribers ? subsData.subscribers.length : 0;

            // Set Recent Subscribers (Limit 10)
            if (subsData.subscribers) {
                setRecentSubscribers(subsData.subscribers.slice(0, 10));
            }

            // Fetch Posts Count
            const postsRes = await fetch(`/api/posts?creatorEmail=${email}`);
            const postsData = await postsRes.json();
            const postCount = postsData.posts ? postsData.posts.length : 0;

            setStats(prev => ({
                ...prev,
                scubscribers: subscriberCount,
                posts: postCount
            }));

            // Fetch Notifications
            const notifRes = await fetch(`/api/notifications?fanEmail=${email}`); // Reusing fanEmail param as recipientEmail
            const notifData = await notifRes.json();
            if (notifData.notifications) {
                setNotifications(notifData.notifications);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            name: 'Total Subscribers',
            value: stats.scubscribers.toString(),
            change: '+0%', // Static
            changeType: 'positive',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            name: 'Total Posts',
            value: stats.posts.toString(),
            change: '+0%', // Static
            changeType: 'positive',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            name: 'Monthly Revenue',
            value: stats.revenue,
            change: '+0%',
            changeType: 'positive',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            name: 'Engagement Rate',
            value: stats.engagement,
            change: '+0%',
            changeType: 'positive',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
        },
    ];

    return (
        <CreatorLayout>
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.fullName || 'Creator'}! 👋
                    </h1>
                    <p className="text-gray-600">Here's what's happening with your content today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat) => (
                        <div
                            key={stat.name}
                            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                                    {stat.icon}
                                </div>
                                <span
                                    className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                        }`}
                                >
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-sm text-gray-600">{stat.name}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="/creator/posts" className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Post
                        </a>
                        <a href="/creator/subscribers" className="flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Manage Subscribers
                        </a>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Notifications (Replacing Recent Posts) */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 h-96 overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 sticky top-0 bg-white pb-2 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notifications
                        </h2>
                        {notifications.length > 0 ? (
                            <div className="space-y-4">
                                {notifications.map((notif, index) => (
                                    <div key={notif._id || index} className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                                        <div className={`p-2 rounded-lg mr-3 ${notif.type === 'like' ? 'bg-pink-100 text-pink-600' :
                                                notif.type === 'subscription_request' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-gray-200 text-gray-600'
                                            }`}>
                                            {notif.type === 'like' ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 flex flex-col items-center">
                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-gray-500">No new notifications</p>
                            </div>
                        )}
                    </div>

                    {/* New Subscribers */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 h-96 overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 sticky top-0 bg-white pb-2 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            New Subscribers
                        </h2>
                        {recentSubscribers.length > 0 ? (
                            <div className="space-y-4">
                                {recentSubscribers.map((sub, index) => (
                                    <div key={sub._id || index} className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {sub.fanName?.charAt(0).toUpperCase() || 'F'}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-bold text-gray-900">{sub.fanName}</p>
                                            <p className="text-xs text-gray-500">{sub.fanEmail}</p>
                                        </div>
                                        <span className="ml-auto text-xs text-gray-400">
                                            {new Date(sub.approvedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 flex flex-col items-center">
                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                <p className="text-gray-500 mb-2">No subscribers yet</p>
                                <p className="text-sm text-gray-400 px-8">Share your profile link to start growing your community.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CreatorLayout>
    );
}
