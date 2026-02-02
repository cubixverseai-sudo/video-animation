"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Play,
    Sparkles,
    Zap,
    Palette,
    Clock,
    Volume2,
    Film,
    Layers,
    Star
} from 'lucide-react';

export interface Preset {
    id: string;
    label: string;
    icon: React.ReactNode;
    category: 'style' | 'speed' | 'mood' | 'type';
    description?: string;
}

const PRESETS: Preset[] = [
    // Style presets
    { id: 'minimal', label: 'Minimal', icon: <Layers className="w-4 h-4" />, category: 'style', description: 'Clean & simple' },
    { id: 'cinematic', label: 'Cinematic', icon: <Film className="w-4 h-4" />, category: 'style', description: 'Movie-like quality' },
    { id: 'neon', label: 'Neon', icon: <Zap className="w-4 h-4" />, category: 'style', description: 'Glowing effects' },
    { id: 'gradient', label: 'Gradient', icon: <Palette className="w-4 h-4" />, category: 'style', description: 'Smooth color flows' },

    // Speed presets
    { id: 'slow', label: 'Slow', icon: <Clock className="w-4 h-4" />, category: 'speed', description: 'Relaxed pacing' },
    { id: 'dynamic', label: 'Dynamic', icon: <Sparkles className="w-4 h-4" />, category: 'speed', description: 'Energetic motion' },

    // Type presets
    { id: 'product', label: 'Product', icon: <Star className="w-4 h-4" />, category: 'type', description: 'Showcase items' },
    { id: 'intro', label: 'Intro', icon: <Play className="w-4 h-4" />, category: 'type', description: 'Opening sequence' },
    { id: 'explainer', label: 'Explainer', icon: <Volume2 className="w-4 h-4" />, category: 'type', description: 'Educational content' },
];

interface PresetButtonsProps {
    selectedPresets: string[];
    onTogglePreset: (presetId: string) => void;
    className?: string;
}

export function PresetButtons({ selectedPresets, onTogglePreset, className }: PresetButtonsProps) {
    const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);

    // Group presets by category
    const stylePresets = PRESETS.filter(p => p.category === 'style');
    const speedPresets = PRESETS.filter(p => p.category === 'speed');
    const typePresets = PRESETS.filter(p => p.category === 'type');

    const renderPresetButton = (preset: Preset) => {
        const isSelected = selectedPresets.includes(preset.id);
        const isHovered = hoveredPreset === preset.id;

        return (
            <motion.button
                key={preset.id}
                onClick={() => onTogglePreset(preset.id)}
                onMouseEnter={() => setHoveredPreset(preset.id)}
                onMouseLeave={() => setHoveredPreset(null)}
                className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-xl",
                    "text-sm font-medium transition-all duration-200",
                    "border",
                    isSelected
                        ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                        : "bg-[#12121A] border-[#1F1F28] text-[#8888A0] hover:border-[#2A2A38] hover:text-[#AAAABB]"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Selection indicator */}
                {isSelected && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl"
                        layoutId="preset-highlight"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}

                <span className={cn(
                    "relative z-10 transition-colors",
                    isSelected ? "text-indigo-400" : ""
                )}>
                    {preset.icon}
                </span>
                <span className="relative z-10">{preset.label}</span>

                {/* Tooltip */}
                {isHovered && preset.description && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[#1A1A25] border border-[#2A2A35] text-xs text-[#CCCCDD] whitespace-nowrap z-50 shadow-xl"
                    >
                        {preset.description}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1A25] border-r border-b border-[#2A2A35] rotate-45" />
                    </motion.div>
                )}
            </motion.button>
        );
    };

    return (
        <motion.div
            className={cn("space-y-4", className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            {/* Style row */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-[#555566] uppercase tracking-wider px-1">Style</p>
                <div className="flex flex-wrap gap-2">
                    {stylePresets.map(renderPresetButton)}
                </div>
            </div>

            {/* Speed + Type row */}
            <div className="flex flex-wrap gap-6">
                <div className="space-y-2">
                    <p className="text-xs font-medium text-[#555566] uppercase tracking-wider px-1">Speed</p>
                    <div className="flex flex-wrap gap-2">
                        {speedPresets.map(renderPresetButton)}
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-xs font-medium text-[#555566] uppercase tracking-wider px-1">Type</p>
                    <div className="flex flex-wrap gap-2">
                        {typePresets.map(renderPresetButton)}
                    </div>
                </div>
            </div>

            {/* Selected summary */}
            {selectedPresets.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 pt-2"
                >
                    <span className="text-xs text-[#555566]">Selected:</span>
                    <div className="flex flex-wrap gap-1">
                        {selectedPresets.map(id => {
                            const preset = PRESETS.find(p => p.id === id);
                            return preset ? (
                                <span
                                    key={id}
                                    className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs"
                                >
                                    {preset.label}
                                </span>
                            ) : null;
                        })}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
