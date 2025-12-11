'use client';

import FanLayout from '@/components/FanLayout';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import SubscriptionModal from '@/components/SubscriptionModal';

function CreatorProfileContent() {
    const searchParams = useSearchParams();
    const creatorEmail = searchParams.get('email');

    const [user, setUser] = useState(null);
    const [creator, setCreator] = useState(null);
    const [posts, setPosts] = useState([]);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            if (creatorEmail) {
                fetchCreator();
                checkSubscriptionStatus(parsedUser.email);
                fetchCreatorPosts(parsedUser.email);
            }
        }
    }, [creatorEmail]);

    const fetchCreator = async () => {
        try {
            const response = await fetch(`/api/creators?email=${creatorEmail}`);
            const data = await response.json();
            if (response.ok && data.creator) {
                setCreator(data.creator);
            }
        } catch (error) {
            console.error('Error fetching creator:', error);
        }
    };

    const checkSubscriptionStatus = async (fanEmail) => {
        try {
            const response = await fetch(
                `/api/subscriptions/status?fanEmail=${fanEmail}&creatorEmail=${creatorEmail}`
            );
            const data = await response.json();
            if (response.ok) {
                setSubscriptionStatus(data.status);
            }
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    };

    const fetchCreatorPosts = async (fanEmail) => {
        try {
            const response = await fetch(`/api/posts?creatorEmail=${creatorEmail}&fanEmail=${fanEmail}`);
            const data = await response.json();
            if (response.ok) {
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleSubscribeClick = () => {
        setIsSubscribeModalOpen(true);
    };

    const confirmSubscribe = async () => {
        try {
            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fanEmail: user.email,
                    fanName: user.fullName,
                    creatorEmail,
                }),
            });

            const data = await response.json();

            if (response.ok || response.status === 409) {
                setSubscriptionStatus(data.status || 'pending');
                setIsSubscribeModalOpen(false);
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

        // Optimistic update for both posts list and selectedPost
        const updateLikeState = (post) => {
            if (post._id === postId) {
                const isLiked = !post.isLiked;
                return {
                    ...post,
                    isLiked,
                    likes: isLiked ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 1) - 1)
                };
            }
            return post;
        };

        setPosts(currentPosts => currentPosts.map(updateLikeState));

        if (selectedPost && selectedPost._id === postId) {
            setSelectedPost(prev => updateLikeState(prev));
        }

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

    const openPostModal = (post) => {
        if (subscriptionStatus === 'approved' || post.visibility === 'public') {
            setSelectedPost(post);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
    };

    const getSubscribeButton = () => {
        if (subscriptionStatus === 'pending') {
            return (
                <button
                    disabled
                    className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-semibold cursor-not-allowed"
                >
                    Request Pending
                </button>
            );
        } else if (subscriptionStatus === 'approved') {
            return (
                <button
                    disabled
                    className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold cursor-not-allowed"
                >
                    Subscribed
                </button>
            );
        } else {
            return (
                <button
                    onClick={handleSubscribeClick}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    Subscribe
                </button>
            );
        }
    };

    if (!creator) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Creator Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8 mb-6">
                <div className="flex flex-col items-center text-center">
                    {/* Profile Picture */}
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center mb-4 overflow-hidden relative">
                        {creator.profileImage ? (
                            <Image
                                src={creator.profileImage}
                                alt={creator.fullName}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <span className="text-white font-bold text-3xl">
                                {creator.fullName?.charAt(0).toUpperCase() || 'C'}
                            </span>
                        )}
                    </div>

                    {/* Creator Info */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{creator.fullName}</h1>


                    {/* Subscribe Button */}
                    <div className="mb-4">{getSubscribeButton()}</div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 md:space-x-8 text-center">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                            <p className="text-sm text-gray-600">Posts</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                            <p className="text-sm text-gray-600">Subscribers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid or Subscribe Message */}
            {posts.length > 0 ? (
                (() => {
                    // Filter viewable posts: Public OR Private if subscribed
                    const viewablePosts = posts.filter(post =>
                        post.visibility === 'public' || subscriptionStatus === 'approved'
                    );

                    // If we have viewable posts, show them
                    if (viewablePosts.length > 0) {
                        return (
                            <>
                                <div className="grid grid-cols-3 gap-1 md:gap-2">
                                    {viewablePosts.map((post) => (
                                        <div
                                            key={post._id}
                                            onClick={() => openPostModal(post)}
                                            className="relative aspect-square bg-gray-100 cursor-pointer group overflow-hidden"
                                        >
                                            {/* Show 'FREE' badge for public posts if not subscribed */}
                                            {post.visibility === 'public' && subscriptionStatus !== 'approved' && (
                                                <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full z-10 font-bold shadow-sm">
                                                    FREE
                                                </div>
                                            )}

                                            {post.imageUrl ? (
                                                <>
                                                    <Image
                                                        src={post.imageUrl}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover transition-transform duration-200 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-6 text-white">
                                                            <div className="flex items-center">
                                                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                                </svg>
                                                                <span className="font-semibold">{post.likes || 0}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" />
                                                                </svg>
                                                                <span className="font-semibold">{post.comments?.length || 0}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100">
                                                    <div className="text-center p-4">
                                                        <p className="text-sm font-semibold text-gray-700 line-clamp-2">
                                                            {post.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Show "Subscribe for more" if there are hidden private posts */}
                                {posts.length > viewablePosts.length && (
                                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-8 text-center bg-gradient-to-b from-indigo-50 to-white">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {posts.length - viewablePosts.length} Exclusive Posts
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Subscribe to unlock the rest of {creator.fullName}'s content.
                                        </p>
                                        {getSubscribeButton()}
                                    </div>
                                )}
                            </>
                        );
                    } else {
                        // No viewable posts (all are private, and not subscribed)
                        return (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-12 text-center">
                                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Subscribe to View Content
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    This creator's content is exclusive to subscribers.
                                </p>
                                {getSubscribeButton()}
                            </div>
                        );
                    }
                })()
            ) : (
                // Truly empty
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-12 text-center">
                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500">This creator hasn't posted any content yet</p>
                </div>
            )}
            {/* Post Modal */}
            {isModalOpen && selectedPost && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-xl md:rounded-2xl overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden relative">
                                        {creator.profileImage ? (
                                            <Image
                                                src={creator.profileImage}
                                                alt={creator.fullName}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-semibold text-sm">
                                                {creator.fullName?.charAt(0).toUpperCase() || 'C'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-gray-900">{creator.fullName}</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Image Section */}
                            {selectedPost.imageUrl && (
                                <div className="w-full bg-gray-100 relative aspect-square">
                                    <Image
                                        src={selectedPost.imageUrl}
                                        alt={selectedPost.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Actions / Footer */}
                            <div className="p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <button
                                        onClick={() => handleLike(selectedPost._id)}
                                        className={`${selectedPost.isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'} transition-colors`}
                                    >
                                        <svg className="w-6 h-6" fill={selectedPost.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                    <span className="text-sm font-semibold text-gray-900">{selectedPost.likes || 0} likes</span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {selectedPost.title}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={isSubscribeModalOpen}
                onClose={() => setIsSubscribeModalOpen(false)}
                creator={creator}
                onConfirm={confirmSubscribe}
            />
        </div>
    );
}

export default function CreatorProfilePage() {
    return (
        <FanLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            }>
                <CreatorProfileContent />
            </Suspense>
        </FanLayout>
    );
}
