"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Download,
    Loader2,
    CheckCircle2,
    Film,
    Settings,
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
    { id: 'mp4', label: 'MP4 Video', description: 'Best for sharing', icon: <FileVideo className="w-4 h-4" />, extension: '.mp4' },
    { id: 'webm', label: 'WebM Video', description: 'Web optimized', icon: <FileVideo className="w-4 h-4" />, extension: '.webm' },
    { id: 'gif', label: 'GIF Animation', description: 'Loop animations', icon: <Image className="w-4 h-4" />, extension: '.gif' },
];

interface ExportButtonProps {
    onExport: (format: string, quality: string) => void;
    disabled?: boolean;
    loading?: boolean;
    progress?: number; // 0-100
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

    // Auto-close dropdown after export
    if (exportComplete && !loading) {
        setTimeout(() => setExportComplete(false), 3000);
    }

    return (
        <div className={cn("relative", className)}>
            {/* Main button */}
            <motion.button
                onClick={() => !loading && setIsOpen(!isOpen)}
                disabled={disabled || loading}
                className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl",
                    "font-medium text-sm transition-all duration-200",
                    "border",
                    loading
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                        : exportComplete
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent text-white hover:shadow-lg hover:shadow-indigo-500/20",
                    disabled && !loading && "opacity-50 cursor-not-allowed"
                )}
                whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
                whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Exporting... {Math.round(progress)}%</span>
                    </>
                ) : exportComplete ? (
                    <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Download Ready</span>
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4" />
                        <span>Export Video</span>
                        <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            isOpen && "rotate-180"
                        )} />
                    </>
                )}
            </motion.button>

            {/* Progress bar overlay */}
            {loading && (
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A1A22] rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </motion.div>
            )}

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-72 p-3 rounded-xl bg-[#12121A] border border-[#1F1F28] shadow-xl z-50"
                    >
                        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#1F1F28]">
                            <Film className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium text-[#CCCCDD]">Export Settings</span>
                        </div>

                        {/* Format selection */}
                        <div className="space-y-2 mb-4">
                            <p className="text-xs text-[#666677] uppercase tracking-wider">Format</p>
                            <div className="grid gap-2">
                                {EXPORT_FORMATS.map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => setSelectedFormat(format.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-2.5 rounded-lg text-left transition-all",
                                            "border",
                                            selectedFormat === format.id
                                                ? "bg-indigo-500/10 border-indigo-500/30"
                                                : "bg-[#0A0A0E] border-[#1A1A22] hover:border-[#2A2A35]"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-1.5 rounded-md",
                                            selectedFormat === format.id ? "bg-indigo-500/20 text-indigo-400" : "bg-[#15151D] text-[#666677]"
                                        )}>
                                            {format.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn(
                                                "text-sm font-medium",
                                                selectedFormat === format.id ? "text-indigo-300" : "text-[#AAAAAA]"
                                            )}>
                                                {format.label}
                                            </p>
                                            <p className="text-xs text-[#555566]">{format.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quality selection */}
                        <div className="space-y-2 mb-4">
                            <p className="text-xs text-[#666677] uppercase tracking-wider">Quality</p>
                            <div className="flex gap-2">
                                {['low', 'medium', 'high'].map((quality) => (
                                    <button
                                        key={quality}
                                        onClick={() => setSelectedQuality(quality)}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                                            "border",
                                            selectedQuality === quality
                                                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                                                : "bg-[#0A0A0E] border-[#1A1A22] text-[#888899] hover:border-[#2A2A35]"
                                        )}
                                    >
                                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Export button */}
                        <button
                            onClick={handleExport}
                            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
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
