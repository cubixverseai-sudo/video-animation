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

    const suggestions = [
        { label: 'Make it faster', icon: '⚡' },
        { label: 'Add cinematic fade', icon: '🎬' },
        { label: 'Indigo Vibrance', icon: '🎨' },
        { label: 'Beat Sync', icon: '🎵' },
    ];

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
            <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(12, 12, 18, 0.95), rgba(8, 8, 12, 0.98))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 80px rgba(99, 102, 241, 0.03)',
                }}
            >
                {/* Suggestions */}
                <div className="flex gap-2 px-3.5 pt-3 pb-1.5 overflow-x-auto scrollbar-hide no-scrollbar">
                    {suggestions.map((chip) => (
                        <button
                            key={chip.label}
                            onClick={() => { setInput(chip.label); }}
                            className="px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.04] text-[11px] font-semibold uppercase tracking-wider text-[#6A6A80] hover:bg-indigo-500/8 hover:text-indigo-300/80 hover:border-indigo-500/15 transition-all whitespace-nowrap"
                        >
                            <span className="mr-1">{chip.icon}</span>
                            {chip.label}
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
                            className="px-3 pb-1"
                        >
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-500/8 border border-indigo-500/15 w-fit">
                                <Sparkles className="w-3 h-3 text-indigo-400/70" />
                                <span className="text-[11px] font-mono text-indigo-300/70">{attachedFile.name}</span>
                                <button onClick={() => setAttachedFile(null)} className="text-[#555566] hover:text-red-400 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="relative px-1 pb-1.5 pt-0.5">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,audio/*"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/[0.03] text-[#444455] hover:text-indigo-400/70 transition-all"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </button>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a creative twist... 'Add glitch effects to titles'"
                        className="w-full bg-transparent border-none rounded-lg pl-12 pr-24 py-3.5 text-sm text-gray-200 placeholder:text-[#3A3A4A] focus:outline-none focus:ring-0 transition-all"
                    />
                    <button
                        disabled={(!input.trim() && !attachedFile) || isUploading}
                        onClick={handleSend}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-indigo-500/10 disabled:opacity-20 disabled:grayscale hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                    >
                        Direct
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
