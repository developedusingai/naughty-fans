'use client';

import FanLayout from '@/components/FanLayout';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function FanAccountPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [subscriptions, setSubscriptions] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        profileImage: '',
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchProfile(parsedUser.email);
            fetchSubscriptions(parsedUser.email);
        }
    }, []);

    const fetchProfile = async (email) => {
        try {
            const response = await fetch(`/api/profile?email=${email}`);
            const data = await response.json();
            if (response.ok) {
                setFormData({
                    fullName: data.user.fullName || '',
                    bio: data.user.bio || '',
                    profileImage: data.user.profileImage || '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchSubscriptions = async (email) => {
        try {
            const response = await fetch(`/api/subscriptions?fanEmail=${email}&type=my_subscriptions`);
            const data = await response.json();
            if (response.ok) {
                setSubscriptions(data.subscriptions || []);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please upload an image file' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
            return;
        }

        setIsUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setFormData(prev => ({ ...prev, profileImage: data.url }));
                setMessage({ type: 'success', text: 'Image uploaded successfully' });
            } else {
                setMessage({ type: 'error', text: 'Upload failed' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Upload failed' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    ...formData,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <FanLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </FanLayout>
        );
    }

    return (
        <FanLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
                    <p className="text-gray-600">Manage your profile and subscriptions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile Edit */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Details</h2>
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Profile Image */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative w-32 h-32 mb-4">
                                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg relative">
                                            {formData.profileImage ? (
                                                <Image
                                                    src={formData.profileImage}
                                                    alt="Profile"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                                                    {formData.fullName?.charAt(0).toUpperCase() || 'F'}
                                                </div>
                                            )}
                                        </div>
                                        <label
                                            htmlFor="profile-upload"
                                            className="absolute bottom-0 right-0 bg-white text-gray-700 p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <input
                                                id="profile-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {isUploading ? 'Uploading...' : 'Click icons to change photo'}
                                    </p>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        rows={4}
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="Tell your fans about yourself..."
                                    />
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading || isUploading}
                                        className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Subscriptions */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Subscribed Creators</h2>

                            {subscriptions.length > 0 ? (
                                <div className="space-y-4">
                                    {subscriptions.map((sub) => (
                                        <Link
                                            key={sub._id}
                                            href={`/fan/creator?email=${sub.creatorEmail}`}
                                            className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 p-0.5 flex-shrink-0">
                                                <div className="w-full h-full rounded-full bg-white p-0.5">
                                                    <div className="w-full h-full rounded-full overflow-hidden relative">
                                                        {sub.creatorDetails?.profileImage ? (
                                                            <Image
                                                                src={sub.creatorDetails.profileImage}
                                                                alt={sub.creatorEmail}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                                                {sub.creatorEmail.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                    {sub.creatorDetails?.fullName || sub.creatorEmail}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    Subscribed since {new Date(sub.approvedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">You haven't subscribed to anyone yet.</p>
                                    <Link
                                        href="/fan/explore"
                                        className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
                                    >
                                        Explore Creators
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}
