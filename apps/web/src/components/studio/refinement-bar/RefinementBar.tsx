"use client";

import { Send, Sparkles, Paperclip, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useParams } from 'next/navigation';
import { useAgentStore } from '@/stores/agentStore';

export function RefinementBar() {
    const [input, setInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [attachedFile, setAttachedFile] = useState<{ name: string, path: string } | null>(null);
    const { socket } = useSocket();
    const params = useParams();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { reset, setThinking } = useAgentStore();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !params.projectId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('asset', file);

        try {
            const res = await fetch(`http://localhost:4000/projects/${params.projectId}/assets`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.path) {
                setAttachedFile({ name: file.name, path: data.path });
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSend = () => {
        if ((!input.trim() && !attachedFile) || !socket) return;

        // Reset steps and start thinking state for new task
        reset();
        setThinking(true);

        let promptWithAsset = input;
        if (attachedFile) {
            promptWithAsset = `${input}\n[Context: User attached file ${attachedFile.name} located at ${attachedFile.path}]`;
        }

        socket.emit('agent:prompt', { prompt: promptWithAsset });
        setInput('');
        setAttachedFile(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-pane premium-border p-2 rounded-2xl shadow-2xl"
            >
                {/* Suggestions */}
                <div className="flex gap-2 px-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                    {['⚡ Make it faster', '🎬 Add cinematic fade', '🎨 Indigo Vibrance', '🎵 Beat Sync'].map((chip) => (
                        <button
                            key={chip}
                            onClick={() => { setInput(chip.replace(/[^a-zA-Z\s]/g, '').trim()); }}
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/20 hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/30 transition-all whitespace-nowrap"
                        >
                            {chip}
                        </button>
                    ))}
                </div>

                {/* Attachment Preview */}
                <AnimatePresence>
                    {attachedFile && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-2"
                        >
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 w-fit">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-mono text-indigo-200">{attachedFile.name}</span>
                                <button onClick={() => setAttachedFile(null)} className="hover:text-red-400 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="relative mt-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,audio/*"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </button>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a creative twist... 'Add glitch effects to titles'"
                        className="w-full bg-transparent border-none rounded-xl pl-12 pr-24 py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-0 transition-all"
                    />
                    <button
                        disabled={(!input.trim() && !attachedFile) || isUploading}
                        onClick={handleSend}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white text-xs font-bold shadow-lg shadow-[var(--accent-glow)] disabled:opacity-30 disabled:grayscale hover:scale-105 transition-all active:scale-95"
                    >
                        DIRECT
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
