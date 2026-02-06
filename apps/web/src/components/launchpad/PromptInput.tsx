// @ts-nocheck — Legacy launchpad component (unused)
"use client";

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    disabled?: boolean;
}

export function PromptInput({
    value,
    onChange,
    onSubmit,
    placeholder = "Describe your dream video... e.g., 'A cinematic product reveal for a luxury watch with golden particles'",
    disabled = false
}: PromptInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(0);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
        setCharCount(value.length);
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <motion.div
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Glow effect on focus */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </AnimatePresence>

            {/* Main container */}
            <div
                className={cn(
                    "relative overflow-hidden rounded-2xl transition-all duration-300",
                    "bg-gradient-to-b from-[#0F0F14] to-[#0A0A0E]",
                    "border",
                    isFocused
                        ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                        : "border-[#1F1F28] hover:border-[#2A2A35]"
                )}
            >
                {/* Top decorative bar */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A22]">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Wand2 className="w-4 h-4 text-indigo-400" />
                            <motion.div
                                className="absolute -inset-1 bg-indigo-500/20 rounded-full blur-sm"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                        <span className="text-sm font-medium text-[#8888A0]">
                            Creative Prompt
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-xs tabular-nums transition-colors",
                            charCount > 500 ? "text-amber-400" : "text-[#555566]"
                        )}>
                            {charCount} / 1000
                        </span>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#15151D] text-[#666677] text-xs">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Enhanced</span>
                        </div>
                    </div>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value.slice(0, 1000))}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={3}
                    className={cn(
                        "w-full px-4 py-4 bg-transparent resize-none",
                        "text-[#E8E8F0] text-base leading-relaxed",
                        "placeholder:text-[#444455] placeholder:text-base",
                        "focus:outline-none",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "scrollbar-thin scrollbar-thumb-[#2A2A35] scrollbar-track-transparent"
                    )}
                    style={{ minHeight: '100px' }}
                />

                {/* Bottom hint */}
                <div className="px-4 py-2 border-t border-[#15151D] bg-[#0A0A0E]/50">
                    <p className="text-xs text-[#555566]">
                        💡 Tip: Be descriptive! Include style, mood, colors, and timing for best results.
                        <span className="text-[#666677] ml-2">Press Enter to generate</span>
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
