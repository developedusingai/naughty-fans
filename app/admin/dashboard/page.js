'use client';

import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboardPage() {
    return (
        <AdminLayout>
            <div className="bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl p-4 md:p-12 border border-gray-700 animate-fade-in">
                {/* Welcome Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2">
                        Welcome, Administrator! 🛡️
                    </h2>
                    <p className="text-lg text-gray-400">
                        You have full access to the Private Fan admin panel
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-2xl p-6 border border-red-700">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-lg font-semibold text-white">Total Users</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">1</p>
                        <p className="text-sm text-gray-400 mt-2">Registered accounts</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-2xl p-6 border border-purple-700">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-lg font-semibold text-white">Creators</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">0</p>
                        <p className="text-sm text-gray-400 mt-2">Content creators</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 rounded-2xl p-6 border border-indigo-700">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-lg font-semibold text-white">Fans</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">1</p>
                        <p className="text-sm text-gray-400 mt-2">Active fans</p>
                    </div>
                </div>

                {/* Admin Actions Placeholder */}
                <div className="bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-2xl p-4 md:p-8 border border-red-700/50">
                    <h3 className="text-2xl font-bold text-white mb-4">Admin Controls</h3>
                    <p className="text-gray-300 mb-6">
                        Manage users, content, and subscriptions from the sidebar navigation.
                    </p>
                    {/* Placeholder Grid Removed to clean up dashboard, navigation handles it now */}
                </div>
            </div>
        </AdminLayout>
    );
}
