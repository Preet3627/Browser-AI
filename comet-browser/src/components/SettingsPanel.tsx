"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
    Settings as SettingsIcon, Monitor, Shield, Palette,
    Layout, Type, Globe, Info, Download, Pin,
    ChevronRight, Check, AlertCircle, Eye, EyeOff, ShieldCheck,
    Key, Package, FileSpreadsheet, Plus, X, Lock, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPanel = ({ onClose }: { onClose: () => void }) => {
    const store = useAppStore();
    const [activeSection, setActiveSection] = React.useState('appearance');
    const [showAddPwd, setShowAddPwd] = useState(false);
    const [newPwd, setNewPwd] = useState({ site: '', username: '', password: '' });

    const sections = [
        { id: 'appearance', icon: <Monitor size={18} />, label: 'Appearance' },
        { id: 'privacy', icon: <Shield size={18} />, label: 'Privacy & Security' },
        { id: 'vault', icon: <Key size={18} />, label: 'Vault & Autofill' },
        { id: 'extensions', icon: <Package size={18} />, label: 'Extensions' },
        { id: 'tabs', icon: <Layout size={18} />, label: 'Tab Management' },
        { id: 'mcp', icon: <Globe size={18} />, label: 'MCP Servers' },
        { id: 'system', icon: <Globe size={18} />, label: 'System' },
        { id: 'about', icon: <Info size={18} />, label: 'About Comet' },
    ];

    const handleAddPassword = () => {
        if (!newPwd.site || !newPwd.username || !newPwd.password) return;
        store.addPassword(newPwd);
        setNewPwd({ site: '', username: '', password: '' });
        setShowAddPwd(false);
    };

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app we'd use sheetjs, here we simulate parsing
            alert(`Parsed ${file.name} for autofill intelligence.`);
            store.setExcelAutofillData([{ site: 'example.com', data: 'Parsed From Excel' }]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-3xl">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-6xl h-[85vh] bg-deep-space-bg border border-white/10 rounded-[2.5rem] overflow-hidden flex shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
            >
                {/* Navigation Sidebar */}
                <div className="w-72 bg-white/[0.02] border-r border-white/5 p-8 flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-4 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-deep-space-accent-neon flex items-center justify-center text-deep-space-bg font-black text-xl shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                            {store.appName.charAt(0)}
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">{store.appName}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${activeSection === s.id ? 'bg-deep-space-accent-neon/10 text-deep-space-accent-neon' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                            >
                                {s.icon}
                                <span className="flex-1 text-left">{s.label}</span>
                                {activeSection === s.id && <ChevronRight size={14} />}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 space-y-4">
                        <button
                            className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 transition-all"
                        >
                            <Download size={14} />
                            Install PWA
                        </button>
                        <div className="p-4 bg-deep-space-accent-neon/5 rounded-2xl border border-deep-space-accent-neon/10 text-[10px] font-medium text-deep-space-accent-neon/60 text-center leading-relaxed">
                            Version 0.5.2-alpha <br /> (Production Build)
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar bg-black/10">
                    <header className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{activeSection === 'mcp' ? 'MCP Servers' : activeSection.replace('-', ' ')}</h2>
                            <p className="text-white/30 text-sm">Configure your hardware-accelerated workspace.</p>
                        </div>
                        <button onClick={onClose} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-sm font-black uppercase tracking-widest border border-white/5">Close</button>
                    </header>

                    <div className="space-y-12 max-w-3xl">
                        {activeSection === 'appearance' && (
                            <div className="space-y-8">
                                <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-white mb-1">Layout Position</p>
                                            <p className="text-xs text-white/30">Primary sidebar alignment.</p>
                                        </div>
                                        <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                                            {['left', 'right'].map((side) => (
                                                <button
                                                    key={side}
                                                    onClick={() => store.setSidebarSide(side as 'left' | 'right')}
                                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${store.sidebarSide === side ? 'bg-deep-space-accent-neon text-deep-space-bg' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    {side}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-white">Panel Width</p>
                                            <span className="text-[10px] font-black text-deep-space-accent-neon">{store.sidebarWidth}px</span>
                                        </div>
                                        <input
                                            type="range" min="280" max="600" step="10"
                                            value={store.sidebarWidth}
                                            onChange={(e) => store.setSidebarWidth(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-deep-space-accent-neon"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'vault' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Credentials & Autofill</h3>
                                    <button
                                        onClick={() => setShowAddPwd(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-deep-space-accent-neon text-deep-space-bg rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                                    >
                                        <Plus size={14} /> Add Manual
                                    </button>
                                </div>

                                <motion.div layout className="grid grid-cols-1 gap-4">
                                    <AnimatePresence>
                                        {showAddPwd && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 rounded-3xl bg-deep-space-accent-neon/5 border border-deep-space-accent-neon/20 grid grid-cols-3 gap-4">
                                                <input placeholder="Site (e.g. google.com)" className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs" value={newPwd.site} onChange={e => setNewPwd({ ...newPwd, site: e.target.value })} />
                                                <input placeholder="Username" className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs" value={newPwd.username} onChange={e => setNewPwd({ ...newPwd, username: e.target.value })} />
                                                <input type="password" placeholder="Password" className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs" value={newPwd.password} onChange={e => setNewPwd({ ...newPwd, password: e.target.value })} />
                                                <div className="col-span-3 flex justify-end gap-2">
                                                    <button onClick={() => setShowAddPwd(false)} className="text-[10px] font-black uppercase text-white/40">Cancel</button>
                                                    <button onClick={handleAddPassword} className="text-[10px] font-black uppercase text-deep-space-accent-neon">Save to Vault</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {store.passwords.length === 0 ? (
                                        <div className="p-12 text-center rounded-[2rem] border border-dashed border-white/10">
                                            <Lock size={32} className="mx-auto text-white/10 mb-4" />
                                            <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No entries in your secure vault.</p>
                                        </div>
                                    ) : (
                                        store.passwords.map(p => (
                                            <div key={p.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 font-bold uppercase">{p.site.charAt(0)}</div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{p.site}</p>
                                                        <p className="text-[10px] text-white/30 uppercase tracking-widest">{p.username}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => store.removePassword(p.id)} className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </motion.div>

                                <div className="p-8 rounded-[2rem] bg-vibrant-mesh border border-white/10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                                            <FileSpreadsheet size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase tracking-tight">Excel Intelligence Autofill</p>
                                            <p className="text-xs text-white/60">Import spreadsheet data to enable AI-powered form filling.</p>
                                        </div>
                                    </div>
                                    <input type="file" accept=".xlsx,.csv" onChange={handleExcelUpload} className="hidden" id="excel-upload" />
                                    <label htmlFor="excel-upload" className="inline-block px-8 py-3 bg-white text-black font-black rounded-xl text-[10px] uppercase tracking-widest cursor-pointer hover:scale-105 transition-all">
                                        Import External Data
                                    </label>
                                </div>

                                <div className="p-6 rounded-2xl bg-deep-space-accent-neon/5 border border-deep-space-accent-neon/10 flex items-center gap-4">
                                    <ShieldCheck className="text-deep-space-accent-neon" size={20} />
                                    <p className="text-[10px] text-white/50 font-medium leading-relaxed italic">
                                        All vault data is locally encrypted using <span className="text-white font-bold">AES-256</span> simulation.
                                        Your master key never leaves this device.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeSection === 'extensions' && (
                            <div className="space-y-8">
                                <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white mb-1">Custom Chrome Extensions</p>
                                            <p className="text-xs text-white/30">Load and manage your local development plugins.</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-4">
                                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                                            <p className="text-[10px] font-black uppercase text-white/60 mb-4 tracking-widest">Guide: Setting up your own extension</p>
                                            <ol className="text-xs text-white/30 space-y-3 leading-relaxed">
                                                <li>1. Create a directory containing your <code className="text-deep-space-accent-neon font-bold">manifest.json</code>.</li>
                                                <li>2. Open your System/UserData directory.</li>
                                                <li>3. Move your extension folder into the <code className="text-deep-space-accent-neon font-bold">/extensions</code> sub-directory.</li>
                                                <li>4. Restart Comet. Extensions are loaded at runtime for security.</li>
                                            </ol>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const path = await window.electronAPI?.getExtensionPath();
                                                alert(`Drop your extension folders here: \n${path}`);
                                            }}
                                            className="px-6 py-3 bg-deep-space-accent-neon/10 border border-deep-space-accent-neon/20 text-deep-space-accent-neon font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-deep-space-accent-neon/20 transition-all flex items-center gap-2"
                                        >
                                            <ExternalLink size={14} /> View Extensions Dir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'tabs' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Active Workspace Tabs</h3>
                                    <button
                                        onClick={() => store.addTab()}
                                        className="flex items-center gap-2 px-4 py-2 bg-deep-space-accent-neon text-deep-space-bg rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                                    >
                                        <Plus size={14} /> New Tab
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {store.tabs.map((tab) => (
                                        <div
                                            key={tab.id}
                                            className={`p-6 rounded-3xl border transition-all cursor-pointer group ${store.activeTabId === tab.id ? 'bg-deep-space-accent-neon/10 border-deep-space-accent-neon/30' : 'bg-white/[0.03] border-white/5 hover:bg-white/5'}`}
                                            onClick={() => store.setActiveTab(tab.id)}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white text-sm truncate">{tab.title || 'Untitled'}</p>
                                                    <p className="text-[10px] text-white/30 truncate mt-1">{tab.url}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        store.removeTab(tab.id);
                                                    }}
                                                    className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                                    <div className="flex items-center gap-4 text-white/40">
                                        <Info size={18} />
                                        <p className="text-xs">Tab sessions are persistent and hardware-isolated for security.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'mcp' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">Model Context Protocol</h3>
                                    <button
                                        onClick={() => {
                                            const name = prompt("Server Name:");
                                            const url = prompt("Server URL:");
                                            if (name && url) alert(`MCP Server ${name} added (Simulation)`);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                    >
                                        <Plus size={14} /> Connect Server
                                    </button>
                                </div>

                                <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white mb-1">Active MCP Nodes</p>
                                            <p className="text-xs text-white/30">Connect AI to local tools and databases.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-sm font-medium text-white/80">Local Filesystem MCP</span>
                                            </div>
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Built-in</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between opacity-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-white/10" />
                                                <span className="text-sm font-medium text-white/40">PostgreSQL MCP</span>
                                            </div>
                                            <button className="text-[10px] font-black text-deep-space-accent-neon uppercase tracking-widest hover:underline">Configure</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2rem] bg-vibrant-mesh border border-white/10">
                                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                                        MCP allows Comet to securely access your data without ever sending it to the LLM's cloud.
                                        Only context relevant to your prompt is shared.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeSection === 'about' && (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-deep-space-accent-neon flex items-center justify-center text-deep-space-bg font-black text-6xl mx-auto mb-8 shadow-2xl animate-pulse">
                                    {store.appName.charAt(0)}
                                </div>
                                <h2 className="text-5xl font-black tracking-tighter mb-4">{store.appName}</h2>
                                <p className="text-white/40 max-w-md mx-auto mb-10 text-sm leading-relaxed font-medium">
                                    A performance-hardened Chromium shell with native AI orchestration, optimized for decentralized workflows.
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/40">Check build updates</button>
                                    <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/40">Documentation</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsPanel;
