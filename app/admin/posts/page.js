'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AdminPostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/posts?view=admin');
                const data = await res.json();
                if (res.ok) {
                    setPosts(data.posts || []);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const openModal = (post) => {
        setSelectedPost(post);
    };

    const closeModal = () => {
        setSelectedPost(null);
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Creator Posts</h1>
                <p className="text-gray-400">View all content posted by creators.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
                    <p className="text-gray-400 text-lg">No posts found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="relative aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-indigo-500 transition-all duration-200"
                            onClick={() => openModal(post)}
                        >
                            {post.imageUrl ? (
                                <>
                                    <Image
                                        src={post.imageUrl}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 text-white text-center p-2">
                                            <p className="font-semibold text-sm line-clamp-1">{post.title}</p>
                                            <p className="text-xs text-gray-300 mt-1">by {post.creatorName}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${post.visibility === 'public'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                            }`}>
                                            {post.visibility === 'public' ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 p-4">
                                    <div className="text-center">
                                        <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <p className="text-sm font-medium text-gray-300 line-clamp-2">{post.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">by {post.creatorName}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedPost && selectedPost.imageUrl && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="relative max-w-4xl w-full max-h-[90vh] bg-transparent rounded-none outline-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="relative w-full h-auto aspect-auto flex items-center justify-center">
                            <img
                                src={selectedPost.imageUrl}
                                alt={selectedPost.title}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white rounded-b-lg">
                            <h3 className="text-xl font-bold">{selectedPost.title}</h3>
                            <p className="text-gray-300">Posted by {selectedPost.creatorName}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
