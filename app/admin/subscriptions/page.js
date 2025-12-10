'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch('/api/subscriptions?type=all');
            const data = await res.json();
            if (res.ok) {
                setSubscriptions(data.subscriptions || []);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (fanEmail, creatorEmail, action) => {
        const confirmMessage = action === 'unsubscribe'
            ? 'Are you sure you want to unsubscribe this user?'
            : `Are you sure you want to ${action} this subscription?`;

        if (!confirm(confirmMessage)) return;

        try {
            let res;
            if (action === 'unsubscribe') {
                // Use DELETE for unsubscribing
                res = await fetch(`/api/subscriptions?fanEmail=${fanEmail}&creatorEmail=${creatorEmail}`, {
                    method: 'DELETE',
                });
            } else {
                // Use PATCH for approve/reject
                res = await fetch('/api/subscriptions', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fanEmail, creatorEmail, action }),
                });
            }

            if (res.ok) {
                fetchSubscriptions();
            } else {
                const data = await res.json();
                alert(data.error || 'Action failed');
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('Action failed');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Process Subscription</h1>
                <p className="text-gray-400">Manage all subscription requests and statuses.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-700/50 text-gray-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Fan</th>
                                <th className="px-6 py-4">Creator</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Loading subscriptions...
                                    </td>
                                </tr>
                            ) : subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No subscription requests found.
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            <div>{sub.fanName || sub.fanEmail}</div>
                                            <div className="text-xs text-gray-500">{sub.fanEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.creatorEmail}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.status === 'approved'
                                                ? 'bg-green-900/50 text-green-400'
                                                : sub.status === 'pending'
                                                    ? 'bg-yellow-900/50 text-yellow-400'
                                                    : 'bg-red-900/50 text-red-400'
                                                }`}>
                                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(sub.requestedAt || sub.approvedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {sub.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(sub.fanEmail, sub.creatorEmail, 'approve')}
                                                        className="px-3 py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(sub.fanEmail, sub.creatorEmail, 'reject')}
                                                        className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {sub.status === 'approved' && (
                                                <button
                                                    onClick={() => handleAction(sub.fanEmail, sub.creatorEmail, 'unsubscribe')}
                                                    className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    Unsubscribe
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
