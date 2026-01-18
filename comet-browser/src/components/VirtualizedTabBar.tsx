// Memory-efficient virtualized tab bar for 50+ tabs
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Globe, Plus, Volume2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface Tab {
  id: string;
  title: string;
  url?: string;
  isAudible?: boolean;
}

interface VirtualizedTabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onAddTab: () => void;
  isTabSuspended?: (tabId: string) => boolean;
  maxVisibleTabs?: number;
}

const TAB_WIDTH = 180; // Approximate width of each tab
const PADDING = 16;

export const VirtualizedTabBar: React.FC<VirtualizedTabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onAddTab,
  isTabSuspended,
  maxVisibleTabs = 10,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const store = useAppStore();

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate visible range for virtualization
  const visibleRange = useMemo(() => {
    if (tabs.length <= maxVisibleTabs) {
      return { start: 0, end: tabs.length };
    }

    const activeIndex = tabs.findIndex(t => t.id === activeTabId);
    const visibleCount = Math.floor(containerWidth / TAB_WIDTH);
    const start = Math.max(0, activeIndex - Math.floor(visibleCount / 2));
    const end = Math.min(tabs.length, start + visibleCount);

    return { start, end };
  }, [tabs, activeTabId, containerWidth, maxVisibleTabs]);

  // Auto-scroll to active tab
  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTabId);
    if (activeIndex >= 0 && scrollContainerRef.current) {
      const scrollPosition = activeIndex * TAB_WIDTH - containerWidth / 2 + TAB_WIDTH / 2;
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });
    }
  }, [activeTabId, tabs, containerWidth]);

  // For small tab counts, render all tabs normally
  if (tabs.length <= maxVisibleTabs) {
    return (
      <div className="h-10 flex items-center px-4 gap-1 bg-black/40 border-b border-white/5 overflow-x-auto custom-scrollbar no-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`group flex items-center h-8 px-4 rounded-t-xl min-w-[140px] max-w-[200px] cursor-pointer transition-all border-t border-x ${
              activeTabId === tab.id
                ? 'bg-white/10 border-white/10 text-white'
                : 'bg-transparent border-transparent text-white/30 hover:bg-white/5'
            }`}
          >
            {tab.isAudible && <Volume2 size={12} className="mr-2 flex-shrink-0 text-deep-space-accent-neon" />}
            {!tab.isAudible && <Globe size={12} className="mr-2 flex-shrink-0" />}
            <span
              className={`text-[10px] font-bold truncate flex-1 ${
                isTabSuspended?.(tab.id) ? 'opacity-50' : ''
              }`}
            >
              {tab.title}
              {isTabSuspended?.(tab.id) && (
                <span className="ml-1 text-[8px] text-white/30">(z)</span>
              )}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    store.updateTab(tab.id, { isAudible: !tab.isAudible });
                }}
                className="ml-2 p-0.5 rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Volume2 size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="ml-2 p-0.5 rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus size={10} className="rotate-45" />
            </button>
          </div>
        ))}
        <button
          onClick={onAddTab}
          className="p-1.5 rounded-lg text-white/20 hover:bg-white/10 hover:text-white transition-all ml-2"
        >
          <Plus size={14} />
        </button>
      </div>
    );
  }

  // Virtualized rendering for large tab counts
  const visibleTabs = tabs.slice(visibleRange.start, visibleRange.end);
  const leftSpacer = visibleRange.start * TAB_WIDTH;
  const rightSpacer = (tabs.length - visibleRange.end) * TAB_WIDTH;

  return (
    <div
      ref={scrollContainerRef}
      className="h-10 flex items-center px-4 gap-1 bg-black/40 border-b border-white/5 overflow-x-auto custom-scrollbar"
      onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
    >
      {/* Left spacer for virtualized items */}
      <div style={{ width: leftSpacer, flexShrink: 0 }} />

      {/* Visible tabs */}
      {visibleTabs.map((tab, index) => {
        const actualIndex = visibleRange.start + index;
        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`group flex items-center h-8 px-4 rounded-t-xl min-w-[140px] max-w-[200px] cursor-pointer transition-all border-t border-x ${
              activeTabId === tab.id
                ? 'bg-white/10 border-white/10 text-white'
                : 'bg-transparent border-transparent text-white/30 hover:bg-white/5'
            }`}
          >
            {tab.isAudible && <Volume2 size={12} className="mr-2 flex-shrink-0 text-deep-space-accent-neon" />}
            {!tab.isAudible && <Globe size={12} className="mr-2 flex-shrink-0" />}
            <span
              className={`text-[10px] font-bold truncate flex-1 ${
                isTabSuspended?.(tab.id) ? 'opacity-50' : ''
              }`}
            >
              {tab.title}
              {isTabSuspended?.(tab.id) && (
                <span className="ml-1 text-[8px] text-white/30">(z)</span>
              )}
            </span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    store.updateTab(tab.id, { isAudible: !tab.isAudible });
                }}
                className="ml-2 p-0.5 rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Volume2 size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="ml-2 p-0.5 rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus size={10} className="rotate-45" />
            </button>
          </div>
        );
      })}

      {/* Right spacer for virtualized items */}
      <div style={{ width: rightSpacer, flexShrink: 0 }} />

      {/* Tab counter and add button */}
      <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
        <span className="text-[8px] text-white/30 font-bold">
          {tabs.length} tabs
        </span>
        <button
          onClick={onAddTab}
          className="p-1.5 rounded-lg text-white/20 hover:bg-white/10 hover:text-white transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
