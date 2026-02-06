import { Lock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/stores/projectStore';
import { useAgentStore } from '@/stores/agentStore';

export function PreviewContainer() {
    const { socket } = useSocket();
    const { status, projectId } = useProjectStore();
    const { isThinking } = useAgentStore();
    
    const [isPreviewReady, setIsPreviewReady] = useState(false);
    
    useEffect(() => {
        if (isThinking) {
            setIsPreviewReady(false);
        }
    }, [isThinking]);
    
    useEffect(() => {
        if (!socket) return;
        
        const handlePreviewReady = () => {
            setIsPreviewReady(true);
        };
        
        socket.on('preview:ready', handlePreviewReady);
        
        return () => {
            socket.off('preview:ready', handlePreviewReady);
        };
    }, [socket]);

    const isLocked = !projectId || (!isPreviewReady) || (isThinking && !isPreviewReady);
    const previewUrl = `/preview/${projectId}`;

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Viewport Area */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-6 relative z-10">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="aspect-video w-full max-w-5xl relative rounded-lg overflow-hidden"
                    style={{
                        boxShadow: isLocked
                            ? '0 0 80px rgba(99, 102, 241, 0.03)'
                            : '0 4px 60px rgba(0,0,0,0.5), 0 0 120px rgba(99, 102, 241, 0.04)',
                    }}
                >
                    {/* Subtle border */}
                    <div className="absolute inset-0 rounded-lg border border-white/[0.04] z-30 pointer-events-none" />

                    {/* The Player */}
                    <div className={`w-full h-full transition-all duration-700 ease-out ${isLocked ? 'blur-2xl scale-[0.97] opacity-10' : 'blur-0 scale-100 opacity-100'}`}>
                        {!isLocked && (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0 bg-black"
                                title="Video Preview"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>

                    {/* Locked Overlay */}
                    <AnimatePresence>
                        {isLocked && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#06060A]/80 backdrop-blur-sm"
                            >
                                {/* Scan line */}
                                <motion.div
                                    animate={{ top: ['-5%', '105%'] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-px z-0"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(99,102,241,0.5), rgba(99,102,241,0.3), transparent)',
                                        boxShadow: '0 0 20px rgba(99,102,241,0.2)',
                                    }}
                                />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    {/* Lock icon with pulse */}
                                    <div className="relative mb-5">
                                        <motion.div
                                            className="absolute inset-0 rounded-full border border-indigo-500/15"
                                            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <div className="relative w-14 h-14 rounded-full bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-center">
                                            <Lock className="w-6 h-6 text-indigo-400/70" />
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold tracking-[0.25em] text-white/80 mb-2 uppercase">
                                        Rendering
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 text-indigo-400/60 animate-spin" />
                                        <span className="text-xs font-mono text-indigo-300/50 uppercase tracking-widest">
                                            {isThinking ? "Building composition..." : "Preparing preview..."}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Corner marks */}
                    {[
                        'top-0 left-0 border-t border-l rounded-tl',
                        'top-0 right-0 border-t border-r rounded-tr',
                        'bottom-0 left-0 border-b border-l rounded-bl',
                        'bottom-0 right-0 border-b border-r rounded-br',
                    ].map((pos, i) => (
                        <div
                            key={i}
                            className={`absolute w-5 h-5 ${pos} border-indigo-500/15 pointer-events-none z-30`}
                        />
                    ))}
                </motion.div>
            </div>

            {/* Bottom Stats */}
            <AnimatePresence>
                {!isLocked && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ delay: 0.2 }}
                        className="absolute bottom-3 right-5 pointer-events-none flex items-center gap-4 z-20"
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-[#4A4A5A] font-semibold uppercase tracking-[0.15em] leading-none">Resolution</span>
                            <span className="text-xs font-mono text-indigo-400/60 mt-0.5">1920 x 1080</span>
                        </div>
                        <div className="w-px h-6 bg-[#1A1A24]" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-[#4A4A5A] font-semibold uppercase tracking-[0.15em] leading-none">Frame Rate</span>
                            <span className="text-xs font-mono text-[#3B82F6]/60 mt-0.5">30 FPS</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
