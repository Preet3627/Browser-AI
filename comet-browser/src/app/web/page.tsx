"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download, Globe, Cpu, ShieldCheck,
    ChevronRight, MonitorSmartphone, Database, Mail,
    Layout, Monitor, Smartphone, Terminal, Sparkles, Zap, Shield,
    User, LogOut, Key, CheckCircle2, LayoutDashboard, Settings,
    ArrowRight, Lock, Activity, Users, ShieldAlert, Trash2, RefreshCw
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import firebaseService from "@/lib/FirebaseService";
import { User as FirebaseUser } from "firebase/auth";

export default function UnifiedWebPortal() {
    const store = useAppStore();
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Comet";

    // View States: 'landing', 'login', 'admin'
    const [view, setView] = useState<"landing" | "login" | "admin">("landing");
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [scrolled, setScrolled] = useState(false);

    // Auth State
    const [loginRole, setLoginRole] = useState<"user" | "admin">("user");
    const [adminPass, setAdminPass] = useState("");

    // Personal AI Keys
    const [localApiKey, setLocalApiKey] = useState("");
    const [isKeySaved, setIsKeySaved] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);

        // Listen for Firebase Auth Changes
        const unsubscribe = firebaseService.onAuthStateChanged((user) => {
            setCurrentUser(user);
            if (user && view === "login") setView("landing");
        });

        // Load personal AI key
        const savedKey = localStorage.getItem("comet_personal_ai_key");
        if (savedKey) setLocalApiKey(savedKey);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            unsubscribe();
        };
    }, [view]);

    const handleGoogleLogin = async () => {
        const user = await firebaseService.signInWithGoogle();
        if (user) {
            setCurrentUser(user);
            // In a real app, you would sync this user with your MySQL database here
            // fetch('/api/sync-user', { method: 'POST', body: JSON.stringify({ uid: user.uid }) });
            setView("landing");
        }
    };

    const handleAdminAuth = () => {
        if (adminPass === "admin123") {
            setView("admin");
        } else {
            alert("Invalid Admin Key");
        }
    };

    const handleSaveAIKey = () => {
        localStorage.setItem("comet_personal_ai_key", localApiKey);
        setIsKeySaved(true);
        setTimeout(() => setIsKeySaved(false), 3000);
    };

    const handleLogout = async () => {
        await firebaseService.signOut();
        setCurrentUser(null);
        setView("landing");
    };

    return (
        <div className="min-h-screen bg-deep-space-bg text-white font-sans overflow-x-hidden relative selection:bg-deep-space-accent-neon/30">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-8 py-6 ${scrolled || view !== 'landing' ? 'glass-vibrant border-b border-white/10 py-4 shadow-2xl' : ''}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("landing")}>
                        <div className="w-10 h-10 rounded-2xl bg-deep-space-accent-neon flex items-center justify-center text-deep-space-bg font-black text-xl shadow-glow">
                            {appName.charAt(0)}
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase">{appName}</span>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        {view === 'landing' && (
                            <>
                                <a href="#features" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">Features</a>
                                <a href="#intelligence" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">Intelligence</a>
                            </>
                        )}

                        {currentUser ? (
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-white/10" />
                                    ) : (
                                        <User size={12} className="text-deep-space-accent-neon" />
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{currentUser.displayName || "Authorized Node"}</span>
                                </div>
                                <button onClick={() => setView(view === 'admin' ? 'landing' : 'admin')} className="text-deep-space-accent-neon hover:text-white transition-all">
                                    <LayoutDashboard size={20} />
                                </button>
                                <button onClick={handleLogout} className="text-white/20 hover:text-red-400 transition-all">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setView("login")}
                                className="px-8 py-3 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                            >
                                Get Started
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <AnimatePresence mode="wait">
                {view === "landing" && (
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Hero */}
                        <header className="relative z-10 pt-48 pb-32 px-8 max-w-7xl mx-auto text-center">
                            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                <div className="inline-flex items-center gap-2 px-6 py-2 bg-deep-space-accent-neon/10 border border-deep-space-accent-neon/20 rounded-full mb-10">
                                    <Sparkles size={14} className="text-deep-space-accent-neon" />
                                    <span className="text-[11px] font-black text-deep-space-accent-neon uppercase tracking-[0.3em]">CROSS-OS NEURAL SYNC ACTIVE</span>
                                </div>
                                <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-10 uppercase leading-none">
                                    Web Browsing,<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-deep-space-accent-neon to-white">Redefined.</span>
                                </h1>
                                <p className="max-w-2xl mx-auto text-white/40 text-xl font-medium mb-12">
                                    Hardened Chromium core with native AI orchestration and multi-device synchronization.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => store.setActiveView('browser')} className="px-10 py-5 bg-deep-space-accent-neon text-deep-space-bg font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-glow">
                                        Launch Browser Environment
                                    </button>
                                </div>
                            </motion.div>
                        </header>

                        {/* Personal AI Key Section (Only for users) */}
                        {currentUser && (
                            <section id="intelligence" className="relative z-10 py-20 px-8 max-w-7xl mx-auto">
                                <div className="glass-vibrant border border-white/10 rounded-[4rem] p-16 flex flex-col md:flex-row items-center gap-16">
                                    <div className="flex-1">
                                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Personal AI Node</h2>
                                        <p className="text-white/40 mb-10 font-medium">Configure your unique AI identity. This key belongs solely to you and syncs across all your authenticated Comet nodes.</p>
                                        <div className="flex gap-4">
                                            <input
                                                type="password"
                                                placeholder="Personal AI API Key"
                                                value={localApiKey}
                                                onChange={(e) => setLocalApiKey(e.target.value)}
                                                className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm outline-none focus:border-deep-space-accent-neon/30 transition-all font-mono"
                                            />
                                            <button onClick={handleSaveAIKey} className="px-6 py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                                                {isKeySaved ? "Verified" : "Deploy"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="w-64 h-64 rounded-full bg-deep-space-accent-neon/5 flex items-center justify-center border border-white/5">
                                        <Cpu size={100} className="text-deep-space-accent-neon animate-pulse" />
                                    </div>
                                </div>
                            </section>
                        )}
                    </motion.div>
                )}

                {view === "login" && (
                    <motion.div key="login" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen flex items-center justify-center p-8">
                        <div className="w-full max-w-md glass-vibrant border border-white/10 rounded-[3rem] p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-deep-space-accent-neon flex items-center justify-center text-deep-space-bg mx-auto mb-8 shadow-glow">
                                <Shield size={32} />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Comet Access</h2>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-10">Select Authorization Method</p>

                            <div className="space-y-4">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-4 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all"
                                >
                                    <Globe size={18} /> Continue with Google
                                </button>

                                <div className="py-4 flex items-center gap-4 text-white/10">
                                    <div className="flex-1 h-[1px] bg-white/10" />
                                    <span className="text-[9px] font-black uppercase">Or Admin Core</span>
                                    <div className="flex-1 h-[1px] bg-white/10" />
                                </div>

                                <input
                                    type="password"
                                    placeholder="Enter Admin Master Key"
                                    value={adminPass}
                                    onChange={(e) => setAdminPass(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-center focus:border-deep-space-accent-neon/30 outline-none transition-all"
                                />
                                <button
                                    onClick={handleAdminAuth}
                                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    Enter Admin Portal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === "admin" && (
                    <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-32 px-12 pb-20">
                        <div className="max-w-7xl mx-auto">
                            <header className="flex items-center justify-between mb-16">
                                <div>
                                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Core Management</h1>
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-glow" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Global Infrastructure: Online</span>
                                    </div>
                                </div>
                                <button onClick={() => setView("landing")} className="p-4 glass-vibrant border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
                                    <RefreshCw size={20} />
                                </button>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="glass-vibrant border border-white/5 rounded-[3rem] p-10 col-span-2">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-8 flex items-center gap-3">
                                        <Activity size={16} className="text-deep-space-accent-neon" /> Real-time Node Activity
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { msg: "Predictor v2 optimized", time: "12:04", type: "INFO" },
                                            { msg: "Node #DX-72 Sync Fail", time: "12:08", type: "ERR" },
                                            { msg: "Global Shield Hardened", time: "12:15", type: "INFO" },
                                        ].map((log, i) => (
                                            <div key={i} className="flex gap-6 items-center p-4 bg-white/5 rounded-2xl border border-white/5 font-mono text-[10px]">
                                                <span className="text-white/20">{log.time}</span>
                                                <span className={log.type === 'ERR' ? 'text-red-400' : 'text-deep-space-accent-neon'}>[{log.type}]</span>
                                                <span className="text-white/60">{log.msg}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="glass-vibrant border border-white/5 rounded-[3rem] p-10 text-center">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Total Nodes</p>
                                        <p className="text-6xl font-black tracking-tighter">1,248</p>
                                    </div>
                                    <div className="glass-vibrant border border-white/5 rounded-[3rem] p-10 text-center">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Uptime</p>
                                        <p className="text-6xl font-black tracking-tighter text-green-400">99.9%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-deep-space-primary/10 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-deep-space-accent-neon/5 rounded-full blur-[140px]" />
            </div>
        </div>
    );
}
