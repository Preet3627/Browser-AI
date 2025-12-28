/**
 * Advanced Tab Manager
 * Handles multiple tabs, custom sounds, background execution, and tab prioritization
 */

export interface TabConfig {
    id: string;
    url: string;
    title: string;
    favicon?: string;
    active: boolean;
    keepAliveInBackground: boolean;
    customSound?: {
        enabled: boolean;
        soundUrl?: string;
        volume: number;
        muteOtherTabs: boolean;
    };
    priority: 'high' | 'normal' | 'low';
    lastAccessed: number;
    memoryUsage?: number;
}

export class AdvancedTabManager {
    private tabs: Map<string, TabConfig> = new Map();
    private activeTabId: string | null = null;
    private maxTabs: number = 50; // Configurable max tabs
    private audioContexts: Map<string, AudioContext> = new Map();

    /**
     * Create new tab
     */
    createTab(url: string, config?: Partial<TabConfig>): string {
        // Check if max tabs reached
        if (this.tabs.size >= this.maxTabs) {
            this.closeLowPriorityTab();
        }

        const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tab: TabConfig = {
            id,
            url,
            title: url,
            active: false,
            keepAliveInBackground: false,
            priority: 'normal',
            lastAccessed: Date.now(),
            customSound: {
                enabled: false,
                volume: 1.0,
                muteOtherTabs: false
            },
            ...config
        };

        this.tabs.set(id, tab);
        return id;
    }

    /**
     * Switch to tab
     */
    switchToTab(tabId: string): boolean {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;

        // Deactivate current tab
        if (this.activeTabId) {
            const currentTab = this.tabs.get(this.activeTabId);
            if (currentTab) {
                currentTab.active = false;

                // Handle background behavior
                if (!currentTab.keepAliveInBackground) {
                    this.pauseTab(this.activeTabId);
                }
            }
        }

        // Activate new tab
        tab.active = true;
        tab.lastAccessed = Date.now();
        this.activeTabId = tabId;

        // Resume tab if it was paused
        this.resumeTab(tabId);

        return true;
    }

    /**
     * Close tab
     */
    closeTab(tabId: string): boolean {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;

        // Clean up audio context
        this.stopTabSound(tabId);
        this.audioContexts.delete(tabId);

        // Remove tab
        this.tabs.delete(tabId);

        // If closing active tab, switch to another
        if (this.activeTabId === tabId) {
            const remainingTabs = Array.from(this.tabs.values());
            if (remainingTabs.length > 0) {
                this.switchToTab(remainingTabs[0].id);
            } else {
                this.activeTabId = null;
            }
        }

        return true;
    }

    /**
     * Close low priority tab to make room
     */
    private closeLowPriorityTab(): void {
        const lowPriorityTabs = Array.from(this.tabs.values())
            .filter(tab => tab.priority === 'low' && !tab.active)
            .sort((a, b) => a.lastAccessed - b.lastAccessed);

        if (lowPriorityTabs.length > 0) {
            this.closeTab(lowPriorityTabs[0].id);
        } else {
            // Close oldest normal priority tab
            const normalTabs = Array.from(this.tabs.values())
                .filter(tab => tab.priority === 'normal' && !tab.active)
                .sort((a, b) => a.lastAccessed - b.lastAccessed);

            if (normalTabs.length > 0) {
                this.closeTab(normalTabs[0].id);
            }
        }
    }

    /**
     * Set custom sound for tab
     */
    setTabSound(tabId: string, soundUrl: string, volume: number = 1.0, muteOthers: boolean = false): boolean {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;

        tab.customSound = {
            enabled: true,
            soundUrl,
            volume: Math.max(0, Math.min(1, volume)),
            muteOtherTabs: muteOthers
        };

        this.tabs.set(tabId, tab);
        return true;
    }

    /**
     * Play tab sound
     */
    async playTabSound(tabId: string): Promise<boolean> {
        const tab = this.tabs.get(tabId);
        if (!tab || !tab.customSound?.enabled || !tab.customSound.soundUrl) {
            return false;
        }

        try {
            // Mute other tabs if requested
            if (tab.customSound.muteOtherTabs) {
                this.muteAllTabsExcept(tabId);
            }

            // Create or get audio context
            let audioContext = this.audioContexts.get(tabId);
            if (!audioContext) {
                audioContext = new AudioContext();
                this.audioContexts.set(tabId, audioContext);
            }

            // Load and play sound
            const response = await fetch(tab.customSound.soundUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const source = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();

            source.buffer = audioBuffer;
            gainNode.gain.value = tab.customSound.volume;

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            source.start(0);
            return true;
        } catch (error) {
            console.error('[Tab Sound] Failed to play:', error);
            return false;
        }
    }

    /**
     * Stop tab sound
     */
    stopTabSound(tabId: string): void {
        const audioContext = this.audioContexts.get(tabId);
        if (audioContext) {
            audioContext.close();
            this.audioContexts.delete(tabId);
        }
    }

    /**
     * Mute all tabs except specified
     */
    private muteAllTabsExcept(exceptTabId: string): void {
        for (const [tabId, audioContext] of this.audioContexts.entries()) {
            if (tabId !== exceptTabId) {
                audioContext.suspend();
            }
        }
    }

    /**
     * Set tab to keep alive in background
     */
    setKeepAlive(tabId: string, keepAlive: boolean): boolean {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;

        tab.keepAliveInBackground = keepAlive;
        this.tabs.set(tabId, tab);
        return true;
    }

    /**
     * Set tab priority
     */
    setTabPriority(tabId: string, priority: 'high' | 'normal' | 'low'): boolean {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;

        tab.priority = priority;
        this.tabs.set(tabId, tab);
        return true;
    }

    /**
     * Pause tab (suspend execution)
     */
    private pauseTab(tabId: string): void {
        // In a real implementation, this would suspend the WebView
        // For now, we'll just stop the audio
        this.stopTabSound(tabId);
        console.log(`[Tab Manager] Paused tab: ${tabId}`);
    }

    /**
     * Resume tab
     */
    private resumeTab(tabId: string): void {
        const tab = this.tabs.get(tabId);
        if (tab?.customSound?.enabled) {
            this.playTabSound(tabId);
        }
        console.log(`[Tab Manager] Resumed tab: ${tabId}`);
    }

    /**
     * Get all tabs
     */
    getAllTabs(): TabConfig[] {
        return Array.from(this.tabs.values()).sort((a, b) => b.lastAccessed - a.lastAccessed);
    }

    /**
     * Get active tab
     */
    getActiveTab(): TabConfig | null {
        return this.activeTabId ? this.tabs.get(this.activeTabId) || null : null;
    }

    /**
     * Get background tabs
     */
    getBackgroundTabs(): TabConfig[] {
        return Array.from(this.tabs.values()).filter(tab => !tab.active);
    }

    /**
     * Get tabs by priority
     */
    getTabsByPriority(priority: 'high' | 'normal' | 'low'): TabConfig[] {
        return Array.from(this.tabs.values()).filter(tab => tab.priority === priority);
    }

    /**
     * Update tab title
     */
    updateTabTitle(tabId: string, title: string): boolean {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;

        tab.title = title;
        this.tabs.set(tabId, tab);
        return true;
    }

    /**
     * Update tab favicon
     */
    updateTabFavicon(tabId: string, favicon: string): boolean {
        const tab = this.tabs.get(tabId);
        if (!tab) return false;

        tab.favicon = favicon;
        this.tabs.set(tabId, tab);
        return true;
    }

    /**
     * Get tab count
     */
    getTabCount(): number {
        return this.tabs.size;
    }

    /**
     * Set max tabs
     */
    setMaxTabs(max: number): void {
        this.maxTabs = Math.max(1, Math.min(100, max));
    }

    /**
     * Close all tabs except active
     */
    closeOtherTabs(): number {
        const activeId = this.activeTabId;
        let closed = 0;

        for (const [tabId] of this.tabs.entries()) {
            if (tabId !== activeId) {
                this.closeTab(tabId);
                closed++;
            }
        }

        return closed;
    }

    /**
     * Close tabs by priority
     */
    closeTabsByPriority(priority: 'high' | 'normal' | 'low'): number {
        const tabsToClose = this.getTabsByPriority(priority);
        let closed = 0;

        for (const tab of tabsToClose) {
            if (!tab.active) {
                this.closeTab(tab.id);
                closed++;
            }
        }

        return closed;
    }

    /**
     * Get memory usage estimate
     */
    getMemoryUsage(): { total: number; perTab: Map<string, number> } {
        const perTab = new Map<string, number>();
        let total = 0;

        for (const [tabId, tab] of this.tabs.entries()) {
            const usage = tab.memoryUsage || 50; // Default 50MB per tab
            perTab.set(tabId, usage);
            total += usage;
        }

        return { total, perTab };
    }

    /**
     * Optimize memory by closing low-priority tabs
     */
    optimizeMemory(targetMB: number): number {
        const { total } = this.getMemoryUsage();
        if (total <= targetMB) return 0;

        let freed = 0;
        const lowPriorityTabs = this.getTabsByPriority('low')
            .filter(tab => !tab.active)
            .sort((a, b) => a.lastAccessed - b.lastAccessed);

        for (const tab of lowPriorityTabs) {
            if (total - freed <= targetMB) break;
            this.closeTab(tab.id);
            freed += tab.memoryUsage || 50;
        }

        return freed;
    }
}

// Singleton instance
let tabManagerInstance: AdvancedTabManager | null = null;

export function getTabManager(): AdvancedTabManager {
    if (!tabManagerInstance) {
        tabManagerInstance = new AdvancedTabManager();
    }
    return tabManagerInstance;
}
