"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Brain,
    Code2,
    Eye,
    CheckCircle2,
    Loader2,
    AlertCircle
} from 'lucide-react';

export interface Step {
    id: string;
    name: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    description?: string;
}

const DEFAULT_STEPS: Step[] = [
    { id: 'analyze', name: 'Analyze', status: 'pending', description: 'Understanding your request' },
    { id: 'plan', name: 'Plan', status: 'pending', description: 'Creating video script' },
    { id: 'code', name: 'Build', status: 'pending', description: 'Writing components' },
    { id: 'review', name: 'Review', status: 'pending', description: 'Visual inspection' },
];

interface StepIndicatorProps {
    steps?: Step[];
    currentStep?: number;
    className?: string;
}

export function StepIndicator({
    steps = DEFAULT_STEPS,
    currentStep = 0,
    className
}: StepIndicatorProps) {
    const getStepIcon = (step: Step, index: number) => {
        const iconClass = "w-3.5 h-3.5";

        switch (step.status) {
            case 'completed':
                return <CheckCircle2 className={cn(iconClass, "text-emerald-400")} />;
            case 'active':
                return <Loader2 className={cn(iconClass, "text-indigo-400 animate-spin")} />;
            case 'error':
                return <AlertCircle className={cn(iconClass, "text-red-400")} />;
            default:
                // Show step-specific icons
                if (step.id === 'analyze') return <Brain className={cn(iconClass, "text-[#555566]")} />;
                if (step.id === 'code' || step.id === 'plan') return <Code2 className={cn(iconClass, "text-[#555566]")} />;
                if (step.id === 'review') return <Eye className={cn(iconClass, "text-[#555566]")} />;
                return <div className={cn("w-2 h-2 rounded-full bg-[#333340]")} />;
        }
    };

    const activeIndex = steps.findIndex(s => s.status === 'active');
    const completedCount = steps.filter(s => s.status === 'completed').length;

    return (
        <div className={cn("flex items-center gap-0 px-2 py-2.5 bg-[#09090D] rounded-lg border border-[#14141C] overflow-hidden", className)}>
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1 min-w-0">
                    {/* Step */}
                    <motion.div
                        className={cn(
                            "flex items-center gap-1.5 px-1.5 py-1.5 rounded-md transition-all duration-300 relative",
                            step.status === 'active' && "bg-indigo-500/8",
                            step.status === 'completed' && "bg-transparent",
                            step.status === 'error' && "bg-red-500/8",
                            step.status === 'pending' && "opacity-40"
                        )}
                        initial={false}
                        animate={{ scale: step.status === 'active' ? 1 : 1 }}
                    >
                        {/* Active ring pulse */}
                        {step.status === 'active' && (
                            <motion.div
                                className="absolute inset-0 rounded-md border border-indigo-500/20"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}

                        {getStepIcon(step, index)}
                        <span className={cn(
                            "text-[11px] font-medium whitespace-nowrap",
                            step.status === 'active' && "text-indigo-300",
                            step.status === 'completed' && "text-emerald-400/70",
                            step.status === 'error' && "text-red-400",
                            step.status === 'pending' && "text-[#444455]"
                        )}>
                            {step.name}
                        </span>
                    </motion.div>

                    {/* Connector line */}
                    {index < steps.length - 1 && (
                        <div className="flex-1 min-w-[8px] mx-0.5 h-[1px] bg-[#1A1A24] rounded-full overflow-hidden relative">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-indigo-500/40 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{
                                    width: step.status === 'completed' ? '100%' : step.status === 'active' ? '50%' : '0%'
                                }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Compact version for tight spaces
export function StepIndicatorCompact({
    steps = DEFAULT_STEPS,
    currentStep = 0,
    className
}: StepIndicatorProps) {
    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            {steps.map((step, index) => (
                <motion.div
                    key={step.id}
                    className={cn(
                        "relative w-2 h-2 rounded-full transition-all duration-300",
                        step.status === 'completed' && "bg-emerald-400",
                        step.status === 'active' && "bg-indigo-400",
                        step.status === 'error' && "bg-red-400",
                        step.status === 'pending' && "bg-[#333340]"
                    )}
                    animate={step.status === 'active' ? {
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.7, 1]
                    } : {}}
                    transition={{
                        duration: 1,
                        repeat: step.status === 'active' ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                >
                    {step.status === 'active' && (
                        <motion.div
                            className="absolute inset-0 rounded-full bg-indigo-400"
                            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    )}
                </motion.div>
            ))}
        </div>
    );
}
