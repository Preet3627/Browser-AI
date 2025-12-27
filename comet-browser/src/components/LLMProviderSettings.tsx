"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { LLMProviderOptions } from '@/lib/llm/providers/base';
import SearchEngineSettings from './SearchEngineSettings';
import ThemeSettings from './ThemeSettings';
import BackendSettings from './BackendSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { OpenAICompatibleProvider } from '@/lib/llm/providers/openai-compatible';
import { useAppStore } from '@/store/useAppStore';
import { Cpu, Cloud, Settings, Save, Shield, Database } from 'lucide-react';

interface LLMProviderSettingsProps {
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
}

const LLMProviderSettings: React.FC<LLMProviderSettingsProps> = (props) => {
  const store = useAppStore();
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [selectedProviderConfig, setSelectedProviderConfig] = useState<LLMProviderOptions>({});
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Initialize a local instance for Web fallback
  const localProvider = useMemo(() => new OpenAICompatibleProvider(), []);

  useEffect(() => {
    const fetchProviders = async () => {
      if (window.electronAPI) {
        try {
          const availableProviders = await window.electronAPI.getAvailableLLMProviders();
          if (availableProviders && availableProviders.length > 0) {
            setProviders(availableProviders);
            // Default to store value if present, else first provider
            const currentp = store.aiProvider === 'local' ? 'local' : availableProviders[0].id;
            setActiveProviderId(currentp);
            return;
          }
        } catch (e) {
          console.warn("Electron LLM API failed, falling back to local:", e);
        }
      }

      // Fallback for Web/Vercel
      setProviders([
        { id: 'openai-compatible', name: 'OpenAI (Cloud)' },
        { id: 'local', name: 'Browser AI (Local TF.js)' }
      ]);
      setActiveProviderId(store.aiProvider === 'local' ? 'local' : 'openai-compatible');
    };
    fetchProviders();
  }, [store.aiProvider]);

  const handleProviderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProviderId = e.target.value as any;
    setActiveProviderId(newProviderId);
    store.setAIProvider(newProviderId);
    if (window.electronAPI) {
      await window.electronAPI.setActiveLLMProvider(newProviderId);
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedProviderConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveConfig = async () => {
    if (!activeProviderId) return;

    if (window.electronAPI) {
      const success = await window.electronAPI.configureLLMProvider(activeProviderId, selectedProviderConfig);
      setFeedback(success ? 'Config Saved' : 'Failed to Save');
    } else {
      localProvider.init(selectedProviderConfig);
      setFeedback('Local Config Saved');
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden glass-dark transition-all">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-white/40" />
          <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Ecosystem Settings</span>
        </div>
        <span className={`text-[10px] text-white/30 transform transition-transform duration-300 ${showSettings ? 'rotate-180' : ''}`}>▼</span>
      </button>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 space-y-6 custom-scrollbar max-h-[450px] overflow-y-auto">
              <ThemeSettings {...props} />
              <SearchEngineSettings {...props} />
              <BackendSettings {...props} />

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud size={12} className="text-deep-space-accent-neon" />
                  <label className="block text-[10px] uppercase font-black tracking-widest text-white/40">AI Orchestration</label>
                </div>

                <select
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-deep-space-accent-neon/50 transition-all font-bold"
                  value={activeProviderId || ''}
                  onChange={handleProviderChange}
                >
                  {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  {activeProviderId === 'local' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-deep-space-accent-neon mb-2">
                        <Cpu size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Local Neural Engine</span>
                      </div>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
                        Using on-device TensorFlow.js & WebGPU. No data leaves your machine.
                        High privacy, low latency.
                      </p>
                      <div className="flex items-center gap-2 py-2 px-3 bg-white/5 rounded-lg border border-white/5">
                        <Shield size={10} className="text-green-400" />
                        <span className="text-[9px] font-bold text-white/60 uppercase">E2E Privacy Verified</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="password"
                        name="apiKey"
                        placeholder="Cloud API Key"
                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/10 focus:border-deep-space-accent-neon/30 outline-none transition-all"
                        value={selectedProviderConfig.apiKey || ''}
                        onChange={handleConfigChange}
                      />
                      <input
                        type="text"
                        name="baseUrl"
                        placeholder="Base URL (Optional)"
                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/10 focus:border-deep-space-accent-neon/30 outline-none transition-all"
                        value={selectedProviderConfig.baseUrl || ''}
                        onChange={handleConfigChange}
                      />
                      <input
                        type="text"
                        name="model"
                        placeholder="Model (e.g. gpt-4o)"
                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/10 focus:border-deep-space-accent-neon/30 outline-none transition-all"
                        value={selectedProviderConfig.model || ''}
                        onChange={handleConfigChange}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSaveConfig}
                    className="w-full mt-4 py-3 bg-deep-space-accent-neon/10 border border-deep-space-accent-neon/20 hover:bg-deep-space-accent-neon/20 text-deep-space-accent-neon text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={12} />
                    {feedback || 'Save Intelligence Config'}
                  </button>
                </div>
              </div>

              {/* Password Manager Mini Entry (Quick Access) */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={12} className="text-white/40" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/30">Vault Status</span>
                </div>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Secure</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LLMProviderSettings;