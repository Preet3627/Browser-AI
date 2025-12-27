"use client";

import React from 'react';

interface ThemeSettingsProps {
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  backgroundImage: string;
  setBackgroundImage: (imageUrl: string) => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ theme, setTheme, backgroundImage, setBackgroundImage }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40">Theme</label>
        <div className="grid grid-cols-3 gap-2">
          {['dark', 'light', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t as 'dark' | 'light' | 'system')}
              className={`py-1.5 rounded-lg border text-[10px] uppercase font-bold tracking-wider transition-all ${theme === t
                ? 'bg-deep-space-accent-neon/20 border-deep-space-accent-neon/40 text-deep-space-accent-neon shadow-[0_0_10px_rgba(0,255,255,0.1)]'
                : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40">Canvas Overlay</label>
        <input
          type="text"
          placeholder="Image URL..."
          className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/10 focus:border-deep-space-accent-neon/30 outline-none transition-all"
          value={backgroundImage}
          onChange={(e) => setBackgroundImage(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ThemeSettings;
