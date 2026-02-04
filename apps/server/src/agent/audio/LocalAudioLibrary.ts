/**
 * 🎵 LOCAL AUDIO LIBRARY
 * Fallback library with essential sounds for offline use
 * These are bundled with the application
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AudioRequirement, SFXCategory, AudioMood } from './AudioDecisionEngine';

// Base path for local audio library - use process.cwd() for reliable path resolution
// process.cwd() returns apps/server when running from there
const LIBRARY_PATH = path.resolve(process.cwd(), 'storage/audio-library');

export interface LocalAudioAsset {
    id: string;
    name: string;
    filename: string;
    type: 'bgm' | 'sfx' | 'ambience';
    category?: SFXCategory;
    mood?: AudioMood;
    tags: string[];
    duration: number; // in seconds
    path: string;
}

// ═══════════════════════════════════════════════════════════════
// 📚 BUILT-IN AUDIO LIBRARY
// ═══════════════════════════════════════════════════════════════

/**
 * Essential SFX that should always be available
 */
export const ESSENTIAL_SFX: LocalAudioAsset[] = [
    // Whooshes
    {
        id: 'whoosh-fast',
        name: 'Fast Whoosh',
        filename: 'whoosh-fast.mp3',
        type: 'sfx',
        category: 'whoosh',
        tags: ['whoosh', 'swoosh', 'fast', 'movement', 'transition'],
        duration: 0.5,
        path: ''
    },
    {
        id: 'whoosh-slow',
        name: 'Slow Whoosh',
        filename: 'whoosh-slow.mp3',
        type: 'sfx',
        category: 'whoosh',
        tags: ['whoosh', 'swoosh', 'slow', 'cinematic', 'sweep'],
        duration: 1.2,
        path: ''
    },
    // Impacts
    {
        id: 'impact-deep',
        name: 'Deep Impact',
        filename: 'impact-deep.mp3',
        type: 'sfx',
        category: 'impact',
        tags: ['impact', 'hit', 'boom', 'bass', 'cinematic'],
        duration: 1.5,
        path: ''
    },
    {
        id: 'impact-punch',
        name: 'Punch Impact',
        filename: 'impact-punch.mp3',
        type: 'sfx',
        category: 'impact',
        tags: ['impact', 'punch', 'hit', 'thud'],
        duration: 0.8,
        path: ''
    },
    // Transitions
    {
        id: 'transition-sweep',
        name: 'Sweep Transition',
        filename: 'transition-sweep.mp3',
        type: 'sfx',
        category: 'transition',
        tags: ['transition', 'sweep', 'pass', 'cinematic'],
        duration: 1.0,
        path: ''
    },
    // Reveals
    {
        id: 'reveal-magic',
        name: 'Magic Reveal',
        filename: 'reveal-magic.mp3',
        type: 'sfx',
        category: 'reveal',
        tags: ['reveal', 'magic', 'sparkle', 'shimmer'],
        duration: 2.0,
        path: ''
    },
    {
        id: 'reveal-shine',
        name: 'Shine Reveal',
        filename: 'reveal-shine.mp3',
        type: 'sfx',
        category: 'reveal',
        tags: ['reveal', 'shine', 'light', 'bright'],
        duration: 1.5,
        path: ''
    },
    // UI Sounds
    {
        id: 'click-soft',
        name: 'Soft Click',
        filename: 'click-soft.mp3',
        type: 'sfx',
        category: 'click',
        tags: ['click', 'button', 'ui', 'interface', 'tap'],
        duration: 0.2,
        path: ''
    },
    {
        id: 'pop-bubble',
        name: 'Bubble Pop',
        filename: 'pop-bubble.mp3',
        type: 'sfx',
        category: 'pop',
        tags: ['pop', 'bubble', 'notification', 'ui'],
        duration: 0.3,
        path: ''
    },
    // Glitch
    {
        id: 'glitch-digital',
        name: 'Digital Glitch',
        filename: 'glitch-digital.mp3',
        type: 'sfx',
        category: 'glitch',
        tags: ['glitch', 'digital', 'error', 'static', 'tech'],
        duration: 0.8,
        path: ''
    },
    // Rise/Fall
    {
        id: 'rise-tension',
        name: 'Tension Riser',
        filename: 'rise-tension.mp3',
        type: 'sfx',
        category: 'rise',
        tags: ['rise', 'riser', 'tension', 'build', 'anticipation'],
        duration: 3.0,
        path: ''
    },
    // Electric
    {
        id: 'electric-spark',
        name: 'Electric Spark',
        filename: 'electric-spark.mp3',
        type: 'sfx',
        category: 'electric',
        tags: ['electric', 'spark', 'zap', 'energy', 'power'],
        duration: 0.5,
        path: ''
    }
];

/**
 * Essential BGM tracks
 */
export const ESSENTIAL_BGM: LocalAudioAsset[] = [
    {
        id: 'bgm-tech-modern',
        name: 'Modern Tech',
        filename: 'bgm-tech-modern.mp3',
        type: 'bgm',
        mood: 'tech',
        tags: ['tech', 'modern', 'digital', 'electronic', 'corporate'],
        duration: 120,
        path: ''
    },
    {
        id: 'bgm-cinematic-epic',
        name: 'Epic Cinematic',
        filename: 'bgm-cinematic-epic.mp3',
        type: 'bgm',
        mood: 'epic',
        tags: ['epic', 'cinematic', 'dramatic', 'powerful', 'orchestra'],
        duration: 150,
        path: ''
    },
    {
        id: 'bgm-corporate-upbeat',
        name: 'Corporate Upbeat',
        filename: 'bgm-corporate-upbeat.mp3',
        type: 'bgm',
        mood: 'corporate',
        tags: ['corporate', 'business', 'upbeat', 'professional', 'positive'],
        duration: 90,
        path: ''
    },
    {
        id: 'bgm-calm-ambient',
        name: 'Calm Ambient',
        filename: 'bgm-calm-ambient.mp3',
        type: 'bgm',
        mood: 'calm',
        tags: ['calm', 'ambient', 'peaceful', 'relaxing', 'soft'],
        duration: 180,
        path: ''
    },
    {
        id: 'bgm-dark-mysterious',
        name: 'Dark Mysterious',
        filename: 'bgm-dark-mysterious.mp3',
        type: 'bgm',
        mood: 'dark',
        tags: ['dark', 'mysterious', 'suspense', 'thriller', 'ominous'],
        duration: 120,
        path: ''
    }
];

/**
 * Essential Ambience tracks
 */
export const ESSENTIAL_AMBIENCE: LocalAudioAsset[] = [
    {
        id: 'ambience-tech-hum',
        name: 'Tech Hum',
        filename: 'ambience-tech-hum.mp3',
        type: 'ambience',
        mood: 'tech',
        tags: ['tech', 'digital', 'hum', 'electronic', 'drone'],
        duration: 60,
        path: ''
    },
    {
        id: 'ambience-space',
        name: 'Space Atmosphere',
        filename: 'ambience-space.mp3',
        type: 'ambience',
        mood: 'futuristic',
        tags: ['space', 'atmosphere', 'sci-fi', 'ambient', 'cosmic'],
        duration: 90,
        path: ''
    }
];

// ═══════════════════════════════════════════════════════════════
// 🔧 LIBRARY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all assets in the local library
 */
export function getAllLocalAssets(): LocalAudioAsset[] {
    const all = [...ESSENTIAL_SFX, ...ESSENTIAL_BGM, ...ESSENTIAL_AMBIENCE];
    
    // Set correct paths
    return all.map(asset => ({
        ...asset,
        path: path.join(LIBRARY_PATH, asset.type, asset.filename)
    }));
}

/**
 * Find local assets by type
 */
export function getLocalAssetsByType(type: 'bgm' | 'sfx' | 'ambience'): LocalAudioAsset[] {
    let assets: LocalAudioAsset[] = [];
    
    switch (type) {
        case 'bgm':
            assets = ESSENTIAL_BGM;
            break;
        case 'sfx':
            assets = ESSENTIAL_SFX;
            break;
        case 'ambience':
            assets = ESSENTIAL_AMBIENCE;
            break;
    }

    return assets.map(asset => ({
        ...asset,
        path: path.join(LIBRARY_PATH, asset.type, asset.filename)
    }));
}

/**
 * Find local asset by category (for SFX)
 */
export function getLocalAssetsByCategory(category: SFXCategory): LocalAudioAsset[] {
    return ESSENTIAL_SFX
        .filter(asset => asset.category === category)
        .map(asset => ({
            ...asset,
            path: path.join(LIBRARY_PATH, 'sfx', asset.filename)
        }));
}

/**
 * Find local asset by mood (for BGM/Ambience)
 */
export function getLocalAssetsByMood(mood: AudioMood): LocalAudioAsset[] {
    const bgm = ESSENTIAL_BGM.filter(asset => asset.mood === mood);
    const ambience = ESSENTIAL_AMBIENCE.filter(asset => asset.mood === mood);
    
    return [...bgm, ...ambience].map(asset => ({
        ...asset,
        path: path.join(LIBRARY_PATH, asset.type, asset.filename)
    }));
}

/**
 * Find best local match for an audio requirement
 */
export function findBestLocalMatch(requirement: AudioRequirement): LocalAudioAsset | null {
    let candidates: LocalAudioAsset[] = [];

    // Get candidates based on type
    if (requirement.type === 'sfx' && requirement.category) {
        candidates = getLocalAssetsByCategory(requirement.category);
    } else if (requirement.type === 'bgm') {
        candidates = getLocalAssetsByMood(requirement.mood);
        if (candidates.length === 0) {
            candidates = getLocalAssetsByType('bgm');
        }
    } else if (requirement.type === 'ambience') {
        candidates = getLocalAssetsByMood(requirement.mood);
        if (candidates.length === 0) {
            candidates = getLocalAssetsByType('ambience');
        }
    } else {
        candidates = getLocalAssetsByType(requirement.type);
    }

    if (candidates.length === 0) {
        return null;
    }

    // Score candidates
    const scored = candidates.map(asset => ({
        asset,
        score: calculateLocalMatchScore(asset, requirement)
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored[0].asset;
}

/**
 * Calculate match score for local asset
 */
function calculateLocalMatchScore(asset: LocalAudioAsset, requirement: AudioRequirement): number {
    let score = 0;

    // Tag matching
    const keywords = requirement.keywords.map(k => k.toLowerCase());
    const matchedTags = asset.tags.filter(tag => 
        keywords.some(kw => tag.toLowerCase().includes(kw) || kw.includes(tag.toLowerCase()))
    );
    score += matchedTags.length * 20;

    // Category match (for SFX)
    if (requirement.category && asset.category === requirement.category) {
        score += 50;
    }

    // Mood match (for BGM/Ambience)
    if (asset.mood && asset.mood === requirement.mood) {
        score += 50;
    }

    // Name contains keywords
    const nameLower = asset.name.toLowerCase();
    keywords.forEach(kw => {
        if (nameLower.includes(kw)) score += 15;
    });

    return score;
}

/**
 * Check if local asset file exists
 */
export async function localAssetExists(asset: LocalAudioAsset): Promise<boolean> {
    try {
        await fs.access(asset.path);
        return true;
    } catch {
        return false;
    }
}

/**
 * Copy local asset to project folder
 */
export async function copyLocalAssetToProject(
    asset: LocalAudioAsset,
    projectId: string,
    destinationFilename?: string
): Promise<string | null> {
    try {
        // Single source of truth: root /projects/{id}/assets/audio
        const projectAssetsPath = path.resolve(
            process.cwd(), 
            '../../projects', 
            projectId, 
            'assets/audio'
        );
        
        const filename = destinationFilename || asset.filename;
        const destPath = path.join(projectAssetsPath, filename);

        // Check if source exists
        const exists = await localAssetExists(asset);
        if (!exists) {
            console.warn(`⚠️ Local asset not found: ${asset.path}`);
            return null;
        }

        // Ensure destination directory exists
        await fs.mkdir(projectAssetsPath, { recursive: true });

        // Copy file
        await fs.copyFile(asset.path, destPath);

        console.log(`✅ Copied local asset: ${asset.name} → ${destPath}`);
        return destPath;

    } catch (error) {
        console.error('Error copying local asset:', error);
        return null;
    }
}

/**
 * Initialize local library directory structure
 */
export async function initializeLocalLibrary(): Promise<void> {
    const dirs = [
        path.join(LIBRARY_PATH, 'bgm'),
        path.join(LIBRARY_PATH, 'sfx'),
        path.join(LIBRARY_PATH, 'ambience')
    ];

    for (const dir of dirs) {
        await fs.mkdir(dir, { recursive: true });
    }

    console.log('📁 Local audio library initialized');
}
