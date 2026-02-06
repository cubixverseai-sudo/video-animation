"use client";

import { motion } from 'framer-motion';
import { Play, Share2, Layers, Settings, Activity } from 'lucide-react';
import { ExportButton } from './live-preview/ExportButton';
import { useProjectStore } from '@/stores/projectStore';
import { useAgentStore } from '@/stores/agentStore';

interface StudioNavbarProps {
    onExport?: (format: string, quality: string) => void;
    isExporting?: boolean;
    exportProgress?: number;
    isPreviewReady?: boolean;
}

export function StudioNavbar({ onExport, isExporting = false, exportProgress = 0, isPreviewReady = false }: StudioNavbarProps) {
    const { projectName } = useProjectStore();
    const { isThinking } = useAgentStore();

    return (
        <header className="h-14 bg-[#08080C] flex items-center justify-between px-5 z-50 relative animated-gradient-border">
            {/* Logo & Project Info */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all group-hover:shadow-[0_0_12px_rgba(99,102,241,0.15)]">
                        <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/30" />
                    </div>
                    <span className="font-bold text-xs tracking-[0.2em] text-gray-300 uppercase">Director</span>
                </div>

                <div className="h-4 w-px bg-[#1A1A24]" />

                <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-[#4A4A5A] font-semibold uppercase tracking-[0.15em]">Project</span>
                    <span className="text-xs font-medium text-gray-400 mt-0.5 max-w-[200px] truncate">
                        {projectName || 'Untitled Project'}
                    </span>
                </div>
            </div>

            {/* Center: Tools */}
            <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0C0C12] border border-[#16161E]">
                    {[
                        { id: 'editor', icon: Layers, label: 'Editor', active: true },
                        { id: 'performance', icon: Activity, label: 'Performance', active: false },
                        { id: 'settings', icon: Settings, label: 'Settings', active: false },
                    ].map((item) => (
                        <button
                            key={item.id}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${item.active
                                ? 'bg-[#16161E] text-gray-200 shadow-sm border border-[#22222E]'
                                : 'text-[#555566] hover:text-gray-400 hover:bg-[#12121A]'
                                }`}
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5">
                {/* Agent Status */}
                <motion.div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors ${
                        isThinking
                            ? 'border-indigo-500/20 bg-indigo-500/5'
                            : 'border-emerald-500/15 bg-emerald-500/5'
                    }`}
                    animate={isThinking ? { borderColor: ['rgba(99,102,241,0.2)', 'rgba(99,102,241,0.4)', 'rgba(99,102,241,0.2)'] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isThinking ? 'text-indigo-400' : 'text-emerald-400/80'}`}>
                        {isThinking ? 'Working' : 'Live'}
                    </span>
                </motion.div>

                {onExport && (
                    <ExportButton
                        onExport={onExport}
                        disabled={!isPreviewReady}
                        loading={isExporting}
                        progress={exportProgress}
                    />
                )}

                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-[#555566] hover:text-gray-300 hover:bg-[#12121A] border border-transparent hover:border-[#1E1E2A] transition-all">
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                </button>
            </div>
        </header>
    );
}
