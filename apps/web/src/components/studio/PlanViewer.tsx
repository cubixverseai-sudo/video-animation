"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, 
    ChevronDown, 
    ChevronUp, 
    RefreshCw,
    CheckCircle2,
    Circle,
    Clock,
    Music,
    Volume2,
    Film,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        const sections: { title: string; content: string; icon: React.ReactNode }[] = [];
        
        // Extract Progress section
        const progressMatch = content.match(/## ✅ Progress\n([\s\S]*?)(?=\n## |$)/);
        if (progressMatch) {
            sections.push({
                title: 'Progress',
                content: progressMatch[1].trim(),
                icon: <CheckCircle2 className="w-4 h-4 text-green-400" />
            });
        }
        
        // Extract File Structure
        const filesMatch = content.match(/## 📁 File Structure\n([\s\S]*?)(?=\n## |$)/);
        if (filesMatch) {
            sections.push({
                title: 'Files',
                content: filesMatch[1].trim(),
                icon: <FileText className="w-4 h-4 text-blue-400" />
            });
        }
        
        // Extract Scenes
        const scenesMatch = content.match(/## 🎬 Scenes Timeline\n([\s\S]*?)(?=\n## |$)/);
        if (scenesMatch) {
            sections.push({
                title: 'Scenes',
                content: scenesMatch[1].trim(),
                icon: <Film className="w-4 h-4 text-purple-400" />
            });
        }
        
        // Extract Audio
        const audioMatch = content.match(/## 🎵 Audio Plan\n([\s\S]*?)(?=\n## |$)/);
        if (audioMatch) {
            sections.push({
                title: 'Audio',
                content: audioMatch[1].trim(),
                icon: <Music className="w-4 h-4 text-pink-400" />
            });
        }
        
        return sections;
    };

    // Render checkbox items
    const renderCheckboxLine = (line: string) => {
        const isChecked = line.includes('[x]');
        const isSubItem = line.startsWith('  ');
        const text = line.replace(/- \[[ x]\] /, '').trim();
        
        return (
            <div 
                key={line} 
                className={cn(
                    "flex items-center gap-2 py-1",
                    isSubItem && "ml-4"
                )}
            >
                {isChecked ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                    <Circle className="w-4 h-4 text-[#444455] flex-shrink-0" />
                )}
                <span className={cn(
                    "text-sm",
                    isChecked ? "text-[#888899] line-through" : "text-[#CCCCDD]"
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
            className="bg-[#0A0A0E] border border-[#1F1F28] rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div 
                className="flex items-center justify-between px-4 py-3 bg-[#0F0F14] cursor-pointer hover:bg-[#15151D] transition-colors"
                onClick={toggleExpanded}
            >
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-[#E8E8F0]">Project Plan</span>
                    {plan && (
                        <span className="text-xs text-[#555566] ml-2">
                            PLAN.md
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            fetchPlan();
                        }}
                        className="p-1 hover:bg-[#1F1F28] rounded transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={cn(
                            "w-4 h-4 text-[#666677]",
                            loading && "animate-spin"
                        )} />
                    </button>
                    {expanded ? (
                        <ChevronUp className="w-4 h-4 text-[#666677]" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-[#666677]" />
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
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2A2A35] scrollbar-track-transparent">
                            {loading && !plan ? (
                                <div className="flex items-center justify-center py-8">
                                    <RefreshCw className="w-5 h-5 text-[#555566] animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            ) : !plan ? (
                                <div className="text-center py-6">
                                    <Clock className="w-8 h-8 text-[#333344] mx-auto mb-2" />
                                    <p className="text-sm text-[#555566]">
                                        No plan created yet
                                    </p>
                                    <p className="text-xs text-[#444455] mt-1">
                                        The agent will create PLAN.md when generation starts
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {parsePlan(plan.plan).map((section, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-medium text-[#AAAACC]">
                                                {section.icon}
                                                <span>{section.title}</span>
                                            </div>
                                            <div className="pl-6 text-xs">
                                                {section.title === 'Progress' ? (
                                                    <div className="space-y-1">
                                                        {section.content.split('\n').filter(l => l.trim()).map(renderCheckboxLine)}
                                                    </div>
                                                ) : (
                                                    <pre className="text-[#888899] whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
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
