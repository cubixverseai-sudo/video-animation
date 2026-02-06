"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowUp, Paperclip, Loader2, X, FolderOpen } from "lucide-react";
import Link from "next/link";

export default function LaunchpadPage() {
    const [prompt, setPrompt] = useState("");
    const [assets, setAssets] = useState<File[]>([]);
    const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append('description', `Generated from: "${prompt.slice(0, 50)}..."`);
            assets.forEach(file => {
                formData.append('assets', file);
            });

            const response = await fetch('http://localhost:4000/projects', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const project = await response.json();
                const hasAssets = assets.length > 0 ? "true" : "false";
                const durationPreset = selectedPresets.find(p => p.startsWith('duration_'));
                const durationMatch = durationPreset?.match(/duration_(\d+)/);
                const duration = durationMatch ? durationMatch[1] : "10";
                const presetParam = selectedPresets.filter(p => !p.startsWith('duration_')).join(',');
                window.location.href = `/studio/${project.id}?prompt=${encodeURIComponent(prompt)}&preset=${presetParam}&hasAssets=${hasAssets}&duration=${duration}`;
            } else {
                console.error("Failed to create project");
                setIsGenerating(false);
            }
        } catch (error) {
            console.error("Error launching project:", error);
            setIsGenerating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAssets(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (idx: number) => {
        setAssets(prev => prev.filter((_, i) => i !== idx));
    };

    const togglePreset = (id: string) => {
        setSelectedPresets(prev => {
            const isDuration = id.startsWith('duration_');
            if (prev.includes(id)) return prev.filter(p => p !== id);
            const filtered = isDuration ? prev.filter(p => !p.startsWith('duration_')) : prev;
            return [...filtered, id];
        });
    };

    const PRESETS = [
        { id: 'cinematic', label: 'Cinematic' },
        { id: 'minimal', label: 'Minimal' },
        { id: 'neon', label: 'Neon' },
        { id: 'dynamic', label: 'Dynamic' },
        { id: 'duration_5', label: '5s' },
        { id: 'duration_10', label: '10s' },
        { id: 'duration_15', label: '15s' },
    ];

    const canGenerate = prompt.trim().length > 0 && !isGenerating;

    return (
        <div className="min-h-screen flex flex-col bg-[#030305] text-white selection:bg-indigo-500/30">

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[15%] left-[30%] w-[500px] h-[500px] bg-indigo-600/[0.04] blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-violet-600/[0.03] blur-[100px] rounded-full" />
            </div>

            {/* Navbar */}
            <header className="relative z-50 h-14 px-6 flex items-center justify-between border-b border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/30" />
                    </div>
                    <span className="font-bold text-xs tracking-[0.2em] text-gray-300 uppercase">Director</span>
                </div>

                <nav className="hidden md:flex items-center gap-1">
                    <Link href="/projects" className="px-3 py-1.5 text-xs font-medium text-[#555566] hover:text-gray-300 transition-colors rounded-md hover:bg-white/[0.02]">
                        <FolderOpen className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        Projects
                    </Link>
                </nav>
            </header>

            {/* Main — vertically centered */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-2xl"
                >
                    {/* Tagline */}
                    <div className="text-center mb-10">
                        <h1 className="text-2xl md:text-3xl font-semibold text-white/90 mb-2">
                            What do you want to create?
                        </h1>
                        <p className="text-sm text-[#555566]">
                            Describe your video and let AI direct it for you.
                        </p>
                    </div>

                    {/* Prompt Container */}
                    <div className="relative">
                        {/* Focus glow */}
                        <AnimatePresence>
                            {isFocused && (
                                <motion.div
                                    className="absolute -inset-1 bg-indigo-500/[0.06] rounded-2xl blur-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </AnimatePresence>

                        <div
                            className={`relative rounded-xl transition-all duration-300 ${
                                isFocused
                                    ? 'border-indigo-500/25 shadow-[0_0_30px_-10px_rgba(99,102,241,0.12)]'
                                    : 'border-white/[0.06]'
                            }`}
                            style={{
                                background: 'rgba(10, 10, 14, 0.8)',
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${isFocused ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'}`,
                            }}
                        >
                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="A cinematic product reveal for a luxury watch with golden particles..."
                                rows={3}
                                className="w-full bg-transparent px-4 pt-4 pb-2 text-sm text-gray-200 placeholder:text-[#333340] focus:outline-none resize-none leading-relaxed"
                                style={{ minHeight: '80px' }}
                            />

                            {/* Attached files */}
                            <AnimatePresence>
                                {assets.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-4 pb-1"
                                    >
                                        <div className="flex flex-wrap gap-1.5">
                                            {assets.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/8 border border-indigo-500/15 text-[11px] text-indigo-300/70 font-mono">
                                                    {file.name.length > 20 ? file.name.slice(0, 18) + '...' : file.name}
                                                    <button onClick={() => removeFile(idx)} className="hover:text-red-400 transition-colors">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Bottom bar: actions */}
                            <div className="flex items-center justify-between px-3 py-2.5 border-t border-white/[0.03]">
                                <div className="flex items-center gap-1">
                                    {/* Attach button */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept="image/*,audio/*"
                                        multiple
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 rounded-lg text-[#444455] hover:text-indigo-400/70 hover:bg-white/[0.03] transition-all"
                                        title="Attach files"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Send button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={!canGenerate}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                        canGenerate
                                            ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
                                            : 'bg-white/[0.04] text-[#333340] cursor-not-allowed'
                                    }`}
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <ArrowUp className="w-3.5 h-3.5" />
                                    )}
                                    {isGenerating ? 'Creating...' : 'Generate'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Hint */}
                    <p className="text-center text-[11px] text-[#333340] mt-3">
                        Press <span className="text-[#444455]">Enter</span> to generate · <span className="text-[#444455]">Shift+Enter</span> for new line
                    </p>

                    {/* Preset Pills */}
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {PRESETS.map((preset) => {
                            const isSelected = selectedPresets.includes(preset.id);
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => togglePreset(preset.id)}
                                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border ${
                                        isSelected
                                            ? 'bg-indigo-500/12 border-indigo-500/25 text-indigo-300'
                                            : 'bg-white/[0.02] border-white/[0.05] text-[#555566] hover:text-[#777788] hover:border-white/[0.08]'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-4 text-center">
                <p className="text-[10px] text-[#2A2A38] font-mono uppercase tracking-widest">
                    Director · AI Video Engine
                </p>
            </footer>
        </div>
    );
}