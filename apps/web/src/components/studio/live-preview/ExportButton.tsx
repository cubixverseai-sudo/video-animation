"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Download,
    Loader2,
    CheckCircle2,
    Film,
    ChevronDown,
    FileVideo,
    Image
} from 'lucide-react';

interface ExportFormat {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    extension: string;
}

const EXPORT_FORMATS: ExportFormat[] = [
    { id: 'mp4', label: 'MP4 Video', description: 'Best for sharing', icon: <FileVideo className="w-3.5 h-3.5" />, extension: '.mp4' },
    { id: 'webm', label: 'WebM Video', description: 'Web optimized', icon: <FileVideo className="w-3.5 h-3.5" />, extension: '.webm' },
    { id: 'gif', label: 'GIF Animation', description: 'Loop animations', icon: <Image className="w-3.5 h-3.5" />, extension: '.gif' },
];

const QUALITY_OPTIONS = [
    { id: 'low', label: 'Low', hint: '540p' },
    { id: 'medium', label: 'Med', hint: '720p' },
    { id: 'high', label: 'High', hint: '1080p' },
];

interface ExportButtonProps {
    onExport: (format: string, quality: string) => void;
    disabled?: boolean;
    loading?: boolean;
    progress?: number;
    className?: string;
}

export function ExportButton({
    onExport,
    disabled = false,
    loading = false,
    progress = 0,
    className
}: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<string>('mp4');
    const [selectedQuality, setSelectedQuality] = useState<string>('high');
    const [exportComplete, setExportComplete] = useState(false);

    const handleExport = () => {
        setIsOpen(false);
        onExport(selectedFormat, selectedQuality);
    };

    useEffect(() => {
        if (exportComplete && !loading) {
            const timer = setTimeout(() => setExportComplete(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [exportComplete, loading]);

    useEffect(() => {
        if (progress >= 100 && loading) {
            setExportComplete(true);
        }
    }, [progress, loading]);

    return (
        <div className={cn("relative", className)}>
            {/* Main button */}
            <motion.button
                onClick={() => !loading && setIsOpen(!isOpen)}
                disabled={disabled || loading}
                className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg",
                    "font-medium text-xs transition-all duration-200",
                    "border relative overflow-hidden",
                    loading
                        ? "bg-indigo-500/8 border-indigo-500/20 text-indigo-300"
                        : exportComplete
                            ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-300"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent text-white hover:shadow-lg hover:shadow-indigo-500/15",
                    disabled && !loading && "opacity-40 cursor-not-allowed"
                )}
                whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
                whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            >
                {/* Progress bar inside button */}
                {loading && (
                    <motion.div
                        className="absolute inset-0 bg-indigo-500/10"
                        initial={{ clipPath: 'inset(0 100% 0 0)' }}
                        animate={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                        transition={{ duration: 0.3 }}
                    />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                    {loading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{Math.round(progress)}%</span>
                        </>
                    ) : exportComplete ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                        </>
                    ) : (
                        <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Export</span>
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
                        </>
                    )}
                </span>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full right-0 mt-1.5 w-72 p-3 rounded-lg z-50"
                        style={{
                            background: 'rgba(14, 14, 20, 0.98)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255,255,255,0.1)',
                        }}
                    >
                        <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-white/[0.04]">
                            <Film className="w-4 h-4 text-indigo-400/70" />
                            <span className="text-xs font-semibold text-[#8888A0] uppercase tracking-wider">Export Settings</span>
                        </div>

                        {/* Format selection */}
                        <div className="space-y-1.5 mb-3">
                            <p className="text-[11px] text-[#4A4A5A] uppercase tracking-wider font-semibold">Format</p>
                            <div className="grid gap-1">
                                {EXPORT_FORMATS.map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => setSelectedFormat(format.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-2.5 rounded-md text-left transition-all",
                                            "border",
                                            selectedFormat === format.id
                                                ? "bg-indigo-500/8 border-indigo-500/15"
                                                : "bg-transparent border-transparent hover:bg-white/[0.02]"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-1 rounded",
                                            selectedFormat === format.id ? "bg-indigo-500/15 text-indigo-400" : "bg-white/[0.03] text-[#555566]"
                                        )}>
                                            {format.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-xs font-medium",
                                                selectedFormat === format.id ? "text-indigo-300/90" : "text-[#8888A0]"
                                            )}>
                                                {format.label}
                                            </p>
                                            <p className="text-[11px] text-[#3A3A4A]">{format.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quality selection */}
                        <div className="space-y-1.5 mb-3">
                            <p className="text-[11px] text-[#4A4A5A] uppercase tracking-wider font-semibold">Quality</p>
                            <div className="flex gap-1">
                                {QUALITY_OPTIONS.map((q) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setSelectedQuality(q.id)}
                                        className={cn(
                                            "flex-1 py-1.5 px-2 rounded-md text-center transition-all",
                                            "border",
                                            selectedQuality === q.id
                                                ? "bg-indigo-500/8 border-indigo-500/15 text-indigo-300"
                                                : "bg-transparent border-transparent text-[#555566] hover:bg-white/[0.02]"
                                        )}
                                    >
                                        <span className="text-xs font-medium block">{q.label}</span>
                                        <span className="text-[10px] text-[#3A3A4A] block">{q.hint}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Export button */}
                        <button
                            onClick={handleExport}
                            className="w-full py-2.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-xs hover:shadow-lg hover:shadow-indigo-500/15 transition-all active:scale-[0.98]"
                        >
                            Start Export
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside handler */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
