"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronDown,
    Zap,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/providers/SocketProvider';
import { useAgentStore, LogEntry } from '@/stores/agentStore';
import { StepIndicator } from './StepIndicator';
import { ErrorDisplay } from './ErrorDisplay';
import { PlanViewer } from '../PlanViewer';
import { useParams } from 'next/navigation';

export function ConsoleContainer() {
    const { socket } = useSocket();
    const params = useParams();
    const projectId = params?.projectId as string | null;
    const {
        logs,
        addLog,
        updateLog,
        currentStep,
        steps,
        updateStepStatus,
        completeAllSteps,
        errors,
        addError,
        removeError,
        isThinking,
        setThinking
    } = useAgentStore();

    // Resizable sidebar logic
    const [width, setWidth] = useState(400);
    const [showPlan, setShowPlan] = useState(true);
    const [isResizing, setIsResizing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    // Socket Integration
    useEffect(() => {
        if (!socket) return;

        const handleLog = (rawLog: any) => {
            const type = rawLog.type || 'info';
            let displayMessage = rawLog.message;

            // STEP 1: Detect step transitions and update step indicator
            const lowerMsg = displayMessage.toLowerCase();

            if (lowerMsg.includes('discovering') || lowerMsg.includes('analyzing') || lowerMsg.includes('get_my_assets')) {
                updateStepStatus('analyze', 'active');
                setThinking(true);
            }
            else if (lowerMsg.includes('designing') || lowerMsg.includes('writing') || lowerMsg.includes('planning')) {
                updateStepStatus('analyze', 'completed');
                updateStepStatus('plan', 'active');
            }
            else if (lowerMsg.includes('building') || lowerMsg.includes('refining') || lowerMsg.includes('creating')) {
                updateStepStatus('plan', 'completed');
                updateStepStatus('code', 'active');
            }
            else if (lowerMsg.includes('reviewing') || lowerMsg.includes('linking') || lowerMsg.includes('register')) {
                updateStepStatus('code', 'completed');
                updateStepStatus('review', 'active');
            }
            else if (lowerMsg.includes('deploying') || lowerMsg.includes('deploy')) {
                updateStepStatus('review', 'active');
            }

            // STEP 2: Detect completion - mark all complete and stop thinking
            if (type === 'success' && (lowerMsg.includes('deploy') || lowerMsg.includes('completed'))) {
                completeAllSteps();
                setThinking(false);
            }

            // STEP 3: Handle 'thinking' type logs differently - these should NOT persist as spinners
            // Instead, they become 'info' logs after being displayed
            if (type === 'thinking') {
                // Don't add 'thinking' as a log, just update the global thinking state
                setThinking(true);
                return; // Don't add to log list
            }

            // STEP 4: Add the log
            addLog({
                type: type,
                message: displayMessage,
                details: rawLog.details
            });

            // STEP 5: Handle errors
            if (type === 'error') {
                addError({
                    type: 'error',
                    message: displayMessage
                });
            }
        };

        // Handle task complete event
        const handleTaskComplete = () => {
            completeAllSteps();
            setThinking(false);
        };

        socket.on('agent:log', handleLog);
        socket.on('agent:complete', handleTaskComplete);

        return () => {
            socket.off('agent:log', handleLog);
            socket.off('agent:complete', handleTaskComplete);
        };
    }, [socket, addLog, updateStepStatus, addError, completeAllSteps, setThinking]);

    // Resizing Handlers
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 300 && newWidth < window.innerWidth * 0.5) setWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <div style={{ width }} className="flex flex-col h-full bg-[#060608] border-r border-[#141418] relative flex-shrink-0 group/sidebar">
            {/* Steps */}
            <div className="flex-shrink-0 border-b border-[#141418] bg-[#07070B]">
                <div className="px-2 py-2">
                    <StepIndicator steps={steps} currentStep={currentStep} className="mb-1.5" />
                    <ErrorDisplay errors={errors} onDismiss={removeError} />
                </div>
            </div>

            {/* Project Plan Viewer */}
            <div className="flex-shrink-0 border-b border-[#141418] px-3 py-2.5">
                <PlanViewer 
                    projectId={projectId} 
                    isExpanded={showPlan}
                    onToggle={() => setShowPlan(!showPlan)}
                />
            </div>

            {/* Logs Stream */}
            <div className="flex-1 relative overflow-hidden">
                {/* Fade gradient at top */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#060608] to-transparent z-10 pointer-events-none" />
                
                <div className="h-full overflow-y-auto custom-scrollbar px-3 py-3 space-y-1.5" ref={scrollRef}>
                    {logs.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
                            <Cpu className="w-12 h-12 mb-3 text-[#3A3A4A]" />
                            <p className="text-sm font-medium text-[#3A3A4A]">Awaiting Instructions</p>
                        </div>
                    )}
                    {logs.map((log) => (
                        <LogItem key={log.id} log={log} />
                    ))}
                </div>
            </div>

            {/* Resize Handle */}
            <div
                onMouseDown={startResizing}
                className={cn(
                    "absolute top-0 right-0 w-[3px] h-full cursor-ew-resize z-50 transition-all duration-200",
                    "hover:bg-indigo-500/30",
                    isResizing ? "bg-indigo-500/50" : "bg-transparent"
                )}
            />
        </div>
    );
}

function LogItem({ log }: { log: LogEntry }) {
    const [expanded, setExpanded] = useState(false);

    const colorMap = {
        success: { bar: 'bg-emerald-500', text: 'text-emerald-300/90', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80" /> },
        error: { bar: 'bg-rose-500', text: 'text-rose-300/90', icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500/80" /> },
        warning: { bar: 'bg-amber-500', text: 'text-amber-300/90', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500/80" /> },
        info: { bar: 'bg-[#2A2A38]', text: 'text-[#8888A0]', icon: <Zap className="w-3.5 h-3.5 text-[#555566]" /> },
        thinking: { bar: 'bg-indigo-500', text: 'text-indigo-300/90', icon: <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> },
        code: { bar: 'bg-cyan-500', text: 'text-cyan-300/90', icon: <Zap className="w-3.5 h-3.5 text-cyan-500/80" /> },
    };

    const colors = colorMap[log.type] || colorMap.info;

    return (
        <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="flex gap-0 group/log"
        >
            {/* Color bar */}
            <div className={cn("w-[2px] rounded-full flex-shrink-0 my-1", colors.bar, "opacity-60 group-hover/log:opacity-100 transition-opacity")} />

            {/* Content */}
            <div
                className={cn(
                    "flex-1 min-w-0 pl-3 py-2 rounded-r-md transition-colors cursor-default",
                    log.details && "cursor-pointer hover:bg-white/[0.02]"
                )}
                onClick={() => log.details && setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <div className="shrink-0">{colors.icon}</div>
                    <p className={cn("text-xs font-medium leading-snug truncate flex-1", colors.text)}>
                        {log.message}
                    </p>
                    <span className="text-[10px] font-mono text-[#3A3A4A] shrink-0">{log.timestamp}</span>
                    {log.details && (
                        <ChevronDown className={cn("w-3.5 h-3.5 text-[#3A3A4A] transition-transform duration-150 shrink-0", expanded && "rotate-180")} />
                    )}
                </div>

                <AnimatePresence>
                    {expanded && log.details && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <pre className="mt-1.5 pl-6 text-[11px] text-[#555566] font-mono whitespace-pre-wrap leading-relaxed">
                                {log.details}
                            </pre>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
