'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { canShowInstallPrompt, showInstallPrompt, setupInstallPrompt } from '../utils/pwa';

const InstallPrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        setupInstallPrompt();

        // Check if we should show prompt
        const timer = setTimeout(() => {
            if (canShowInstallPrompt()) {
                const dismissed = localStorage.getItem('install-prompt-dismissed');
                if (!dismissed) {
                    setShowPrompt(true);
                }
            }
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleInstall = async () => {
        const accepted = await showInstallPrompt();
        if (accepted) {
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('install-prompt-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom duration-300">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded transition-colors"
            >
                <X size={16} />
            </button>

            <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold mb-1">Install AQT Journal</h3>
                    <p className="text-sm opacity-90 mb-3">
                        Install our app for faster access, offline support, and a native experience!
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleInstall}
                            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
                        >
                            Install Now
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
                        >
                            Not Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
