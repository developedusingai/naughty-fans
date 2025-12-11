'use client';

import CreatorLayout from '@/components/CreatorLayout';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AccountPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        profileImage: '',
        subscriptionRate: '',
        upiId: '',
    });

    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [tempSubscriptionData, setTempSubscriptionData] = useState({ subscriptionRate: '', upiId: '' });
    const [modalError, setModalError] = useState('');

    const handleOpenModal = () => {
        setTempSubscriptionData({
            subscriptionRate: formData.subscriptionRate || '',
            upiId: formData.upiId || ''
        });
        setModalError('');
        setShowSubscriptionModal(true);
    };

    const handleSaveModal = () => {
        if (!tempSubscriptionData.subscriptionRate && tempSubscriptionData.subscriptionRate !== 0) {
            setModalError('Subscription rate is required');
            return;
        }
        if (!tempSubscriptionData.upiId) {
            setModalError('UPI ID is required');
            return;
        }

        setFormData(prev => ({
            ...prev,
            subscriptionRate: tempSubscriptionData.subscriptionRate,
            upiId: tempSubscriptionData.upiId
        }));
        setShowSubscriptionModal(false);
    };

    const handleCloseModal = () => {
        setShowSubscriptionModal(false);
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchProfile(parsedUser.email);
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
                    subscriptionRate: data.user.subscriptionRate || '',
                    upiId: data.user.upiId || '',
                });
                // Update local storage if needed, or just state
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
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
                // Update local storage user data to reflect changes immediately across app
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
            <CreatorLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </CreatorLayout>
        );
    }

    return (
        <CreatorLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
                    <p className="text-gray-600">Manage your profile details</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
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
                                            {formData.fullName?.charAt(0).toUpperCase() || 'C'}
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

                        {/* Subscription Management */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Subscription & Payouts
                            </label>
                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500">Current Monthly Rate</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        ${formData.subscriptionRate || '0.00'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenModal}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Manage Subscription Rate
                                </button>
                            </div>
                        </div>

                        {/* Subscription Modal */}
                        {showSubscriptionModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Subscription</h3>

                                    {modalError && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                            {modalError}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {/* Rate Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Monthly Subscription Rate ($) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={tempSubscriptionData.subscriptionRate}
                                                onChange={(e) => setTempSubscriptionData({ ...tempSubscriptionData, subscriptionRate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        {/* Fee Calculation */}
                                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fee Breakdown</p>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total Charge</span>
                                                <span className="font-semibold">${Number(tempSubscriptionData.subscriptionRate || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Platform Fee (20%)</span>
                                                <span className="text-red-500">-${(Number(tempSubscriptionData.subscriptionRate || 0) * 0.20).toFixed(2)}</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                                                <span className="text-green-700">Your Cut (80%)</span>
                                                <span className="text-green-700">${(Number(tempSubscriptionData.subscriptionRate || 0) * 0.80).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* UPI ID Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Your UPI ID for Payouts <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={tempSubscriptionData.upiId}
                                                onChange={(e) => setTempSubscriptionData({ ...tempSubscriptionData, upiId: e.target.value })}
                                                placeholder="username@upi"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Funds will be transferred to this ID.</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveModal}
                                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
        </CreatorLayout>
    );
}
