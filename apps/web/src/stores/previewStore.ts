import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════
// 🎬 PREVIEW STORE
// Manages video preview player state
// ═══════════════════════════════════════════════════════════════

export interface PreviewState {
    // State
    isPlaying: boolean;
    isLoading: boolean;
    currentFrame: number;
    totalFrames: number;
    fps: number;
    width: number;
    height: number;
    previewUrl: string | null;
    compositionId: string | null;

    // Export state
    isExporting: boolean;
    exportProgress: number;
    exportedUrl: string | null;

    // Actions
    play: () => void;
    pause: () => void;
    toggle: () => void;
    seekTo: (frame: number) => void;
    reset: () => void;
    setLoading: (loading: boolean) => void;
    setVideoConfig: (config: { totalFrames: number; fps: number; width: number; height: number }) => void;
    setPreviewUrl: (url: string | null) => void;
    setComposition: (id: string) => void;

    // Export actions
    startExport: () => void;
    updateExportProgress: (progress: number) => void;
    completeExport: (url: string) => void;
    cancelExport: () => void;
}

const initialPreviewState = {
    isPlaying: false,
    isLoading: true,
    currentFrame: 0,
    totalFrames: 0,
    fps: 30,
    width: 1920,
    height: 1080,
    previewUrl: null,
    compositionId: null,
    isExporting: false,
    exportProgress: 0,
    exportedUrl: null,
};

export const usePreviewStore = create<PreviewState>()(
    devtools(
        (set, get) => ({
            ...initialPreviewState,

            play: () => set({ isPlaying: true }),

            pause: () => set({ isPlaying: false }),

            toggle: () => set(state => ({ isPlaying: !state.isPlaying })),

            seekTo: (frame) => {
                const { totalFrames } = get();
                const clampedFrame = Math.max(0, Math.min(frame, totalFrames));
                set({ currentFrame: clampedFrame });
            },

            reset: () => set({
                currentFrame: 0,
                isPlaying: false
            }),

            setLoading: (loading) => set({ isLoading: loading }),

            setVideoConfig: (config) => set({
                totalFrames: config.totalFrames,
                fps: config.fps,
                width: config.width,
                height: config.height,
            }),

            setPreviewUrl: (url) => set({
                previewUrl: url,
                isLoading: false
            }),

            setComposition: (id) => set({
                compositionId: id,
                currentFrame: 0,
                isPlaying: false
            }),

            // Export actions
            startExport: () => set({
                isExporting: true,
                exportProgress: 0,
                exportedUrl: null
            }),

            updateExportProgress: (progress) => set({ exportProgress: progress }),

            completeExport: (url) => set({
                isExporting: false,
                exportProgress: 100,
                exportedUrl: url
            }),

            cancelExport: () => set({
                isExporting: false,
                exportProgress: 0
            }),
        }),
        { name: 'PreviewStore' }
    )
);

// ═══════════════════════════════════════════════════════════════
// 🎯 SELECTORS
// Computed values for common use cases
// ═══════════════════════════════════════════════════════════════

export const selectCurrentTime = (state: PreviewState) =>
    state.fps > 0 ? state.currentFrame / state.fps : 0;

export const selectTotalDuration = (state: PreviewState) =>
    state.fps > 0 ? state.totalFrames / state.fps : 0;

export const selectProgress = (state: PreviewState) =>
    state.totalFrames > 0 ? (state.currentFrame / state.totalFrames) * 100 : 0;
