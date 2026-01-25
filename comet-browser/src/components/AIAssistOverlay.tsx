import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, Search, ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';

interface AIAssistOverlayProps {
    query: string;
    result: string | null;
    sources: { text: string; metadata: any; }[] | null;
    isLoading: boolean;
    onClose: () => void;
}

const AIAssistOverlay = ({ query, result, sources, isLoading, onClose }: AIAssistOverlayProps) => {
    return (
        <div className="fixed top-28 right-8 w-[420px] z-[60] pointer-events-none">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="pointer-events-auto bg-[#070812]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            >
                {/* Header Section */}
                <div className="p-6 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-deep-space-accent-neon/10 flex items-center justify-center text-deep-space-accent-neon shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                            {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-deep-space-accent-neon">Pro Insight Engine</h2>
                            <p className="text-xs font-bold text-white/90 truncate max-w-[200px]">{query}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-4 flex-1 overflow-y-auto no-scrollbar space-y-6">
                    {/* Sources Section */}
                    {!isLoading && sources && sources.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-white/30">Verified Sources</h3>
                            <div className="space-y-2">
                                {sources.map((s, i: number) => (
                                    <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                                        <a href={s.metadata.url} target="_blank" rel="noopener noreferrer" className="text-xs text-deep-space-accent-neon hover:underline truncate block">
                                            {s.metadata.url}
                                        </a>
                                        <p className="text-sm text-white/70 mt-1">{s.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="relative">
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="h-4 bg-white/5 rounded-lg w-full animate-pulse" />
                                <div className="h-4 bg-white/5 rounded-lg w-5/6 animate-pulse" />
                                <div className="h-20 bg-white/[0.02] rounded-2xl w-full animate-pulse" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="prose prose-invert prose-sm text-white/80 leading-relaxed font-medium">
                                    <div dangerouslySetInnerHTML={{ __html: result || "Processing semantic data..." }} />
                                </div>

                                {/* Deep Insight Points */}
                                <div className="p-4 rounded-2xl bg-deep-space-accent-neon/[0.03] border border-deep-space-accent-neon/10 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1 h-1 rounded-full bg-deep-space-accent-neon shadow-[0_0_10px_#00ffff]" />
                                        <p className="text-[11px] text-white/70 leading-normal">Synthesized from primary web index and local browser memory.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1 h-1 rounded-full bg-deep-space-accent-neon shadow-[0_0_10px_#00ffff]" />
                                        <p className="text-[11px] text-white/70 leading-normal">Key entity relationship detected: <span className="text-deep-space-accent-neon">Efficiency</span> and <span className="text-deep-space-accent-neon">Context</span>.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Follow-ups */}
                {!isLoading && (
                    <div className="p-6 pt-0 mt-2">
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-white/30">Next Steps</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-bold text-white/60 transition-all text-left flex items-center justify-between group">
                                    Explore More <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                                <button className="p-3 bg-deep-space-accent-neon/10 border border-deep-space-accent-neon/20 hover:bg-deep-space-accent-neon/20 rounded-xl text-[9px] font-bold text-deep-space-accent-neon transition-all text-left flex items-center justify-between group">
                                    Cite Info <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AIAssistOverlay;
