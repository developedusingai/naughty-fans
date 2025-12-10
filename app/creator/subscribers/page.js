'use client';

import CreatorLayout from '@/components/CreatorLayout';
import { useState, useEffect } from 'react';

export default function SubscribersPage() {
    const [user, setUser] = useState(null);
    const [approvedSubscribers, setApprovedSubscribers] = useState([]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchSubscribers(parsedUser.email);
        }
    }, []);

    const fetchSubscribers = async (creatorEmail) => {
        try {
            const response = await fetch(`/api/subscriptions?type=subscribers&creatorEmail=${creatorEmail}`);
            const data = await response.json();
            if (response.ok) {
                setApprovedSubscribers(data.subscribers || []);
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        }
    };

    return (
        <CreatorLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Subscribers</h1>
                    <p className="text-gray-600">
                        View your active subscriber base
                        {approvedSubscribers.length > 0 && (
                            <span className="ml-2 text-indigo-600 font-semibold">
                                • {approvedSubscribers.length} Active
                            </span>
                        )}
                    </p>
                </div>

                {/* Subscribers List */}
                <div className="bg-white rounded-2xl border border-gray-200">
                    {approvedSubscribers.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {approvedSubscribers.map((subscriber) => (
                                <div key={subscriber._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {subscriber.fanDetails?.fullName?.charAt(0).toUpperCase() || 'F'}
                                                </span>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-semibold text-gray-900">
                                                    {subscriber.fanDetails?.fullName || 'Unknown Fan'}
                                                </h3>
                                                <p className="text-xs text-gray-500">{subscriber.fanEmail}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Subscribed {subscriber.approvedAt ? new Date(subscriber.approvedAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscribers yet</h3>
                            <p className="text-gray-500">When users subscribe to you, they will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </CreatorLayout>
    );
}
