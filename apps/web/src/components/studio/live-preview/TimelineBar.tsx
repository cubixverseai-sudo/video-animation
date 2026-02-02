"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Maximize2,
    RotateCcw
} from 'lucide-react';

interface TimelineBarProps {
    currentFrame: number;
    totalFrames: number;
    fps: number;
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onSeek: (frame: number) => void;
    onReset: () => void;
    className?: string;
}

export function TimelineBar({
    currentFrame,
    totalFrames,
    fps,
    isPlaying,
    onPlay,
    onPause,
    onSeek,
    onReset,
    className
}: TimelineBarProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverFrame, setHoverFrame] = useState<number | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const progress = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;

    const formatTime = (frames: number) => {
        const totalSeconds = Math.floor(frames / fps);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const remainingFrames = frames % fps;
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${remainingFrames.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent) => {
        if (!progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const frame = Math.floor(percentage * totalFrames);
        onSeek(frame);
    };

    const handleProgressHover = (e: React.MouseEvent) => {
        if (!progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const frame = Math.floor(percentage * totalFrames);
        setHoverFrame(frame);
    };

    const handleSkipBack = () => {
        onSeek(Math.max(0, currentFrame - fps)); // Skip 1 second back
    };

    const handleSkipForward = () => {
        onSeek(Math.min(totalFrames, currentFrame + fps)); // Skip 1 second forward
    };

    return (
        <div className={cn(
            "flex flex-col gap-2 px-4 py-3 bg-[#0A0A0E] border-t border-[#1A1A22]",
            className
        )}>
            {/* Progress bar */}
            <div
                ref={progressRef}
                className="relative h-2 bg-[#1A1A22] rounded-full cursor-pointer group"
                onClick={handleProgressClick}
                onMouseMove={handleProgressHover}
                onMouseLeave={() => setHoverFrame(null)}
            >
                {/* Buffer/loaded indicator */}
                <div
                    className="absolute inset-y-0 left-0 bg-[#2A2A35] rounded-full"
                    style={{ width: '100%' }}
                />

                {/* Progress */}
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${progress}%` }}
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: isDragging ? 0 : 0.1 }}
                />

                {/* Hover preview */}
                {hoverFrame !== null && (
                    <div
                        className="absolute -top-8 transform -translate-x-1/2 px-2 py-1 rounded bg-[#1A1A25] border border-[#2A2A35] text-xs text-[#CCCCDD] whitespace-nowrap"
                        style={{ left: `${(hoverFrame / totalFrames) * 100}%` }}
                    >
                        {formatTime(hoverFrame)}
                    </div>
                )}

                {/* Playhead */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ left: `${progress}%`, marginLeft: '-8px' }}
                    initial={false}
                    animate={{ left: `${progress}%` }}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                {/* Left - Time display */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-[#CCCCDD]">
                        {formatTime(currentFrame)}
                    </span>
                    <span className="text-[#555566]">/</span>
                    <span className="text-sm font-mono text-[#666677]">
                        {formatTime(totalFrames)}
                    </span>
                </div>

                {/* Center - Playback controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={onReset}
                        className="p-2 rounded-lg hover:bg-[#1A1A22] text-[#888899] hover:text-white transition-colors"
                        title="Reset"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSkipBack}
                        className="p-2 rounded-lg hover:bg-[#1A1A22] text-[#888899] hover:text-white transition-colors"
                        title="Skip back 1s"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                        onClick={isPlaying ? onPause : onPlay}
                        className="p-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-colors mx-2"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                        )}
                    </button>
                    <button
                        onClick={handleSkipForward}
                        className="p-2 rounded-lg hover:bg-[#1A1A22] text-[#888899] hover:text-white transition-colors"
                        title="Skip forward 1s"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>

                {/* Right - Extra controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-lg hover:bg-[#1A1A22] text-[#888899] hover:text-white transition-colors"
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? (
                            <VolumeX className="w-4 h-4" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                    </button>
                    <div className="px-2 py-1 rounded-md bg-[#15151D] text-xs text-[#666677]">
                        {fps} fps
                    </div>
                    <button
                        className="p-2 rounded-lg hover:bg-[#1A1A22] text-[#888899] hover:text-white transition-colors"
                        title="Fullscreen"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
