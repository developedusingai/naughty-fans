'use client';

import FanLayout from '@/components/FanLayout';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ExplorePage() {
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchExplorePosts(searchQuery);
            if (searchQuery.trim()) {
                fetchSuggestions(searchQuery);
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, user]);

    const fetchSuggestions = async (query) => {
        try {
            const response = await fetch(`/api/creators?search=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (response.ok) {
                setSuggestions(data.creators || []);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const fetchExplorePosts = async (query = '') => {
        try {
            const fanEmail = user?.email || '';
            const url = query
                ? `/api/explore?search=${encodeURIComponent(query)}&fanEmail=${fanEmail}`
                : `/api/explore?fanEmail=${fanEmail}`;

            const response = await fetch(url);
            const data = await response.json();
            if (response.ok) {
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Error fetching explore posts:', error);
        }
    };

    const handleLike = async (postId) => {
        if (!user) return;

        // Optimistic update
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



    const openModal = (post) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
    };

    return (
        <FanLayout>
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search public posts, creators, or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-12 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow hover:shadow-sm"
                        />
                        <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        {/* Search Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && searchQuery && (
                            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                                {suggestions.map((creator) => (
                                    <Link
                                        key={creator._id}
                                        href={`/fan/creator?email=${creator.email}`}
                                        className="flex items-center p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative">
                                            {creator.profileImage ? (
                                                <Image
                                                    src={creator.profileImage}
                                                    alt={creator.fullName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-white font-semibold text-xs">
                                                    {creator.fullName?.charAt(0).toUpperCase() || 'C'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-semibold text-gray-900">{creator.fullName}</p>
                                            <p className="text-xs text-gray-500">{creator.email}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Posts Grid */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1 md:gap-2">
                        {posts.map((post) => (
                            <div
                                key={post._id}
                                onClick={() => openModal(post)}
                                className="relative aspect-square bg-gray-100 cursor-pointer group overflow-hidden"
                            >
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
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'No results found' : 'No posts to explore'}
                        </h3>
                        <p className="text-gray-500">
                            {searchQuery ? 'Try a different search term' : 'Check back later for new content'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {
                isModalOpen && selectedPost && (
                    <div
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header: Creator Info */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                                <Link
                                    href={`/fan/creator?email=${selectedPost.creatorEmail}`}
                                    className="flex items-center group"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-indigo-100 transition-all overflow-hidden relative">
                                        {selectedPost.creatorProfileImage ? (
                                            <Image
                                                src={selectedPost.creatorProfileImage}
                                                alt={selectedPost.creatorName}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-semibold text-sm">
                                                {selectedPost.creatorName?.charAt(0).toUpperCase() || 'C'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {selectedPost.creatorName}
                                        </p>
                                        <p className="text-xs text-gray-500">Suggested Creator</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Image - Full View */}
                            <div className="relative w-full bg-black flex items-center justify-center grow h-[50vh] md:h-[60vh]">
                                {selectedPost.imageUrl ? (
                                    <Image
                                        src={selectedPost.imageUrl}
                                        alt={selectedPost.title}
                                        fill
                                        className="object-contain" // Uses object-contain to show full image without cropping
                                    />
                                ) : (
                                    <div className="text-white">No Image Available</div>
                                )}
                            </div>

                            {/* Optional Footer with Title/Description if space permits, or leave clean per request */}
                            {/* User asked for "image below it in full view". I'll add a minimal footer for context. */}
                            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">{selectedPost.title}</h3>
                                    {user && (
                                        <button
                                            onClick={() => handleLike(selectedPost._id)}
                                            className={`${selectedPost.isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'} transition-colors`}
                                        >
                                            <svg className="w-6 h-6" fill={selectedPost.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs font-semibold text-gray-500 mb-2">{selectedPost.likes || 0} likes</p>
                                {selectedPost.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedPost.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </FanLayout >
    );
}
