"use client";

import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";

const KeyboardShortcutSettings = () => {
  const store = useAppStore();
  const shortcuts = store.shortcuts;

  const handleUpdateShortcut = (action: string, newAccelerator: string) => {
    store.updateShortcut(action, newAccelerator);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.action}
            className="w-full px-4 py-3 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 transition-all hover:bg-white/10"
          >
            <span className="text-sm font-bold text-white capitalize">{shortcut.action.replace('-', ' ')}</span>
            <input
              type="text"
              value={shortcut.accelerator}
              readOnly
              onKeyDown={(e) => {
                e.preventDefault();
                const parts = [];
                if (e.ctrlKey || e.metaKey) parts.push('CommandOrControl');
                if (e.altKey) parts.push('Alt');
                if (e.shiftKey) parts.push('Shift');

                const key = e.key.toUpperCase();
                // Ignore modifier-only presses
                if (['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) return;

                let finalKey = key;
                if (key === ' ') finalKey = 'Space';
                else if (key === 'ARROWUP') finalKey = 'Up';
                else if (key === 'ARROWDOWN') finalKey = 'Down';
                else if (key === 'ARROWLEFT') finalKey = 'Left';
                else if (key === 'ARROWRIGHT') finalKey = 'Right';
                else if (key === 'ESCAPE') finalKey = 'Esc';
                else if (key === 'ENTER') finalKey = 'Enter';
                else if (key === 'BACKSPACE') finalKey = 'Backspace';
                else if (key === 'DELETE') finalKey = 'Delete';
                else if (key === 'TAB') finalKey = 'Tab';

                parts.push(finalKey);
                const newAccelerator = parts.join('+');
                handleUpdateShortcut(shortcut.action, newAccelerator);
              }}
              className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-deep-space-accent-neon font-black tracking-widest focus:outline-none focus:border-deep-space-accent-neon/50 w-48 text-right cursor-pointer"
              placeholder="Press Keys..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardShortcutSettings;
