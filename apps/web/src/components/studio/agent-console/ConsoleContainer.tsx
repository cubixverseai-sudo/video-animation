"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
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
        <div style={{ width }} className="flex flex-col h-full bg-[#050505] border-r border-[#1F1F1F] relative flex-shrink-0 group/sidebar">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-5 border-b border-[#1F1F1F] bg-[#0A0A0A]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-200 tracking-wider block">AGENT CORE</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {isThinking ? (
                                <>
                                    <Loader2 className="w-2.5 h-2.5 text-indigo-400 animate-spin" />
                                    <span className="text-[9px] text-indigo-400 font-mono">WORKING</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] text-gray-500 font-mono">READY</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps & Errors Area */}
            <div className="flex-shrink-0 border-b border-[#1F1F1F] bg-[#080808]">
                <div className="p-3">
                    <StepIndicator steps={steps} currentStep={currentStep} className="mb-2" />
                    <ErrorDisplay errors={errors} onDismiss={removeError} />
                </div>
            </div>

            {/* Project Plan Viewer */}
            <div className="flex-shrink-0 border-b border-[#1F1F1F] p-3">
                <PlanViewer 
                    projectId={projectId} 
                    isExpanded={showPlan}
                    onToggle={() => setShowPlan(!showPlan)}
                />
            </div>

            {/* Logs Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-[#050505]" ref={scrollRef}>
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                        <Cpu className="w-12 h-12 mb-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-300">Awaiting Instructions</p>
                    </div>
                )}
                {logs.map((log) => (
                    <LogItem key={log.id} log={log} />
                ))}
            </div>

            {/* Resize Handle */}
            <div onMouseDown={startResizing} className={cn("absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-indigo-500/50 transition-colors z-50", isResizing && "bg-indigo-500")} />
        </div>
    );
}

function LogItem({ log }: { log: LogEntry }) {
    const [expanded, setExpanded] = useState(false);

    const getIcon = () => {
        switch (log.type) {
            case 'success':
                return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
            case 'error':
                return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
            case 'warning':
                return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
            default:
                return <Zap className="w-3.5 h-3.5 text-gray-500" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "rounded-lg overflow-hidden border transition-all duration-300",
                log.type === 'success' ? "bg-emerald-500/5 border-emerald-500/20" :
                    log.type === 'error' ? "bg-rose-500/5 border-rose-500/20" :
                        log.type === 'warning' ? "bg-amber-500/5 border-amber-500/20" :
                            "bg-[#0A0A0A] border-[#1F1F1F] hover:border-[#2F2F2F]"
            )}
        >
            <div
                className={cn("p-3 flex items-start gap-3 cursor-pointer", log.details && "hover:bg-white/5")}
                onClick={() => log.details && setExpanded(!expanded)}
            >
                <div className="mt-0.5 shrink-0">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                            "text-xs font-medium leading-relaxed truncate",
                            log.type === 'success' ? "text-emerald-300" :
                                log.type === 'error' ? "text-rose-300" :
                                    log.type === 'warning' ? "text-amber-300" :
                                        "text-gray-300"
                        )}>
                            {log.message}
                        </p>
                        <span className="text-[9px] font-mono text-gray-600 shrink-0">{log.timestamp}</span>
                    </div>
                </div>

                {log.details && (
                    <ChevronDown className={cn("w-3 h-3 text-gray-600 transition-transform duration-200", expanded && "rotate-180")} />
                )}
            </div>

            <AnimatePresence>
                {expanded && log.details && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#030303] border-t border-[#1F1F1F]"
                    >
                        <pre className="p-3 text-[10px] text-gray-500 font-mono whitespace-pre-wrap overflow-x-auto custom-scrollbar">
                            {log.details}
                        </pre>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
