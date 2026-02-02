"use client";

import { motion } from 'framer-motion';
import { Play, Share2, Layers, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/shared/Button';

export function StudioNavbar() {
    return (
        <header className="h-14 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between px-5 z-50">
            {/* Logo & Project Info */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/50 transition-colors">
                        <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                    </div>
                    <span className="font-bold text-sm tracking-widest text-gray-100 uppercase">Director.Studio</span>
                </div>

                <div className="h-4 w-px bg-gray-800" />

                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Active Project</span>
                    <span className="text-xs font-semibold text-gray-300">Nebula Cloud Launch</span>
                </div>
            </div>

            {/* Center: Tools */}
            <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                <div className="flex items-center p-1 rounded-full border border-[#1F1F1F] bg-[#050505]/50 backdrop-blur-sm">
                    {[
                        { id: 'editor', icon: Layers, label: 'Editor', active: true },
                        { id: 'assets', icon: Activity, label: 'Performance', active: false },
                        { id: 'settings', icon: Settings, label: 'Settings', active: false },
                    ].map((item) => (
                        <button
                            key={item.id}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium transition-all ${item.active
                                ? 'bg-[#151515] text-white border border-[#2A2A2A] shadow-lg'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <item.icon className="w-3 h-3" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Agent Live</span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex text-xs h-8 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                >
                    <Share2 className="w-3.5 h-3.5 mr-2" /> Share
                </Button>
            </div>
        </header>
    );
}

