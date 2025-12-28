"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from "@/lib/llm/providers/base";
import LLMProviderSettings from './LLMProviderSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from "firebase/auth";
import firebaseService from '@/lib/FirebaseService';
import ThinkingIndicator from './ThinkingIndicator';
import { useAppStore } from '@/store/useAppStore';
import { Sparkles, Terminal, Code2, Image as ImageIcon, Maximize2, Minimize2, FileText, Download, Wifi, WifiOff } from 'lucide-react';
import MediaSuggestions from './MediaSuggestions';
import { offlineChatbot } from '@/lib/OfflineChatbot';

interface AIChatSidebarProps {
  studentMode: boolean;
  toggleStudentMode: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  selectedEngine: string;
  setSelectedEngine: (engine: string) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  backgroundImage: string;
  setBackgroundImage: (imageUrl: string) => void;
  backend: string;
  setBackend: (backend: string) => void;
  mysqlConfig: any;
  setMysqlConfig: (config: any) => void;
  side?: 'left' | 'right';
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = (props) => {
  const store = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [aiMode, setAiMode] = useState<'cloud' | 'offline' | 'auto'>('auto');
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged((user) => {
      setUser(user);
      if (window.electronAPI) {
        window.electronAPI.setUserId(user ? user.uid : null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSendMessage = async (customContent?: string) => {
    const contentToUse = customContent || inputMessage.trim();
    if (!contentToUse) return;

    const userMessage: ChatMessage = { role: 'user', content: contentToUse };
    setMessages(prev => [...prev, userMessage]);
    if (!customContent) setInputMessage('');
    setIsLoading(true);
    setError(null);

    // Smart AI switching
    const shouldUseOffline = aiMode === 'offline' || (aiMode === 'auto' && !isOnline);

    if (shouldUseOffline) {
      // Use offline chatbot
      const response = offlineChatbot.chat(contentToUse);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
      setIsLoading(false);
      return;
    }

    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.generateChatContent([...messages, userMessage]);
        if (response.error) {
          setError(response.error);
        } else if (response.text) {
          let text = response.text;

          // Command Processing
          if (text.includes('NAVIGATE:')) {
            const match = text.match(/NAVIGATE:\s*(https?:\/\/[^\s]+)/);
            if (match) {
              store.setCurrentUrl(match[1]);
              store.setActiveView('browser');
              text = text.replace(/NAVIGATE:\s*[^\s]+/, '🌐 Navigating to specified address...');
            }
          }
          if (text.includes('CODING_MODE: ON')) {
            store.setCodingMode(true);
            text = text.replace('CODING_MODE: ON', '🚀 Switching to Coding Dashboard...');
          }

          setMessages(prev => [...prev, { role: 'model', content: text }]);
        }
      } else {
        setError("AI Engine not connected.");
      }
    } catch (err: any) {
      setError(`Response Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTxt = async () => {
    if (messages.length === 0) return;
    const success = await window.electronAPI.exportChatAsTxt(messages);
    if (success) alert('Chat exported as TXT');
  };

  const handleExportPdf = async () => {
    if (messages.length === 0) return;
    const success = await window.electronAPI.exportChatAsPdf(messages);
    if (success) alert('Chat exported as PDF');
  };

  if (props.isCollapsed) {
    return (
      <div className="flex flex-col items-center h-full py-2 space-y-6">
        <button onClick={props.toggleCollapse} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-deep-space-accent-neon transition-all">
          <span className="text-xl">📊</span>
        </button>
        <div className="flex-1" />
        <button onClick={props.toggleStudentMode} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${props.studentMode ? 'bg-deep-space-accent-neon text-deep-space-bg neon-glow' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
          <span className="text-2xl">🎓</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full gap-6 transition-all duration-500 rounded-[2.5rem] ${isFullScreen ? 'fixed inset-10 z-[300] bg-deep-space-bg border border-white/10 p-12 shadow-[0_0_100px_rgba(0,0,0,0.9)]' : ''}`}>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-deep-space-accent-neon flex items-center justify-center text-deep-space-bg font-bold shadow-[0_0_20px_rgba(0,255,255,0.4)]">
            {store.appName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">{store.appName} AI</h2>
            {isFullScreen && <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mt-1">Immersive Intelligence Workspace</p>}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {isOnline ? (
              <Wifi size={12} className="text-green-400" />
            ) : (
              <WifiOff size={12} className="text-orange-400" />
            )}
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
              {aiMode === 'auto' ? (isOnline ? 'Cloud' : 'Offline') : aiMode}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const modes: Array<'cloud' | 'offline' | 'auto'> = ['auto', 'cloud', 'offline'];
              const currentIndex = modes.indexOf(aiMode);
              setAiMode(modes[(currentIndex + 1) % modes.length]);
            }}
            className="p-2 text-white/20 hover:text-white transition-colors text-[10px] font-bold"
            title="Toggle AI Mode"
          >
            {aiMode === 'auto' ? '🤖' : aiMode === 'cloud' ? '☁️' : '📴'}
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 text-white/20 hover:text-deep-space-accent-neon transition-colors"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={props.toggleCollapse} className="p-2 text-white/20 hover:text-white transition-colors">
            <span className="text-sm">{props.isCollapsed ? (props.side === 'right' ? '◀' : '▶') : (props.side === 'right' ? '▶' : '◀')}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
            <div className="w-16 h-16 rounded-3xl glass-vibrant flex items-center justify-center mb-6 text-3xl shadow-2xl shadow-deep-space-accent-neon/20 animate-pulse">✨</div>
            <h3 className="text-white font-bold mb-2">How can {store.appName} help?</h3>
            <p className="text-white/30 text-xs leading-relaxed max-w-[200px]">I can summarize {store.tabs.find(t => t.id === store.activeTabId)?.title || 'pages'}, write code, or organize your research.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[95%] p-4 rounded-3xl text-sm leading-relaxed backdrop-blur-md ${msg.role === 'user'
                ? 'bg-deep-space-primary/30 text-white border border-white/10 rounded-tr-none'
                : 'bg-white/[0.03] text-white/90 border border-white/5 rounded-tl-none'
                }`}>
                {msg.content.split(/(\$.*?\$)/).map((part, i) => {
                  if (part.startsWith('$') && part.endsWith('$')) {
                    return <span key={i} className="font-mono text-deep-space-accent-neon bg-white/5 px-1 rounded">{part.slice(1, -1)}</span>;
                  }
                  return part;
                })}
                {(msg.role === 'model' && (msg.content.toLowerCase().includes('story') || msg.content.toLowerCase().includes('email'))) && (
                  <div className="mt-4">
                    <MediaSuggestions onSelect={(url) => setInputMessage(prev => prev + `\n![image](${url})`)} />
                  </div>
                )}
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-white/10 mt-2 px-1">
                {msg.role === 'user' ? 'Local User' : `${store.appName} Intelligence`}
              </span>
            </motion.div>
          ))
        )}
        {isLoading && (
          <div className="flex flex-col items-start translate-x-1">
            <div className="bg-white/[0.03] border border-white/10 p-4 rounded-3xl rounded-tl-none backdrop-blur-xl">
              <ThinkingIndicator />
            </div>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400">
            ⚠️ {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="space-y-4">
        {messages.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleExportTxt}
              className="flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-3 px-3 rounded-xl border border-white/5 bg-white/[0.02] text-white/30 hover:bg-white/5 hover:text-white transition-all"
            >
              <FileText size={12} /> .TXT
            </button>
            <button
              onClick={handleExportPdf}
              className="flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-3 px-3 rounded-xl border border-white/5 bg-white/[0.02] text-white/30 hover:bg-white/5 hover:text-white transition-all"
            >
              <Download size={12} /> .PDF
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => handleSendMessage("Summarize the main points of this page")}
            className="flex-1 text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-lg border border-white/5 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all overflow-hidden whitespace-nowrap"
          >
            Summarize
          </button>
          <button
            onClick={() => handleSendMessage("Explain the technical content here")}
            className="flex-1 text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-lg border border-white/5 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all overflow-hidden whitespace-nowrap"
          >
            Explain
          </button>
        </div>

        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask anything..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-deep-space-accent-neon/50 resize-none h-24 transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-deep-space-accent-neon text-deep-space-bg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] disabled:opacity-50"
            disabled={!inputMessage.trim() || isLoading}
          >
            <span className="transform -rotate-45 mb-1 ml-0.5">➤</span>
          </button>
        </div>

        <LLMProviderSettings
          {...props}
        />
      </footer>
    </div>
  );
};

export default AIChatSidebar;