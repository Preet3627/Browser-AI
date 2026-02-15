"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

export interface AICommand {
    id: string;
    type: string;
    value: string;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    output?: string;
    error?: string;
    timestamp: number;
}

interface AICommandQueueProps {
    commands: AICommand[];
    currentCommandIndex: number;
    onCancel?: () => void;
}

const getCommandIcon = (type: string) => {
    const icons: Record<string, string> = {
        NAVIGATE: '🌐',
        SEARCH: '🔍',
        READ_PAGE_CONTENT: '📄',
        SCREENSHOT_AND_ANALYZE: '📸',
        OCR_SCREEN: '👁️',
        FIND_AND_CLICK: '🖱️',
        SET_VOLUME: '🔊',
        SET_BRIGHTNESS: '💡',
        SHELL_COMMAND: '🖥️',
        OPEN_APP: '🚀',
        TRANSLATE: '🌍',
        WEB_SEARCH: '🌐',
        EXPLAIN_CAPABILITIES: '🧠',
        WAIT: '⏳',
    };
    return icons[type] || '⚡';
};

const getCommandLabel = (type: string, value: string) => {
    const labels: Record<string, (v: string) => string> = {
        NAVIGATE: (v) => `Navigate to ${v}`,
        SEARCH: (v) => `Search for "${v}"`,
        READ_PAGE_CONTENT: () => 'Read page content',
        SCREENSHOT_AND_ANALYZE: () => 'Capture and analyze screenshot',
        OCR_SCREEN: (v) => v ? `OCR region ${v}` : 'OCR full screen',
        FIND_AND_CLICK: (v) => `Find and click "${v}"`,
        SET_VOLUME: (v) => `Set volume to ${v}%`,
        SET_BRIGHTNESS: (v) => `Set brightness to ${v}%`,
        SHELL_COMMAND: (v) => `Execute: ${v.substring(0, 30)}...`,
        OPEN_APP: (v) => `Open ${v}`,
        TRANSLATE: (v) => `Translate to ${v}`,
        WEB_SEARCH: (v) => `Web search: "${v}"`,
        EXPLAIN_CAPABILITIES: () => 'Explain AI capabilities',
        WAIT: (v) => `Wait ${parseInt(v) / 1000}s`,
    };
    return labels[type] ? labels[type](value) : `${type}: ${value}`;
};

export const AICommandQueue: React.FC<AICommandQueueProps> = ({
    commands,
    currentCommandIndex,
    onCancel
}) => {
    if (commands.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[10000] w-96 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <h3 className="text-sm font-bold text-white">AI Action Chain</h3>
                </div>
                <div className="text-xs text-cyan-400 font-mono">
                    {currentCommandIndex + 1} / {commands.length}
                </div>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                    {commands.map((command, index) => {
                        const isActive = index === currentCommandIndex;
                        const isPast = index < currentCommandIndex;
                        const isFuture = index > currentCommandIndex;

                        return (
                            <motion.div
                                key={command.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`px-4 py-3 border-b border-slate-700/50 transition-all ${isActive ? 'bg-cyan-500/10' : isPast ? 'bg-green-500/5' : 'bg-transparent'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Status Icon */}
                                    <div className="mt-0.5">
                                        {command.status === 'completed' && (
                                            <CheckCircle2 size={18} className="text-green-400" />
                                        )}
                                        {command.status === 'executing' && (
                                            <Loader2 size={18} className="text-cyan-400 animate-spin" />
                                        )}
                                        {command.status === 'failed' && (
                                            <AlertCircle size={18} className="text-red-400" />
                                        )}
                                        {command.status === 'pending' && (
                                            <Circle size={18} className="text-slate-500" />
                                        )}
                                    </div>

                                    {/* Command Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{getCommandIcon(command.type)}</span>
                                            <span className={`text-sm font-medium ${isActive ? 'text-cyan-300' : isPast ? 'text-green-300' : 'text-slate-400'
                                                }`}>
                                                {getCommandLabel(command.type, command.value)}
                                            </span>
                                        </div>

                                        {/* Output/Error */}
                                        {command.output && (
                                            <div className="text-xs text-slate-400 mt-1 truncate">
                                                {command.output}
                                            </div>
                                        )}
                                        {command.error && (
                                            <div className="text-xs text-red-400 mt-1 truncate">
                                                ❌ {command.error}
                                            </div>
                                        )}

                                        {/* Progress indicator for active command */}
                                        {isActive && command.status === 'executing' && (
                                            <div className="mt-2 w-full bg-slate-700 rounded-full h-1 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-400"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow for future commands */}
                                    {isFuture && (
                                        <ChevronRight size={16} className="text-slate-600 mt-0.5" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Footer */}
            {onCancel && (
                <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700/50">
                    <button
                        onClick={onCancel}
                        className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all border border-red-500/30"
                    >
                        Cancel Remaining Actions
                    </button>
                </div>
            )}

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
        </motion.div>
    );
};
