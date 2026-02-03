"use client";

import { motion } from 'framer-motion';

const ThinkingIndicator = () => {
  return (
    <div className="flex items-center gap-3 py-2 px-3 self-start group">
      <div className="relative flex items-center justify-center w-4 h-4">
        {/* Core Pulsing Dot */}
        <motion.div
          className="w-1.5 h-1.5 bg-sky-400 rounded-full z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Modern Glow Ring (Inspired by URL bar) */}
        <motion.div
          className="absolute inset-0 rounded-full border border-sky-400/50 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />

        {/* Subtle Static Glow */}
        <div className="absolute inset-[-4px] rounded-full bg-sky-400/5 blur-sm" />
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400/60 group-hover:text-sky-400 transition-colors duration-300">
          Neural Processing
        </span>
      </div>
    </div>
  );
};

export default ThinkingIndicator;

