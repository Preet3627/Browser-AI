import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PasswordEntry {
    id: string;
    site: string;
    username: string;
    password: string;
    note?: string;
}

interface BrowserState {
    currentUrl: string;
    history: string[];
    clipboard: string[];
    activeView: 'browser' | 'webstore' | 'pdf' | 'landing';
    isSidebarCollapsed: boolean;
    studentMode: boolean;
    selectedEngine: string;
    theme: 'dark' | 'light' | 'system';
    appName: string;
    isCodingMode: boolean;

    // Tab System
    tabs: { id: string; url: string; title: string }[];
    activeTabId: string;

    // UI Customization
    sidebarWidth: number;
    sidebarSide: 'left' | 'right';
    isVibrant: boolean;

    // Security & Preferences
    isSafeSearch: boolean;
    showSiteWarnings: boolean;
    installDismissed: boolean;

    // Advanced Features
    bookmarks: { id: string; url: string; title: string; icon?: string }[];
    offlinePages: { id: string; url: string; title: string; html: string; timestamp: number }[];
    unifiedCart: { id: string; site: string; item: string; price: string; url: string; thumbnail?: string }[];

    // Password Manager & Autofill
    passwords: PasswordEntry[];
    autofillEnabled: boolean;
    excelAutofillData: any[];

    // AI Configuration
    aiProvider: 'openai' | 'gemini' | 'claude' | 'local';
    localLLMModel: string;

    // Actions
    setCurrentUrl: (url: string) => void;
    addToHistory: (url: string) => void;
    addClipboardItem: (item: string) => void;
    setActiveView: (view: 'browser' | 'webstore' | 'pdf' | 'landing') => void;
    toggleSidebar: () => void;
    setStudentMode: (mode: boolean) => void;
    setSelectedEngine: (engine: string) => void;
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
    setAppName: (name: string) => void;
    setCodingMode: (mode: boolean) => void;

    // Tab Actions
    addTab: (url?: string) => void;
    removeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    updateTab: (id: string, updates: Partial<{ url: string; title: string }>) => void;

    // UI Actions
    setSidebarWidth: (width: number) => void;
    setSidebarSide: (side: 'left' | 'right') => void;
    setVibrant: (vibrant: boolean) => void;

    // Security Actions
    setSafeSearch: (enabled: boolean) => void;
    setSiteWarnings: (enabled: boolean) => void;

    // Advanced Actions
    addBookmark: (url: string, title: string) => void;
    removeBookmark: (id: string) => void;
    savePageOffline: (url: string, title: string, html: string) => void;
    addToUnifiedCart: (item: { site: string; item: string; price: string; url: string; thumbnail?: string }) => void;
    removeFromCart: (id: string) => void;
    clearClipboard: () => void;

    // Password Actions
    addPassword: (entry: Omit<PasswordEntry, 'id'>) => void;
    removePassword: (id: string) => void;
    setAutofillEnabled: (enabled: boolean) => void;
    setExcelAutofillData: (data: any[]) => void;
    setAIProvider: (provider: 'openai' | 'gemini' | 'claude' | 'local') => void;
}

export const useAppStore = create<BrowserState>()(
    persist(
        (set) => ({
            currentUrl: 'https://www.google.com',
            history: [],
            clipboard: [],
            activeView: 'landing',
            isSidebarCollapsed: false,
            studentMode: false,
            selectedEngine: 'google',
            theme: 'dark',
            appName: process.env.NEXT_PUBLIC_APP_NAME || 'Comet',
            isCodingMode: false,
            tabs: [{ id: 'default', url: 'https://www.google.com', title: 'New Tab' }],
            activeTabId: 'default',
            sidebarWidth: 320,
            sidebarSide: 'left',
            isVibrant: true,
            isSafeSearch: true,
            showSiteWarnings: true,
            installDismissed: false,
            bookmarks: [],
            offlinePages: [],
            unifiedCart: [],
            passwords: [],
            autofillEnabled: true,
            excelAutofillData: [],
            aiProvider: 'openai',
            localLLMModel: 'Llama-3-Lightweight',

            setCurrentUrl: (url) => set({ currentUrl: url }),
            addToHistory: (url) => set((state) => ({ history: [url, ...state.history.slice(0, 50)] })),
            addClipboardItem: (item) => set((state) => {
                if (state.clipboard.includes(item)) return state;
                return { clipboard: [item, ...state.clipboard.slice(0, 19)] };
            }),
            setActiveView: (view) => set({ activeView: view }),
            toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
            setStudentMode: (mode) => set({ studentMode: mode }),
            setSelectedEngine: (engine) => set({ selectedEngine: engine }),
            setTheme: (theme) => set({ theme }),
            setAppName: (name) => set({ appName: name }),
            setCodingMode: (mode) => set({ isCodingMode: mode }),

            addTab: (url = 'https://www.google.com') => set((state) => {
                const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                return {
                    tabs: [...state.tabs, { id, url, title: 'New Tab' }],
                    activeTabId: id,
                    currentUrl: url,
                    activeView: 'browser'
                };
            }),
            removeTab: (id) => set((state) => {
                const newTabs = state.tabs.filter(t => t.id !== id);
                const finalTabs = newTabs.length ? newTabs : [{ id: 'default', url: 'https://www.google.com', title: 'New Tab' }];
                const nextTabId = state.activeTabId === id ? (finalTabs[0]?.id || 'default') : state.activeTabId;
                const nextUrl = finalTabs.find(t => t.id === nextTabId)?.url || 'https://www.google.com';

                return {
                    tabs: finalTabs,
                    activeTabId: nextTabId,
                    currentUrl: nextUrl
                };
            }),
            setActiveTab: (id) => set((state) => ({
                activeTabId: id,
                activeView: 'browser',
                currentUrl: state.tabs.find(t => t.id === id)?.url || state.currentUrl
            })),
            updateTab: (id, updates) => set((state) => {
                const newTabs = state.tabs.map(t => t.id === id ? { ...t, ...updates } : t);
                const updatedUrl = id === state.activeTabId && updates.url ? updates.url : state.currentUrl;
                return {
                    tabs: newTabs,
                    currentUrl: updatedUrl
                };
            }),

            setSidebarWidth: (width) => set({ sidebarWidth: width }),
            setSidebarSide: (side) => set({ sidebarSide: side }),
            setVibrant: (vibrant) => set({ isVibrant: vibrant }),
            setSafeSearch: (enabled) => set({ isSafeSearch: enabled }),
            setSiteWarnings: (enabled) => set({ showSiteWarnings: enabled }),

            addBookmark: (url, title) => set((state) => ({
                bookmarks: [...state.bookmarks, { id: `bmk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, url, title }]
            })),
            removeBookmark: (id) => set((state) => ({
                bookmarks: state.bookmarks.filter(b => b.id !== id)
            })),
            savePageOffline: (url, title, html) => set((state) => ({
                offlinePages: [...state.offlinePages, { id: `off-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, url, title, html, timestamp: Date.now() }]
            })),
            addToUnifiedCart: (item) => set((state) => ({
                unifiedCart: [...state.unifiedCart, { ...item, id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }]
            })),
            removeFromCart: (id) => set((state) => ({
                unifiedCart: state.unifiedCart.filter(i => i.id !== id)
            })),
            clearClipboard: () => set({ clipboard: [] }),

            addPassword: (entry) => set((state) => ({
                passwords: [...state.passwords, { ...entry, id: `pwd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }]
            })),
            removePassword: (id) => set((state) => ({
                passwords: state.passwords.filter(p => p.id !== id)
            })),
            setAutofillEnabled: (enabled) => set({ autofillEnabled: enabled }),
            setExcelAutofillData: (data) => set({ excelAutofillData: data }),
            setAIProvider: (provider) => set({ aiProvider: provider }),
        }),
        {
            name: 'comet-browser-storage',
        }
    )
);
