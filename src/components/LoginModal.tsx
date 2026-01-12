import React from 'react';
import { X, Twitter, Facebook, WifiOff } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginRaw: (provider: 'google' | 'twitter' | 'facebook') => void;
    onContinueOffline?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginRaw, onContinueOffline }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 animate-slideUp">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Welcome to RetailBeastFX
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-slate-600 dark:text-slate-400">
                    Sign in to sync your trading journal, settings, and analytics across all your devices.
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    {/* Google */}
                    <button
                        onClick={() => onLoginRaw('google')}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-slate-700 dark:text-slate-200 group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Twitter (X) */}
                    <button
                        onClick={() => onLoginRaw('twitter')}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-black text-white hover:bg-slate-900 transition-all font-medium"
                    >
                        <Twitter size={20} fill="currentColor" />
                        Continue with X
                    </button>

                    {/* Facebook */}
                    <button
                        onClick={() => onLoginRaw('facebook')}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-[#1877F2] text-white hover:bg-[#1864D9] transition-all font-medium"
                    >
                        <Facebook size={20} fill="currentColor" />
                        Continue with Facebook
                    </button>
                </div>

                {/* Continue Offline Option */}
                {onContinueOffline && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={onContinueOffline}
                            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            <WifiOff size={16} />
                            Continue Offline (data stays on this device)
                        </button>
                    </div>
                )}

                <p className="text-xs text-center text-slate-500 dark:text-slate-500 mt-4">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default LoginModal;

