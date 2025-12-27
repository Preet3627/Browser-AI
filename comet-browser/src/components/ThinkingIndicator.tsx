"use client";

import { motion } from 'framer-motion';

const ThinkingIndicator = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-deep-space-accent-neon rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-deep-space-accent-neon/60">
        Assistant is thinking
      </span>
    </div>
  );
};

export default ThinkingIndicator;
