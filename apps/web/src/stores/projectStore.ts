import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════
// 📁 PROJECT STORE
// Manages project state and metadata
// ═══════════════════════════════════════════════════════════════

export interface Asset {
    id: string;
    name: string;
    type: 'image' | 'audio' | 'video' | 'svg' | 'font';
    url: string;
    size?: number;
    uploadedAt: Date;
}

export interface ProjectState {
    // State
    projectId: string | null;
    projectName: string;
    status: 'idle' | 'generating' | 'completed' | 'error';
    prompt: string;
    presets: string[];
    assets: Asset[];
    createdAt: Date | null;

    // Actions
    setProject: (id: string, name: string) => void;
    setPrompt: (prompt: string) => void;
    togglePreset: (presetId: string) => void;
    setPresets: (presets: string[]) => void;
    addAsset: (asset: Asset) => void;
    removeAsset: (assetId: string) => void;
    updateStatus: (status: ProjectState['status']) => void;
    reset: () => void;
}

const initialProjectState = {
    projectId: null,
    projectName: 'Untitled Project',
    status: 'idle' as const,
    prompt: '',
    presets: [],
    assets: [],
    createdAt: null,
};

export const useProjectStore = create<ProjectState>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialProjectState,

                setProject: (id, name) => set({
                    projectId: id,
                    projectName: name,
                    createdAt: new Date()
                }),

                setPrompt: (prompt) => set({ prompt }),

                togglePreset: (presetId) => {
                    const { presets } = get();
                    if (presets.includes(presetId)) {
                        set({ presets: presets.filter(p => p !== presetId) });
                    } else {
                        set({ presets: [...presets, presetId] });
                    }
                },

                setPresets: (presets) => set({ presets }),

                addAsset: (asset) => set(state => ({
                    assets: [...state.assets, asset]
                })),

                removeAsset: (assetId) => set(state => ({
                    assets: state.assets.filter(a => a.id !== assetId)
                })),

                updateStatus: (status) => set({ status }),

                reset: () => set(initialProjectState),
            }),
            {
                name: 'director-project-store',
                partialize: (state) => ({
                    projectId: state.projectId,
                    projectName: state.projectName,
                    prompt: state.prompt,
                    presets: state.presets,
                }),
            }
        ),
        { name: 'ProjectStore' }
    )
);
