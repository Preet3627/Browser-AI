"use client";

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { LogIn, User } from 'lucide-react';

const WelcomeScreen = () => {
    const { setHasSeenWelcomePage, setGuestMode } = useAppStore();

    const handleSignIn = () => {
        setHasSeenWelcomePage(true);
    };

    const handleGuestMode = () => {
        setGuestMode(true);
        setHasSeenWelcomePage(true);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-deep-space-bg border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl"
            >
                <h1 className="text-4xl font-black text-white mb-4">Welcome to Comet</h1>
                <p className="text-white/50 mb-12">Your intelligent browsing workspace.</p>

                <div className="space-y-4">
                    <button
                        onClick={handleSignIn}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-deep-space-accent-neon text-deep-space-bg rounded-xl text-sm font-black uppercase tracking-widest hover:bg-opacity-80 transition-all"
                    >
                        <LogIn size={20} />
                        Sign In / Create Account
                    </button>
                    <button
                        onClick={handleGuestMode}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                        <User size={20} />
                        Continue as Guest
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
