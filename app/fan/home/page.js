'use client';

import FanLayout from '@/components/FanLayout';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SubscriptionModal from '@/components/SubscriptionModal';

export default function FanHomePage() {
    const [posts, setPosts] = useState([]);
    const [creators, setCreators] = useState([]);
    const [user, setUser] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState({}); // Track subscription status per creator
    const [selectedCreatorForSub, setSelectedCreatorForSub] = useState(null);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchPosts(parsedUser.email);
            fetchCreators(parsedUser.email);
        }
    }, []);

    const fetchPosts = async (fanEmail) => {
        try {
            // Fetch posts only from subscribed creators
            const response = await fetch(`/api/posts/feed?fanEmail=${fanEmail}`);
            const data = await response.json();
            if (response.ok) {
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchCreators = async (fanEmail) => {
        try {
            const response = await fetch('/api/creators');
            const data = await response.json();
            if (response.ok) {
                setCreators(data.creators || []);
                // Check subscription status for each creator
                await checkSubscriptionStatus(fanEmail, data.creators);
            }
        } catch (error) {
            console.error('Error fetching creators:', error);
        }
    };

    const checkSubscriptionStatus = async (fanEmail, creatorsList) => {
        // Check subscription status for each creator
        const statusPromises = creatorsList.map(async (creator) => {
            try {
                const response = await fetch(
                    `/api/subscriptions/status?fanEmail=${fanEmail}&creatorEmail=${creator.email}`
                );
                const data = await response.json();
                return {
                    creatorEmail: creator.email,
                    status: data.status,
                };
            } catch (error) {
                console.error('Error checking status for creator:', creator.email, error);
                return {
                    creatorEmail: creator.email,
                    status: null,
                };
            }
        });

        const statuses = await Promise.all(statusPromises);

        // Update subscription status state
        const statusMap = {};
        statuses.forEach(({ creatorEmail, status }) => {
            if (status) {
                statusMap[creatorEmail] = status;
            }
        });

        setSubscriptionStatus(statusMap);
    };

    const handleSubscribeClick = (creatorEmail) => {
        const creator = creators.find(c => c.email === creatorEmail);
        if (creator) {
            setSelectedCreatorForSub(creator);
            setIsSubModalOpen(true);
        }
    };

    const confirmSubscribe = async () => {
        if (!selectedCreatorForSub) return;

        try {
            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fanEmail: user.email,
                    fanName: user.fullName,
                    creatorEmail: selectedCreatorForSub.email,
                }),
            });

            const data = await response.json();

            if (response.ok || response.status === 409) {
                // Update local state
                setSubscriptionStatus(prev => ({
                    ...prev,
                    [selectedCreatorForSub.email]: data.status || 'pending'
                }));
                setIsSubModalOpen(false);
                alert('Subscription request sent! Please wait for admin approval.');
            } else {
                alert(data.error || 'Failed to send subscription request');
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('Failed to send subscription request');
        }
    };

    const handleLike = async (postId) => {
        if (!user) return;

        // Optimistic update
        setPosts(currentPosts => currentPosts.map(post => {
            if (post._id === postId) {
                const isLiked = !post.isLiked;
                return {
                    ...post,
                    isLiked,
                    likes: isLiked ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 1) - 1)
                };
            }
            return post;
        }));

        try {
            await fetch('/api/posts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, fanEmail: user.email })
            });
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    return (
        <FanLayout>
            <div className="flex">
                {/* Center Feed */}
                <div className="flex-1 max-w-2xl mx-auto px-4 py-6">


                    {/* Posts Feed */}
                    <div className="space-y-6">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div key={post._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                    {/* Post Header */}
                                    <div className="flex items-center p-4">
                                        <Link href={`/fan/creator?email=${post.creatorEmail}`} className="flex items-center hover:opacity-80 transition-opacity">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center overflow-hidden relative">
                                                {post.creatorProfileImage ? (
                                                    <Image
                                                        src={post.creatorProfileImage}
                                                        alt={post.creatorName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white font-semibold text-sm">
                                                        {post.creatorName?.charAt(0).toUpperCase() || 'C'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-semibold text-gray-900">{post.creatorName}</p>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Post Image */}
                                    {post.imageUrl && (
                                        <div className="relative w-full aspect-square bg-gray-100">
                                            <Image
                                                src={post.imageUrl}
                                                alt={post.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Post Actions */}
                                    <div className="p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className={`${post.isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'} transition-colors`}
                                            >
                                                <svg className="w-6 h-6" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </button>
                                            <span className="text-sm font-semibold text-gray-900">{post.likes || 0} likes</span>
                                        </div>

                                        <div className="text-sm font-medium text-gray-900">
                                            {post.title}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                                <p className="text-gray-500">Follow creators to see their posts in your feed</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Creator Recommendations */}
                <div className="hidden xl:block w-80 px-4 py-6">
                    <div className="sticky top-6">
                        {/* User Profile Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                        {user?.fullName?.charAt(0).toUpperCase() || 'F'}
                                    </span>
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Suggested Creators */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900">Suggested for you</h3>
                                <Link href="/fan/explore" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                                    See All
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {creators.filter(c => subscriptionStatus[c.email] !== 'approved').length > 0 ? (
                                    creators
                                        .filter(c => subscriptionStatus[c.email] !== 'approved')
                                        .slice(0, 5)
                                        .map((creator, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <Link href={`/fan/creator?email=${creator.email}`} className="flex items-center flex-1 min-w-0 hover:opacity-80 transition-opacity">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-semibold text-sm">
                                                            {creator.fullName?.charAt(0).toUpperCase() || 'C'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3 flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {creator.fullName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">Creator</p>
                                                    </div>
                                                </Link>
                                                <button
                                                    onClick={() => handleSubscribeClick(creator.email)}
                                                    disabled={subscriptionStatus[creator.email] === 'pending' || subscriptionStatus[creator.email] === 'approved'}
                                                    className={`ml-2 text-xs font-semibold flex-shrink-0 px-3 py-1 rounded-lg transition-colors ${subscriptionStatus[creator.email] === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                                                        : subscriptionStatus[creator.email] === 'approved'
                                                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                            : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                                                        }`}
                                                >
                                                    {subscriptionStatus[creator.email] === 'pending'
                                                        ? 'Pending'
                                                        : subscriptionStatus[creator.email] === 'approved'
                                                            ? 'Subscribed'
                                                            : 'Subscribe'}
                                                </button>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No creators to suggest</p>
                                )}
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="mt-6 px-4">
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                                <a href="#" className="hover:underline">About</a>
                                <span>·</span>
                                <a href="#" className="hover:underline">Help</a>
                                <span>·</span>
                                <a href="#" className="hover:underline">Privacy</a>
                                <span>·</span>
                                <a href="#" className="hover:underline">Terms</a>
                            </div>
                            <p className="text-xs text-gray-400">© 2024 Naughty Fans</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={isSubModalOpen}
                onClose={() => setIsSubModalOpen(false)}
                creator={selectedCreatorForSub}
                onConfirm={confirmSubscribe}
            />
        </FanLayout>
    );
}
