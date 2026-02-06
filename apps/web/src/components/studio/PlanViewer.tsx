"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Inline icon components (avoids lucide-react @types/react version mismatch) ──
function IconFileText({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
        </svg>
    );
}
function IconRefresh({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
        </svg>
    );
}
function IconChevronUp({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m18 15-6-6-6 6"/>
        </svg>
    );
}
function IconChevronDown({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m6 9 6 6 6-6"/>
        </svg>
    );
}
function IconCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
        </svg>
    );
}
function IconCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    );
}
function IconClock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    );
}
function IconAlert({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
    );
}

interface PlanViewerProps {
    projectId: string | null;
    isExpanded?: boolean;
    onToggle?: () => void;
}

interface PlanData {
    projectId: string;
    plan: string;
    updatedAt: string;
}

export function PlanViewer({ projectId, isExpanded = true, onToggle }: PlanViewerProps) {
    const [plan, setPlan] = useState<PlanData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(isExpanded);

    const fetchPlan = async () => {
        if (!projectId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`http://localhost:4000/projects/${projectId}/plan`);
            
            if (response.status === 404) {
                setPlan(null);
                return;
            }
            
            if (!response.ok) {
                throw new Error('Failed to fetch plan');
            }
            
            const data = await response.json();
            setPlan(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan();
        
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchPlan, 5000);
        return () => clearInterval(interval);
    }, [projectId]);

    const toggleExpanded = () => {
        setExpanded(!expanded);
        onToggle?.();
    };

    // Parse plan content to extract sections
    const parsePlan = (content: string) => {
        const sections: { title: string; content: string }[] = [];
        
        // Extract Progress section
        const progressMatch = content.match(/## ✅ Progress\n([\s\S]*?)(?=\n## |$)/);
        if (progressMatch) {
            sections.push({ title: 'Progress', content: progressMatch[1].trim() });
        }
        
        // Extract File Structure
        const filesMatch = content.match(/## 📁 File Structure\n([\s\S]*?)(?=\n## |$)/);
        if (filesMatch) {
            sections.push({ title: 'Files', content: filesMatch[1].trim() });
        }
        
        // Extract Scenes
        const scenesMatch = content.match(/## 🎬 Scenes Timeline\n([\s\S]*?)(?=\n## |$)/);
        if (scenesMatch) {
            sections.push({ title: 'Scenes', content: scenesMatch[1].trim() });
        }
        
        // Extract Audio
        const audioMatch = content.match(/## 🎵 Audio Plan\n([\s\S]*?)(?=\n## |$)/);
        if (audioMatch) {
            sections.push({ title: 'Audio', content: audioMatch[1].trim() });
        }
        
        return sections;
    };

    // Render checkbox items
    const renderCheckboxLine = (line: string, idx: number) => {
        const isChecked = line.includes('[x]');
        const isSubItem = line.startsWith('  ');
        const text = line.replace(/- \[[ x]\] /, '').trim();
        
        return (
            <div 
                key={idx} 
                className={cn(
                    "flex items-center gap-1.5 py-0.5",
                    isSubItem && "ml-3"
                )}
            >
                {isChecked ? (
                    <IconCheck className="w-3.5 h-3.5 text-emerald-500/70 flex-shrink-0" />
                ) : (
                    <IconCircle className="w-3.5 h-3.5 text-[#2A2A38] flex-shrink-0" />
                )}
                <span className={cn(
                    "text-xs",
                    isChecked ? "text-[#555566] line-through" : "text-[#8888A0]"
                )}>
                    {text}
                </span>
            </div>
        );
    };

    if (!projectId) {
        return null;
    }

    return (
        <motion.div
            className="bg-[#09090D] border border-[#14141C] rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div 
                className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={toggleExpanded}
            >
                <div className="flex items-center gap-2">
                    <IconFileText className="w-4 h-4 text-indigo-400/70" />
                    <span className="text-xs font-semibold text-[#8888A0] uppercase tracking-wider">Plan</span>
                    {plan && (
                        <span className="text-[10px] text-[#3A3A4A] font-mono">PLAN.md</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            fetchPlan();
                        }}
                        className="p-0.5 hover:bg-white/[0.03] rounded transition-colors"
                        title="Refresh"
                    >
                        <IconRefresh className={cn(
                            "w-3.5 h-3.5 text-[#3A3A4A]",
                            loading && "animate-spin"
                        )} />
                    </button>
                    {expanded ? (
                        <IconChevronUp className="w-4 h-4 text-[#3A3A4A]" />
                    ) : (
                        <IconChevronDown className="w-4 h-4 text-[#3A3A4A]" />
                    )}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                            {loading && !plan ? (
                                <div className="flex items-center justify-center py-6">
                                    <IconRefresh className="w-4 h-4 text-[#3A3A4A] animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-2 text-red-400/80 text-xs">
                                    <IconAlert className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            ) : !plan ? (
                                <div className="text-center py-4">
                                    <IconClock className="w-6 h-6 text-[#2A2A38] mx-auto mb-2" />
                                    <p className="text-xs text-[#3A3A4A]">
                                        Waiting for plan...
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {parsePlan(plan.plan).map((section, index) => (
                                        <div key={index}>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <div className="w-0.5 h-3 rounded-full bg-indigo-500/30" />
                                                <span className="text-[11px] font-semibold text-[#6A6A80] uppercase tracking-wider">{section.title}</span>
                                            </div>
                                            <div className="pl-3 text-xs">
                                                {section.title === 'Progress' ? (
                                                    <div className="space-y-0.5">
                                                        {section.content.split('\n').filter(l => l.trim()).map(renderCheckboxLine)}
                                                    </div>
                                                ) : (
                                                    <pre className="text-[#555566] whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                                                        {section.content}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
