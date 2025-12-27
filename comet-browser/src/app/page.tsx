"use client";

import { useEffect, useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import BrowserViewContainer from "@/components/BrowserViewContainer";
import AIChatSidebar from "@/components/AIChatSidebar";
import WebStore from "@/components/WebStore";
import PDFWorkspace from "@/components/PDFWorkspace";
import ClipboardManager from "@/components/ClipboardManager";
import PhoneCamera from "@/components/PhoneCamera";
import CodingDashboard from "@/components/CodingDashboard";
import SettingsPanel from "@/components/SettingsPanel";
import LandingPage from "./web/page";
import { searchEngines } from '@/components/SearchEngineSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserAI } from "@/lib/BrowserAI";
import {
  ChevronLeft, ChevronRight, RotateCw, Shield,
  ShoppingBag, FileText, Settings as GhostSettings,
  Menu, X, Sparkles, Globe, Clipboard as CopyIcon, Camera,
  FolderOpen, Terminal, Plus, X as CloseIcon, LayoutDashboard,
  ShieldCheck, AlertTriangle, Bookmark, DownloadCloud, ShoppingCart,
  Search, ScanLine, Share2
} from 'lucide-react';

export default function Home() {
  const store = useAppStore();
  const [showClipboard, setShowClipboard] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [urlPrediction, setUrlPrediction] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean } | null>(null);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (store.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(store.theme);
    }
  }, [store.theme]);

  // Init Browser Intelligence
  useEffect(() => {
    BrowserAI.initURLPredictor();
  }, []);

  // Debounced Predictor
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isTyping && store.currentUrl.length > 2) {
        const pred = await BrowserAI.predictUrl(store.currentUrl, store.history);
        setUrlPrediction(pred);
      } else {
        setUrlPrediction(null);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [store.currentUrl, isTyping, store.history]);

  const handleGo = () => {
    let url = store.currentUrl.trim();
    if (!url) return;

    if (url.startsWith('/')) {
      const command = url.split(' ')[0];
      switch (command) {
        case '/settings': store.toggleSidebar(); break;
        case '/student': store.setStudentMode(!store.studentMode); break;
        case '/store': store.setActiveView('webstore'); break;
        case '/pdf': store.setActiveView('pdf'); break;
        case '/browser': store.setActiveView('browser'); break;
        case '/landing':
        case '/web': store.setActiveView('landing'); break;
        case '/code': store.setCodingMode(!store.isCodingMode); break;
      }
      store.setCurrentUrl('');
      return;
    }

    if (url.includes('.') && !url.includes(' ')) {
      if (!url.startsWith('http')) url = `https://${url}`;
    } else {
      url = `${searchEngines[store.selectedEngine as keyof typeof searchEngines].url}${encodeURIComponent(url)}`;
    }

    store.setActiveView('browser');
    store.updateTab(store.activeTabId, { url, title: url.split('/')[2] || 'New Tab' });
    store.setCurrentUrl(url);
    setUrlPrediction(null);
    setIsTyping(false);
    store.addToHistory(url);
  };

  const handleOfflineSave = async () => {
    if (!window.electronAPI) return;
    const html = await window.electronAPI.capturePageHtml();
    const activeTab = store.tabs.find(t => t.id === store.activeTabId);
    if (activeTab) {
      await window.electronAPI.saveOfflinePage({ url: activeTab.url, title: activeTab.title, html });
      store.savePageOffline(activeTab.url, activeTab.title, html);
    }
  };

  const handleCartScan = async () => {
    if (!window.electronAPI) return;
    const html = await window.electronAPI.capturePageHtml();
    const item = BrowserAI.scanForCartItems(html);
    if (item) {
      store.addToUnifiedCart({ ...item, url: store.tabs.find(t => t.id === store.activeTabId)?.url || "" });
      setShowCart(true);
    }
  };

  const calculateAndSetBounds = useCallback(() => {
    if (!window.electronAPI) return;
    const sidebarWidth = store.isSidebarCollapsed ? 80 : store.sidebarWidth;
    const headerHeight = 112; // Adjusted for tab bar

    const x = store.sidebarSide === 'left' ? sidebarWidth : 0;
    const width = window.innerWidth - sidebarWidth;

    if (store.activeView === 'browser') {
      window.electronAPI.setBrowserViewBounds({
        x: Math.round(x),
        y: headerHeight,
        width: Math.round(width),
        height: window.innerHeight - headerHeight
      });
    } else {
      window.electronAPI.setBrowserViewBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
  }, [store.isSidebarCollapsed, store.sidebarWidth, store.sidebarSide, store.activeView]);

  useEffect(() => {
    calculateAndSetBounds();
    window.addEventListener('resize', calculateAndSetBounds);
    return () => window.removeEventListener('resize', calculateAndSetBounds);
  }, [calculateAndSetBounds]);

  // Handle Global Clipboard Sync
  useEffect(() => {
    const handleCopy = () => {
      navigator.clipboard.readText().then(text => {
        if (text) store.addClipboardItem(text);
      });
    };
    window.addEventListener('focus', handleCopy);
    return () => window.removeEventListener('focus', handleCopy);
  }, []);

  if (store.activeView === 'landing') {
    return <LandingPage />;
  }

  return (
    <div className={`flex h-screen w-full bg-deep-space-bg overflow-hidden relative font-sans text-white transition-all duration-700 ${store.isVibrant ? 'bg-vibrant-mesh' : ''}`}>
      {/* Sidebar - Positionable & Resizable */}
      <aside
        style={{
          width: store.isSidebarCollapsed ? 80 : store.sidebarWidth,
          order: store.sidebarSide === 'left' ? -1 : 1
        }}
        className={`z-50 glass-vibrant border-white/5 transition-all duration-500 ease-in-out flex flex-col ${store.sidebarSide === 'left' ? 'border-r' : 'border-l'}`}
      >
        <div className="p-6 flex-1 overflow-hidden">
          <AIChatSidebar
            studentMode={store.studentMode} toggleStudentMode={() => store.setStudentMode(!store.studentMode)}
            isCollapsed={store.isSidebarCollapsed} toggleCollapse={store.toggleSidebar}
            selectedEngine={store.selectedEngine} setSelectedEngine={store.setSelectedEngine}
            theme={store.theme} setTheme={store.setTheme}
            side={store.sidebarSide}
            // Background and backend are handled by store now if needed, passing dummies for component compatibility
            backgroundImage="" setBackgroundImage={() => { }}
            backend="firebase" setBackend={() => { }}
            mysqlConfig={{}} setMysqlConfig={() => { }}
          />
        </div>

        {!store.isSidebarCollapsed && (
          <div className="p-4 grid grid-cols-2 gap-2 border-t border-white/5 bg-black/10">
            <button
              onClick={() => store.setActiveView('webstore')}
              className={`flex items-center gap-2 p-3 rounded-2xl transition-all ${store.activeView === 'webstore' ? 'bg-deep-space-accent-neon/10 text-deep-space-accent-neon' : 'hover:bg-white/5 text-white/40'}`}
            >
              <ShoppingBag size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Store</span>
            </button>
            <button
              onClick={() => store.setActiveView('pdf')}
              className={`flex items-center gap-2 p-3 rounded-2xl transition-all ${store.activeView === 'pdf' ? 'bg-deep-space-accent-neon/10 text-deep-space-accent-neon' : 'hover:bg-white/5 text-white/40'}`}
            >
              <FileText size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Docs</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-black/5">
        {/* Tab Bar - Top Tier (Hidden in Coding or specialized views) */}
        {(!store.isCodingMode && store.activeView === 'browser') && (
          <div className="h-10 flex items-center px-4 gap-1 bg-black/40 border-b border-white/5 overflow-x-auto custom-scrollbar no-scrollbar">
            {store.tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => store.setActiveTab(tab.id)}
                className={`group flex items-center h-8 px-4 rounded-t-xl min-w-[140px] max-w-[200px] cursor-pointer transition-all border-t border-x ${store.activeTabId === tab.id ? 'bg-white/10 border-white/10 text-white' : 'bg-transparent border-transparent text-white/30 hover:bg-white/5'}`}
              >
                <Globe size={12} className="mr-2 flex-shrink-0" />
                <span className="text-[10px] font-bold truncate flex-1">{tab.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); store.removeTab(tab.id); }}
                  className="ml-2 p-0.5 rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus size={10} className="rotate-45" />
                </button>
              </div>
            ))}
            <button
              onClick={() => store.addTab()}
              className="p-1.5 rounded-lg text-white/20 hover:bg-white/10 hover:text-white transition-all ml-2"
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {/* Bookmarks Bar */}
        <div className="h-9 flex items-center px-6 gap-4 bg-black/20 border-b border-white/5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-deep-space-accent-neon mr-4">
            <Bookmark size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Library</span>
          </div>
          {store.bookmarks.map((b) => (
            <button
              key={b.id}
              onClick={() => { store.setCurrentUrl(b.url); handleGo(); }}
              className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/5 transition-all group"
            >
              <Globe size={10} className="text-white/20 group-hover:text-deep-space-accent-neon" />
              <span className="text-[10px] font-medium text-white/40 group-hover:text-white truncate max-w-[120px]">{b.title}</span>
            </button>
          ))}
          <button
            onClick={() => {
              const activeTab = store.tabs.find(t => t.id === store.activeTabId);
              if (activeTab) store.addBookmark(activeTab.url, activeTab.title);
            }}
            className="ml-auto p-1.5 rounded-lg text-white/20 hover:bg-white/10 hover:text-white transition-all"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Toolbar */}
        <header className="h-[72px] flex items-center px-6 gap-6 border-b border-white/5 bg-black/20 backdrop-blur-3xl z-40">
          <div className="flex items-center gap-1.5">
            <button onClick={() => window.electronAPI?.goBack()} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => window.electronAPI?.goForward()} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"><ChevronRight size={20} /></button>
            <button onClick={() => window.electronAPI?.reload()} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"><RotateCw size={18} /></button>
          </div>

          <div className="flex-1 relative max-w-3xl mx-auto group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              {store.showSiteWarnings && !store.currentUrl.startsWith('https') ? (
                <AlertTriangle size={14} className="text-yellow-500 animate-pulse" />
              ) : (
                <ShieldCheck size={14} className="text-deep-space-accent-neon" />
              )}
            </div>

            <input
              type="text"
              value={store.currentUrl}
              onChange={(e) => { store.setCurrentUrl(e.target.value); setIsTyping(true); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGo();
                if (e.key === 'Tab' && urlPrediction) {
                  e.preventDefault();
                  store.setCurrentUrl(urlPrediction);
                  setUrlPrediction(null);
                }
              }}
              onBlur={() => setTimeout(() => setUrlPrediction(null), 200)}
              placeholder="Search safely or enter URL..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-deep-space-accent-neon/30 transition-all placeholder:text-white/20 font-medium"
            />

            {urlPrediction && (
              <div className="absolute left-11 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none text-sm font-medium">
                <span className="invisible">{store.currentUrl}</span>
                <span>{urlPrediction.slice(store.currentUrl.length)}</span>
                <span className="ml-2 text-[8px] bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-widest text-white/40 border border-white/5">Tab to prefill</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOfflineSave}
              className="p-2.5 rounded-xl text-white/30 hover:bg-white/5 hover:text-deep-space-accent-neon transition-all"
              title="Save Page Offline"
            >
              <DownloadCloud size={18} />
            </button>
            <button
              onClick={() => setShowCart(!showCart)}
              className={`p-2.5 rounded-xl transition-all relative ${showCart ? 'bg-deep-space-accent-neon/10 text-deep-space-accent-neon' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}
            >
              <ShoppingCart size={18} />
              {store.unifiedCart.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-deep-space-accent-neon rounded-full shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
              )}
            </button>

            <button
              onClick={() => setShowClipboard(!showClipboard)}
              className={`p-2.5 rounded-xl transition-all ${showClipboard ? 'bg-deep-space-accent-neon/10 text-deep-space-accent-neon' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}
            >
              <CopyIcon size={18} />
            </button>
            <button
              onClick={() => window.electronAPI?.openDevTools()}
              className="p-2.5 rounded-xl text-white/30 hover:bg-white/5 hover:text-red-400 transition-all"
              title="Open DevTools"
            >
              <Terminal size={18} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-xl text-white/30 hover:bg-white/5 hover:text-white transition-all"
              title="Browser Settings"
            >
              <GhostSettings size={18} />
            </button>
            <div className="w-[1px] h-8 bg-white/5 mx-2" />
            <button
              onClick={() => window.electronAPI?.shareDeviceFolder()}
              className="p-2.5 rounded-xl text-white/30 hover:bg-white/5 hover:text-white transition-all"
              title="Share Device Folder"
            >
              <FolderOpen size={18} />
            </button>
            <button
              className={`p-2.5 rounded-xl transition-all ${store.isCodingMode ? 'bg-deep-space-accent-neon/10 text-deep-space-accent-neon' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}
              onClick={() => store.setCodingMode(!store.isCodingMode)}
              title="Developer Mode"
            >
              <Terminal size={18} />
            </button>
          </div>
        </header>

        {/* Content Views */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {store.activeView === 'browser' && (
              <motion.div key="browser" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                <div className={`h-full flex ${store.studentMode ? 'p-4 gap-4' : ''}`}>
                  <div className={`flex-[3] relative ${store.studentMode ? 'rounded-2xl overflow-hidden border border-white/10 shadow-3xl' : ''}`}>
                    <BrowserViewContainer omnibarUrl={store.tabs.find(t => t.id === store.activeTabId)?.url || 'https://www.google.com'} onUrlChange={(url) => store.updateTab(store.activeTabId, { url })} />
                  </div>
                  {store.studentMode && (
                    <div className="flex-1 glass-vibrant shadow-3xl rounded-3xl p-6 flex flex-col border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles size={20} className="text-deep-space-accent-neon" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/70">Context Intelligence</h3>
                      </div>
                      <textarea
                        className="flex-1 bg-transparent text-white/80 text-sm leading-relaxed resize-none focus:outline-none placeholder:text-white/5 custom-scrollbar font-medium"
                        placeholder="Insights reflect current tab content..."
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {store.activeView === 'webstore' && <WebStore key="webstore" onClose={() => store.setActiveView('browser')} />}
            {store.activeView === 'pdf' && <PDFWorkspace key="pdf" />}
            {store.isCodingMode && (
              <motion.div key="coding" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.02, opacity: 0 }} className="absolute inset-0 z-50">
                <CodingDashboard />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlays */}
          <AnimatePresence>
            {showClipboard && (
              <motion.div
                key="clipboard-manager"
                initial={{ opacity: 0, x: store.sidebarSide === 'right' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: store.sidebarSide === 'right' ? -20 : 20 }}
                className={`absolute top-4 ${store.sidebarSide === 'right' ? 'left-4' : 'right-4'} bottom-4 w-80 z-50 shadow-3xl`}
              >
                <ClipboardManager />
              </motion.div>
            )}
            {showCamera && <PhoneCamera key="phone-camera" onClose={() => setShowCamera(false)} />}
            {showSettings && <SettingsPanel key="settings-panel" onClose={() => setShowSettings(false)} />}

            {showCart && (
              <motion.div
                key="unified-cart"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`absolute top-20 right-6 w-96 glass-vibrant z-50 rounded-[2rem] p-8 shadow-3xl bg-black/40 border border-white/10`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Unified Cart</h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Cross-Site AI Manager</p>
                  </div>
                  <button onClick={handleCartScan} className="p-3 bg-deep-space-accent-neon/10 text-deep-space-accent-neon rounded-2xl hover:bg-deep-space-accent-neon/20 transition-all">
                    <ScanLine size={18} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {store.unifiedCart.length === 0 ? (
                    <div className="py-12 text-center">
                      <ShoppingCart size={40} className="mx-auto text-white/10 mb-4" />
                      <p className="text-white/30 text-xs">No items detected by BrowserAI yet.</p>
                    </div>
                  ) : (
                    store.unifiedCart.map((item) => (
                      <div key={item.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg">🛍️</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.item}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.site}</p>
                          <p className="text-deep-space-accent-neon font-black mt-1">{item.price}</p>
                        </div>
                        <button
                          onClick={() => store.removeFromCart(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {store.unifiedCart.length > 0 && (
                  <button className="w-full mt-8 py-4 bg-deep-space-accent-neon text-deep-space-bg font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:scale-[1.02] transition-all">
                    Checkout All via Comet Pay
                  </button>
                )}
              </motion.div>
            )}

            {/* AI Selection / Scan Widget (Simulated as a floating menu) */}
            <AnimatePresence>
              {store.studentMode && (
                <motion.div
                  key="ai-scan-widget"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-4 glass-vibrant rounded-full border border-deep-space-accent-neon/30 flex items-center gap-6 shadow-2xl z-50 bg-black/60 shadow-deep-space-accent-neon/10"
                >
                  <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                    <Sparkles size={18} className="text-deep-space-accent-neon animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Intelligence Active</span>
                  </div>
                  <button onClick={handleCartScan} className="flex items-center gap-2 text-white/60 hover:text-deep-space-accent-neon transition-all">
                    <ScanLine size={16} />
                    <span className="text-[10px] font-bold uppercase">Scan Page</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/60 hover:text-deep-space-accent-neon transition-all">
                    <Search size={16} />
                    <span className="text-[10px] font-bold uppercase">Search Concept</span>
                  </button>
                  <button onClick={handleOfflineSave} className="flex items-center gap-2 text-white/60 hover:text-deep-space-accent-neon transition-all">
                    <DownloadCloud size={16} />
                    <span className="text-[10px] font-bold uppercase">Go Offline</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}