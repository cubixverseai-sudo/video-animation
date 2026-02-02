"use client";

import { XCircle, AlertTriangle, RefreshCw, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface ErrorEntry {
    id: string;
    type: 'error' | 'warning';
    message: string;
    file?: string;
    line?: number;
    suggestion?: string;
    timestamp: string;
    recoverable?: boolean;
}

interface ErrorDisplayProps {
    errors: ErrorEntry[];
    onRetry?: (errorId: string) => void;
    onDismiss?: (errorId: string) => void;
    className?: string;
}

export function ErrorDisplay({
    errors,
    onRetry,
    onDismiss,
    className
}: ErrorDisplayProps) {
    const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

    if (errors.length === 0) return null;

    const toggleExpand = (id: string) => {
        setExpandedErrors(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const copyError = (error: ErrorEntry) => {
        const text = `${error.type.toUpperCase()}: ${error.message}${error.file ? `\nFile: ${error.file}:${error.line}` : ''}`;
        navigator.clipboard.writeText(text);
    };

    const errorCount = errors.filter(e => e.type === 'error').length;
    const warningCount = errors.filter(e => e.type === 'warning').length;

    return (
        <motion.div
            className={cn("space-y-2", className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Summary bar */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-4">
                    {errorCount > 0 && (
                        <span className="flex items-center gap-1.5 text-red-400 text-sm">
                            <XCircle className="w-4 h-4" />
                            {errorCount} error{errorCount !== 1 ? 's' : ''}
                        </span>
                    )}
                    {warningCount > 0 && (
                        <span className="flex items-center gap-1.5 text-amber-400 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            {warningCount} warning{warningCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                {onRetry && (
                    <button
                        onClick={() => errors.forEach(e => onRetry(e.id))}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Retry All
                    </button>
                )}
            </div>

            {/* Error list */}
            <AnimatePresence>
                {errors.map((error) => {
                    const isExpanded = expandedErrors.has(error.id);
                    const isError = error.type === 'error';

                    return (
                        <motion.div
                            key={error.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={cn(
                                "overflow-hidden rounded-lg border",
                                isError
                                    ? "bg-red-500/5 border-red-500/20"
                                    : "bg-amber-500/5 border-amber-500/20"
                            )}
                        >
                            {/* Header */}
                            <div
                                className="flex items-start gap-3 p-3 cursor-pointer"
                                onClick={() => toggleExpand(error.id)}
                            >
                                <div className="mt-0.5">
                                    {isError ? (
                                        <XCircle className="w-4 h-4 text-red-400" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isError ? "text-red-300" : "text-amber-300"
                                    )}>
                                        {error.message}
                                    </p>
                                    {error.file && (
                                        <p className="text-xs text-[#666677] mt-1 font-mono">
                                            {error.file}{error.line ? `:${error.line}` : ''}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyError(error); }}
                                        className="p-1.5 rounded-md hover:bg-white/5 text-[#555566] hover:text-[#888899] transition-colors"
                                        title="Copy error"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-[#555566]" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-[#555566]" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-3 pb-3 pt-1 border-t border-[#1A1A22]"
                                    >
                                        {error.suggestion && (
                                            <div className="mt-2 p-2 rounded-md bg-emerald-500/5 border border-emerald-500/20">
                                                <p className="text-xs text-emerald-300 font-medium mb-1">💡 Suggestion</p>
                                                <p className="text-xs text-[#AABBAA]">{error.suggestion}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-3">
                                            {error.recoverable && onRetry && (
                                                <button
                                                    onClick={() => onRetry(error.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs transition-colors"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    Retry
                                                </button>
                                            )}
                                            {onDismiss && (
                                                <button
                                                    onClick={() => onDismiss(error.id)}
                                                    className="px-3 py-1.5 rounded-md hover:bg-white/5 text-[#666677] text-xs transition-colors"
                                                >
                                                    Dismiss
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
}
