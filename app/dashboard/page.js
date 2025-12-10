'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/');
            return;
        }
        const parsedUser = JSON.parse(userData);

        // Redirect creators to their specific dashboard
        if (parsedUser.userType === 'creator') {
            router.push('/creator/dashboard');
            return;
        }

        // Redirect fans to their home page
        if (parsedUser.userType === 'fan') {
            router.push('/fan/home');
            return;
        }

        setUser(parsedUser);
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navigation Bar */}
            <nav className="relative bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl shadow-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                                Private Fan
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-pink-600 rounded-lg hover:from-indigo-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 animate-fade-in">
                    {/* Welcome Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
                            {user?.userType === 'creator' ? (
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome, {user?.fullName || user?.email}! 👋
                        </h2>
                        <p className="text-lg text-gray-600">
                            You're logged in as a <span className="font-semibold text-indigo-600 capitalize">{user?.userType}</span>
                        </p>
                    </div>

                    {/* User Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="ml-4 text-lg font-semibold text-gray-900">Account Details</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Name:</span> {user?.fullName}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Email:</span> {user?.email}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Account Type:</span> <span className="capitalize">{user?.userType}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="ml-4 text-lg font-semibold text-gray-900">Quick Stats</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Status:</span> <span className="text-green-600">Active</span>
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Member Since:</span> {new Date().toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Profile:</span> Complete
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Coming Soon Section */}
                    <div className="bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-2xl font-bold mb-2">Dashboard Coming Soon! 🚀</h3>
                        <p className="text-indigo-100 mb-6">
                            We're working hard to bring you an amazing {user?.userType} experience.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p className="text-sm font-medium">Content Management</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p className="text-sm font-medium">Analytics</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p className="text-sm font-medium">Messaging</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p className="text-sm font-medium">Subscriptions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
