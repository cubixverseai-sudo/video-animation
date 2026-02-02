"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Sparkles,
    ArrowRight,
    Loader2,
    Wand2,
    CheckCircle2
} from 'lucide-react';

interface GenerateButtonProps {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    hasPrompt?: boolean;
    className?: string;
}

export function GenerateButton({
    onClick,
    disabled = false,
    loading = false,
    hasPrompt = false,
    className
}: GenerateButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

    // Create particles on hover
    useEffect(() => {
        if (isHovered && !loading && !disabled) {
            const interval = setInterval(() => {
                setParticles(prev => [
                    ...prev.slice(-10), // Keep last 10 particles
                    {
                        id: Date.now(),
                        x: Math.random() * 100,
                        y: Math.random() * 100
                    }
                ]);
            }, 150);
            return () => clearInterval(interval);
        }
        return;
    }, [isHovered, loading, disabled]);

    const isReady = hasPrompt && !disabled && !loading;

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setParticles([]);
            }}
            className={cn(
                "relative overflow-hidden group",
                "w-full py-4 px-8 rounded-2xl",
                "font-semibold text-lg",
                "transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0E]",
                isReady
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-[#15151D] text-[#555566] cursor-not-allowed",
                loading && "cursor-wait",
                className
            )}
            whileHover={isReady ? { scale: 1.01 } : {}}
            whileTap={isReady ? { scale: 0.99 } : {}}
        >
            {/* Animated gradient overlay */}
            {isReady && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ backgroundSize: '200% 100%' }}
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                />
            )}

            {/* Particles */}
            <AnimatePresence>
                {particles.map(particle => (
                    <motion.div
                        key={particle.id}
                        className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`
                        }}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{
                            opacity: 0,
                            scale: 2,
                            y: -20
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                ))}
            </AnimatePresence>

            {/* Glow effect */}
            {isReady && (
                <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                    animate={{
                        scale: [1, 1.02, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Magic...</span>
                    </>
                ) : isReady ? (
                    <>
                        <Wand2 className="w-5 h-5" />
                        <span>Generate Video</span>
                        <motion.div
                            initial={{ x: 0 }}
                            animate={isHovered ? { x: 5 } : { x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </motion.div>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        <span>Enter a prompt to start</span>
                    </>
                )}
            </span>

            {/* Shine effect */}
            {isReady && (
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    initial={false}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                        animate={{
                            x: ['-100%', '200%']
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: 'easeInOut'
                        }}
                    />
                </motion.div>
            )}
        </motion.button>
    );
}
