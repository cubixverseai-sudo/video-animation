"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Clapperboard,
    Sparkles,
    Play,
    Cpu,
    Layers,
    Command,
    ArrowRight,
    Activity
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AssetDropzone } from "@/components/launchpad/AssetDropzone";
import { PromptInput } from "@/components/launchpad/PromptInput";
import { PresetButtons } from "@/components/launchpad/PresetButtons";
import { GenerateButton } from "@/components/launchpad/GenerateButton";

export default function LaunchpadPage() {
    const [prompt, setPrompt] = useState("");
    const [assets, setAssets] = useState<File[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const router = useRouter();

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
                body: formData // No Content-Type header needed for FormData
            });

            if (response.ok) {
                const project = await response.json();
                // We pass a flag 'hasAssets' so the studio knows whether to send media parts in first message
                const hasAssets = assets.length > 0 ? "true" : "false";
                window.location.href = `/studio/${project.id}?prompt=${encodeURIComponent(prompt)}&preset=${selectedPreset || ""}&hasAssets=${hasAssets}`;
            } else {
                console.error("Failed to create project");
                setIsGenerating(false);
            }
        } catch (error) {
            console.error("Error launching project:", error);
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#030303] text-white overflow-hidden relative selection:bg-indigo-500/30">

            {/* --- CINEMATIC BACKGROUND LAYER --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Noise Texture for Film Grain */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Deep Atmospheric Glows */}
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse duration-[10s]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-900/10 blur-[120px] rounded-full" />

                {/* Perspective Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* --- HEADER --- */}
            <header className="relative z-50 px-8 py-6 w-full max-w-[1400px] mx-auto flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 group cursor-pointer"
                >
                    <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-900/20 group-hover:shadow-indigo-500/40 transition-all duration-500">
                        <Clapperboard className="w-5 h-5 text-white fill-white/20" />
                        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-[0.2em] text-white">DIRECTOR</span>
                        <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase opacity-80">AI Engine v2.0</span>
                    </div>
                </motion.div>

                <nav className="hidden md:flex items-center gap-1">
                    {['Projects', 'Assets', 'Engine'].map((item, i) => (
                        <Link key={item} href={`/${item.toLowerCase()}`} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors relative group">
                            {item}
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-indigo-500 group-hover:w-1/2 transition-all duration-300" />
                        </Link>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-400 font-mono">SYSTEM ONLINE</span>
                    </div>
                </nav>
            </header>

            {/* --- MAIN HERO --- */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-5xl text-center"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md mb-8 shadow-[0_0_20px_-10px_rgba(99,102,241,0.5)]">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[11px] font-semibold tracking-widest text-indigo-200 uppercase">Next-Gen Generative Motion</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 mb-6 drop-shadow-2xl">
                        TEXT TO <br className="md:hidden" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-gradient-x">CINEMA.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                        Generate professional motion graphics using <span className="text-zinc-200 font-medium">GSAP & Remotion</span>.
                        <br className="hidden md:block" /> No timeline dragging. Just pure direction.
                    </p>

                    {/* --- THE COMMAND ISLAND (Input Area) --- */}
                    <div
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`relative mx-auto w-full max-w-3xl transition-all duration-500 ease-out ${isHovered ? 'scale-[1.01]' : 'scale-100'}`}
                    >
                        {/* Glow Effect behind container */}
                        <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[24px] blur-xl opacity-20 transition-opacity duration-500 ${isHovered ? 'opacity-40' : 'opacity-20'}`} />

                        <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-[20px] p-6 shadow-2xl overflow-hidden">
                            {/* Inner Grid Background */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

                            <div className="relative flex flex-col gap-6">
                                {/* Professional Prompt Input */}
                                <PromptInput
                                    value={prompt}
                                    onChange={setPrompt}
                                    onSubmit={handleGenerate}
                                />

                                {/* Asset Upload Area */}
                                <AssetDropzone onAssetsChange={setAssets} />

                                {/* Advanced Presets */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] uppercase tracking-widest text-[#555566] font-bold">Configuration</span>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>
                                    <PresetButtons
                                        selectedPresets={selectedPreset ? [selectedPreset] : []}
                                        onTogglePreset={(id) => setSelectedPreset(selectedPreset === id ? null : id)}
                                    />
                                </div>

                                {/* Main Action Button */}
                                <div className="pt-2">
                                    <GenerateButton
                                        onClick={handleGenerate}
                                        hasPrompt={prompt.length > 10}
                                        loading={false}
                                        disabled={!prompt.trim()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- TECH SPECS HUD --- */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto border-t border-white/5 pt-8">
                        {[
                            { icon: Cpu, label: "Core Model", val: "Gemini 3 Pro" },
                            { icon: Layers, label: "Render Engine", val: "Remotion Lambda" },
                            { icon: Activity, label: "Animation", val: "GSAP 3.12" },
                            { icon: Command, label: "Latency", val: "< 400ms" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group">
                                <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</span>
                                <span className="text-xs font-mono text-zinc-300 border-b border-transparent group-hover:border-indigo-500/50 transition-all">{stat.val}</span>
                            </div>
                        ))}
                    </div>

                </motion.div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="relative z-10 w-full px-8 py-6 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">
                    © 2026 Director Labs • Confidential Build
                </p>
                <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                </div>
            </footer>
        </div>
    );
}