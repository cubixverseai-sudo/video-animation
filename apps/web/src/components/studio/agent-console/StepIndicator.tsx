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
    { id: 'analyze', name: 'Analyzing', status: 'pending', description: 'Understanding your request' },
    { id: 'plan', name: 'Planning', status: 'pending', description: 'Creating video script' },
    { id: 'code', name: 'Building', status: 'pending', description: 'Writing components' },
    { id: 'review', name: 'Reviewing', status: 'pending', description: 'Visual inspection' },
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
        const iconClass = "w-4 h-4";

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

    return (
        <div className={cn("flex items-center gap-2 px-4 py-3 bg-[#0A0A0E] rounded-xl border border-[#1A1A22]", className)}>
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                    {/* Step */}
                    <motion.div
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
                            step.status === 'active' && "bg-indigo-500/10 border border-indigo-500/30",
                            step.status === 'completed' && "bg-emerald-500/5",
                            step.status === 'error' && "bg-red-500/10 border border-red-500/30",
                            step.status === 'pending' && "opacity-50"
                        )}
                        initial={false}
                        animate={{
                            scale: step.status === 'active' ? 1.02 : 1
                        }}
                    >
                        {getStepIcon(step, index)}
                        <span className={cn(
                            "text-xs font-medium",
                            step.status === 'active' && "text-indigo-300",
                            step.status === 'completed' && "text-emerald-400",
                            step.status === 'error' && "text-red-400",
                            step.status === 'pending' && "text-[#555566]"
                        )}>
                            {step.name}
                        </span>
                    </motion.div>

                    {/* Connector */}
                    {index < steps.length - 1 && (
                        <div className="flex items-center px-2">
                            <motion.div
                                className={cn(
                                    "w-6 h-[2px] rounded-full",
                                    index < currentStep
                                        ? "bg-indigo-500/50"
                                        : "bg-[#2A2A35]"
                                )}
                                initial={false}
                                animate={{
                                    backgroundColor: index < currentStep ? 'rgba(99, 102, 241, 0.5)' : 'rgba(42, 42, 53, 1)'
                                }}
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
