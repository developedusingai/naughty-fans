'use client';

export default function SubscriptionModal({ isOpen, onClose, creator, onConfirm }) {
    if (!isOpen || !creator) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                    <span className="text-white font-bold text-2xl">
                        {creator.fullName?.charAt(0).toUpperCase() || 'C'}
                    </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{creator.fullName}</h2>
                <p className="text-sm text-gray-500 mb-6">{creator.email}</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Subscription Cost</p>
                    <p className="text-3xl font-bold text-gray-900">
                        ${creator.subscriptionRate !== undefined ? creator.subscriptionRate : '0'}
                        <span className="text-sm text-gray-500 font-normal">/month</span>
                    </p>
                </div>

                <button
                    onClick={onConfirm}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transform active:scale-95 transition-all"
                >
                    Pay Now to Subscribe
                </button>

                <button
                    onClick={onClose}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
