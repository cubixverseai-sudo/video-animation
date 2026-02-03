import { Play, Pause, Maximize2, Download, Lock, Cpu, Activity, Loader2 } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { useState, useEffect } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/stores/projectStore';
import { useAgentStore } from '@/stores/agentStore';

export function PreviewContainer() {
    const { status, projectId } = useProjectStore();
    const { isThinking } = useAgentStore();

    // Unlock only when we have a project and the agent is not actively working.
    // While the agent is thinking/building or the project has not produced a
    // first render yet, we keep the viewport visually "isolated".
    const isLocked = !projectId || status === 'idle' || status === 'generating' || isThinking;

    // Use the new isolated preview route
    const previewUrl = `/preview/${projectId}`;

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden group">
            {/* Cinematic Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(var(--accent-primary) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
            />

            {/* Viewport Area */}
            <div className="flex-1 flex items-center justify-center p-12 relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="aspect-video w-full max-w-5xl glass-pane border border-white/10 relative shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    {/* The Player - Isolated in Iframe */}
                    <div className={`w-full h-full transition-all duration-1000 ${isLocked ? 'blur-3xl grayscale scale-95 opacity-20' : 'blur-0 grayscale-0 scale-100 opacity-100'}`}>
                        {!isLocked && (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0"
                                title="Isolated Video Preview"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>

                    {/* --- LOCKED OVERLAY (THE AGENT HUD) --- */}
                    <AnimatePresence>
                        {isLocked && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
                            >
                                {/* Scanner Effect */}
                                <motion.div
                                    animate={{ top: ['-10%', '110%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-[1px] bg-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,1)] z-0"
                                />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
                                        <div className="relative w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                            <Lock className="w-6 h-6 text-indigo-400" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black italic tracking-widest text-white mb-1 uppercase">
                                        System Isolated
                                    </h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
                                        <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest">
                                            {isThinking ? "Agent Constructing Framework..." : "Stabilizing Neural Link..."}
                                        </span>
                                    </div>

                                    {/* Small Tech Stats */}
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5">
                                            <Cpu className="w-3 h-3 text-zinc-500" />
                                            <span className="text-[9px] font-mono text-zinc-400 uppercase">GPU-ACCEL</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5">
                                            <Activity className="w-3 h-3 text-indigo-500" />
                                            <span className="text-[9px] font-mono text-zinc-400 uppercase">CALIBRATING</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Corner Accents (Always Visible) */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--accent-primary)]/30 rounded-tl-xl p-1 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--status-info)]/30 rounded-tr-xl p-1 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--accent-secondary)]/30 rounded-bl-xl p-1 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--accent-primary)]/30 rounded-br-xl p-1 pointer-events-none" />
                </motion.div>
            </div>

            {/* Bottom Info Status (Hidden when locked for cleaner look) */}
            <AnimatePresence>
                {!isLocked && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 right-6 pointer-events-none flex items-center gap-6 z-20"
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none">Export Resolution</span>
                            <span className="text-xs font-mono text-[var(--accent-primary)]">3840 x 2160 PXL</span>
                        </div>
                        <div className="w-px h-8 bg-[var(--border-visible)]" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none">Frame Rate</span>
                            <span className="text-xs font-mono text-[var(--status-info)]">60.00 FPS</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
