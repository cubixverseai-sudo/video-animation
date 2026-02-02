/**
 * 🔊 AUDIO MEMORY - Scene-Sound Learning
 * 
 * Learns and remembers successful audio-visual relationships:
 * - Which sounds work with which scene types
 * - Music mood to visual mood mappings
 * - SFX timing patterns
 * - Audio layering combinations
 * - Volume balancing preferences
 */

import { MemoryCore, MemoryEntry } from '../core/MemoryCore';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export type AudioType = 'bgm' | 'sfx' | 'ambience' | 'voiceover';

export type SceneType = 
    | 'intro' | 'content' | 'transition' | 'climax' 
    | 'outro' | 'logo' | 'text' | 'product' | 'testimonial';

export type MoodType = 
    | 'epic' | 'calm' | 'tech' | 'playful' | 'corporate'
    | 'emotional' | 'dark' | 'luxury' | 'energetic' | 'mysterious';

export type SFXType = 
    | 'whoosh' | 'impact' | 'transition' | 'reveal' | 'click'
    | 'pop' | 'glitch' | 'rise' | 'fall' | 'electric' | 'magic';

export interface AudioSceneMapping {
    id: string;
    sceneType: SceneType;
    audioType: AudioType;
    mood: MoodType;
    characteristics: AudioCharacteristics;
    examples: AudioExample[];
    successScore: number;
    usageCount: number;
    lastUsed: number;
    createdAt: number;
    projectId?: string;
}

export interface AudioCharacteristics {
    tempo?: 'slow' | 'medium' | 'fast';
    energy?: 'low' | 'medium' | 'high';
    complexity?: 'minimal' | 'moderate' | 'complex';
    instruments?: string[];
    keywords: string[];
}

export interface AudioExample {
    filename: string;
    source: 'pixabay' | 'freesound' | 'local';
    duration: number;
    rating: number;  // 1-5
    usedInProject?: string;
}

export interface SFXPattern {
    id: string;
    triggerType: 'animation_start' | 'animation_end' | 'scene_change' | 'impact' | 'reveal' | 'transition';
    sfxType: SFXType;
    timing: SFXTiming;
    layering?: SFXLayering;
    successScore: number;
    usageCount: number;
    createdAt: number;
}

export interface SFXTiming {
    offsetFrames: number;      // Frames before/after trigger (-5 = 5 frames before)
    duration: number;          // Duration in frames
    fadeIn?: number;           // Fade in frames
    fadeOut?: number;          // Fade out frames
}

export interface SFXLayering {
    primary: string;           // Primary SFX type
    secondary?: string;        // Optional secondary layer
    volumeRatio: number;       // Secondary volume relative to primary (0-1)
    offsetFrames: number;      // Offset between primary and secondary
}

export interface AudioRecommendation {
    mapping: AudioSceneMapping;
    confidence: number;
    reason: string;
    searchKeywords: string[];
}

export interface AudioLayerConfig {
    bgm: { volume: number; ducking: number };
    sfx: { volume: number };
    ambience: { volume: number };
}

// ═══════════════════════════════════════════════════════════════
// 🔊 AUDIO MEMORY CLASS
// ═══════════════════════════════════════════════════════════════

export class AudioMemory {
    private memoryCore: MemoryCore;
    private readonly MAPPING_CATEGORY = 'audio_scene_mapping';
    private readonly SFX_CATEGORY = 'sfx_pattern';

    // Pre-built professional audio mappings
    private readonly PROFESSIONAL_MAPPINGS: Partial<AudioSceneMapping>[] = [
        // Intro scenes
        {
            sceneType: 'intro',
            audioType: 'bgm',
            mood: 'epic',
            characteristics: {
                tempo: 'medium',
                energy: 'high',
                complexity: 'moderate',
                instruments: ['orchestra', 'drums', 'brass'],
                keywords: ['epic', 'cinematic', 'trailer', 'powerful', 'intro']
            },
            examples: []
        },
        {
            sceneType: 'intro',
            audioType: 'bgm',
            mood: 'tech',
            characteristics: {
                tempo: 'medium',
                energy: 'medium',
                complexity: 'moderate',
                instruments: ['synth', 'electronic', 'bass'],
                keywords: ['tech', 'digital', 'modern', 'electronic', 'futuristic']
            },
            examples: []
        },
        // Logo reveals
        {
            sceneType: 'logo',
            audioType: 'sfx',
            mood: 'epic',
            characteristics: {
                energy: 'high',
                keywords: ['impact', 'logo', 'reveal', 'hit', 'boom']
            },
            examples: []
        },
        // Transitions
        {
            sceneType: 'transition',
            audioType: 'sfx',
            mood: 'tech',
            characteristics: {
                energy: 'medium',
                keywords: ['whoosh', 'transition', 'sweep', 'pass']
            },
            examples: []
        },
        // Content scenes
        {
            sceneType: 'content',
            audioType: 'bgm',
            mood: 'corporate',
            characteristics: {
                tempo: 'medium',
                energy: 'medium',
                complexity: 'minimal',
                instruments: ['piano', 'strings', 'acoustic'],
                keywords: ['corporate', 'business', 'professional', 'clean', 'modern']
            },
            examples: []
        },
        // Climax scenes
        {
            sceneType: 'climax',
            audioType: 'bgm',
            mood: 'epic',
            characteristics: {
                tempo: 'fast',
                energy: 'high',
                complexity: 'complex',
                instruments: ['orchestra', 'drums', 'choir'],
                keywords: ['climax', 'epic', 'powerful', 'dramatic', 'peak']
            },
            examples: []
        },
        // Outro scenes
        {
            sceneType: 'outro',
            audioType: 'bgm',
            mood: 'calm',
            characteristics: {
                tempo: 'slow',
                energy: 'low',
                complexity: 'minimal',
                instruments: ['piano', 'strings', 'pad'],
                keywords: ['outro', 'ending', 'calm', 'resolve', 'peaceful']
            },
            examples: []
        },
        // Ambient scenes
        {
            sceneType: 'content',
            audioType: 'ambience',
            mood: 'tech',
            characteristics: {
                energy: 'low',
                keywords: ['ambient', 'digital', 'drone', 'atmosphere', 'tech']
            },
            examples: []
        }
    ];

    // Pre-built SFX patterns
    private readonly PROFESSIONAL_SFX_PATTERNS: Partial<SFXPattern>[] = [
        {
            triggerType: 'animation_start',
            sfxType: 'whoosh',
            timing: { offsetFrames: -2, duration: 15, fadeIn: 2, fadeOut: 5 }
        },
        {
            triggerType: 'impact',
            sfxType: 'impact',
            timing: { offsetFrames: -2, duration: 30, fadeIn: 0, fadeOut: 10 },
            layering: { primary: 'impact', secondary: 'whoosh', volumeRatio: 0.5, offsetFrames: -5 }
        },
        {
            triggerType: 'reveal',
            sfxType: 'reveal',
            timing: { offsetFrames: 0, duration: 45, fadeIn: 5, fadeOut: 15 }
        },
        {
            triggerType: 'scene_change',
            sfxType: 'transition',
            timing: { offsetFrames: -3, duration: 20, fadeIn: 2, fadeOut: 8 }
        },
        {
            triggerType: 'transition',
            sfxType: 'whoosh',
            timing: { offsetFrames: -2, duration: 12, fadeIn: 1, fadeOut: 5 }
        }
    ];

    // Default audio layer configuration
    private readonly DEFAULT_LAYER_CONFIG: AudioLayerConfig = {
        bgm: { volume: 0.4, ducking: 0.3 },
        sfx: { volume: 0.8 },
        ambience: { volume: 0.15 }
    };

    constructor(memoryCore: MemoryCore) {
        this.memoryCore = memoryCore;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    async initialize(): Promise<void> {
        // Load professional mappings
        for (const mapping of this.PROFESSIONAL_MAPPINGS) {
            const existing = await this.findMapping(mapping.sceneType!, mapping.audioType!, mapping.mood!);
            if (!existing) {
                await this.storeMapping({
                    ...mapping,
                    id: this.generateId(),
                    examples: [],
                    successScore: 0.75,
                    usageCount: 0,
                    lastUsed: 0,
                    createdAt: Date.now()
                } as AudioSceneMapping);
            }
        }

        // Load professional SFX patterns
        for (const pattern of this.PROFESSIONAL_SFX_PATTERNS) {
            const existing = await this.findSFXPattern(pattern.triggerType!, pattern.sfxType!);
            if (!existing) {
                await this.storeSFXPattern({
                    ...pattern,
                    id: this.generateId(),
                    successScore: 0.75,
                    usageCount: 0,
                    createdAt: Date.now()
                } as SFXPattern);
            }
        }

        console.log('🔊 AudioMemory initialized');
    }

    // ═══════════════════════════════════════════════════════════════
    // 💾 STORAGE METHODS
    // ═══════════════════════════════════════════════════════════════

    async storeMapping(mapping: AudioSceneMapping): Promise<string> {
        return this.memoryCore.store('semantic', this.MAPPING_CATEGORY, mapping, {
            importance: mapping.successScore > 0.7 ? 'high' : 'medium',
            tags: ['audio', 'mapping', mapping.sceneType, mapping.audioType, mapping.mood]
        });
    }

    async storeSFXPattern(pattern: SFXPattern): Promise<string> {
        return this.memoryCore.store('procedural', this.SFX_CATEGORY, pattern, {
            importance: 'high',
            tags: ['sfx', 'pattern', pattern.triggerType, pattern.sfxType]
        });
    }

    /**
     * Learn from successful audio usage
     */
    async learnFromSuccess(
        audio: {
            sceneType: SceneType;
            audioType: AudioType;
            mood: MoodType;
            filename: string;
            source: 'pixabay' | 'freesound' | 'local';
            duration: number;
        },
        feedback: number = 4 // 1-5 rating
    ): Promise<void> {
        // Find or create mapping
        let mapping = await this.findMapping(audio.sceneType, audio.audioType, audio.mood);

        if (mapping) {
            // Update existing mapping
            mapping.examples.push({
                filename: audio.filename,
                source: audio.source,
                duration: audio.duration,
                rating: feedback
            });
            mapping.usageCount++;
            mapping.lastUsed = Date.now();
            mapping.successScore = mapping.successScore * 0.8 + (feedback / 5) * 0.2;

            await this.memoryCore.update(mapping.id, mapping);
        } else {
            // Create new mapping
            await this.storeMapping({
                id: this.generateId(),
                sceneType: audio.sceneType,
                audioType: audio.audioType,
                mood: audio.mood,
                characteristics: {
                    keywords: [audio.mood, audio.sceneType]
                },
                examples: [{
                    filename: audio.filename,
                    source: audio.source,
                    duration: audio.duration,
                    rating: feedback
                }],
                successScore: feedback / 5,
                usageCount: 1,
                lastUsed: Date.now(),
                createdAt: Date.now()
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔍 RETRIEVAL METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get audio recommendation for a scene
     */
    async recommendAudio(
        sceneType: SceneType,
        mood?: MoodType
    ): Promise<AudioRecommendation[]> {
        const entries = this.memoryCore.query({
            category: this.MAPPING_CATEGORY,
            tags: [sceneType],
            limit: 20
        });

        const recommendations: AudioRecommendation[] = [];

        for (const entry of entries) {
            const mapping = entry.content as AudioSceneMapping;
            let confidence = mapping.successScore;
            const reasons: string[] = [];

            // Boost for mood match
            if (mood && mapping.mood === mood) {
                confidence += 0.2;
                reasons.push(`Mood match: ${mood}`);
            }

            // Boost for high usage
            if (mapping.usageCount > 5) {
                confidence += 0.1;
                reasons.push('Frequently used');
            }

            // Boost for recent success
            const daysSinceUse = (Date.now() - mapping.lastUsed) / (1000 * 60 * 60 * 24);
            if (daysSinceUse < 7 && mapping.lastUsed > 0) {
                confidence += 0.05;
                reasons.push('Recently successful');
            }

            // Boost for high-rated examples
            const avgRating = mapping.examples.length > 0
                ? mapping.examples.reduce((sum, e) => sum + e.rating, 0) / mapping.examples.length
                : 3;
            if (avgRating >= 4) {
                confidence += 0.1;
                reasons.push('High-rated examples');
            }

            recommendations.push({
                mapping,
                confidence: Math.min(confidence, 1),
                reason: reasons.join(', ') || `${mapping.sceneType} ${mapping.audioType}`,
                searchKeywords: mapping.characteristics.keywords
            });
        }

        recommendations.sort((a, b) => b.confidence - a.confidence);
        return recommendations.slice(0, 5);
    }

    /**
     * Get SFX recommendation for a trigger
     */
    async recommendSFX(
        triggerType: SFXPattern['triggerType']
    ): Promise<SFXPattern[]> {
        const entries = this.memoryCore.query({
            category: this.SFX_CATEGORY,
            tags: [triggerType],
            limit: 10
        });

        return entries
            .map(e => e.content as SFXPattern)
            .sort((a, b) => b.successScore - a.successScore);
    }

    /**
     * Get best keywords for audio search
     */
    async getSearchKeywords(
        sceneType: SceneType,
        audioType: AudioType,
        mood?: MoodType
    ): Promise<string[]> {
        const recommendations = await this.recommendAudio(sceneType, mood);
        
        const filteredRecs = recommendations.filter(r => r.mapping.audioType === audioType);
        
        if (filteredRecs.length === 0) {
            // Fallback keywords
            return [mood || 'cinematic', sceneType, audioType];
        }

        // Combine keywords from top recommendations
        const allKeywords = filteredRecs
            .slice(0, 3)
            .flatMap(r => r.searchKeywords);

        // Count and deduplicate
        const counts = new Map<string, number>();
        for (const kw of allKeywords) {
            counts.set(kw, (counts.get(kw) || 0) + 1);
        }

        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([kw]) => kw);
    }

    /**
     * Find specific mapping
     */
    async findMapping(
        sceneType: SceneType,
        audioType: AudioType,
        mood: MoodType
    ): Promise<AudioSceneMapping | null> {
        const entries = this.memoryCore.query({
            category: this.MAPPING_CATEGORY,
            tags: [sceneType, audioType, mood],
            limit: 5
        });

        for (const entry of entries) {
            const mapping = entry.content as AudioSceneMapping;
            if (mapping.sceneType === sceneType && 
                mapping.audioType === audioType && 
                mapping.mood === mood) {
                return mapping;
            }
        }

        return null;
    }

    /**
     * Find SFX pattern
     */
    async findSFXPattern(
        triggerType: SFXPattern['triggerType'],
        sfxType: SFXType
    ): Promise<SFXPattern | null> {
        const entries = this.memoryCore.query({
            category: this.SFX_CATEGORY,
            tags: [triggerType, sfxType],
            limit: 5
        });

        for (const entry of entries) {
            const pattern = entry.content as SFXPattern;
            if (pattern.triggerType === triggerType && pattern.sfxType === sfxType) {
                return pattern;
            }
        }

        return null;
    }

    /**
     * Get optimal layer configuration
     */
    getLayerConfig(): AudioLayerConfig {
        // In the future, this could be learned from user preferences
        return { ...this.DEFAULT_LAYER_CONFIG };
    }

    /**
     * Learn layer preferences from feedback
     */
    async updateLayerConfig(
        adjustments: Partial<AudioLayerConfig>,
        feedback: 'better' | 'worse'
    ): Promise<void> {
        // Store as preference memory
        await this.memoryCore.store('semantic', 'audio_preference', {
            adjustments,
            feedback,
            timestamp: Date.now()
        }, {
            importance: 'medium',
            tags: ['preference', 'audio_levels', feedback]
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    private generateId(): string {
        return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get mood suggestions based on visual analysis
     */
    suggestMoodFromVisual(
        visualCharacteristics: {
            colors?: string[];
            brightness?: 'dark' | 'medium' | 'bright';
            energy?: 'low' | 'medium' | 'high';
        }
    ): MoodType[] {
        const suggestions: MoodType[] = [];

        // Based on brightness
        if (visualCharacteristics.brightness === 'dark') {
            suggestions.push('dark', 'mysterious', 'epic');
        } else if (visualCharacteristics.brightness === 'bright') {
            suggestions.push('playful', 'energetic', 'corporate');
        }

        // Based on energy
        if (visualCharacteristics.energy === 'high') {
            suggestions.push('epic', 'energetic');
        } else if (visualCharacteristics.energy === 'low') {
            suggestions.push('calm', 'emotional');
        }

        // Based on colors (simplified)
        if (visualCharacteristics.colors) {
            const colors = visualCharacteristics.colors.join(' ').toLowerCase();
            if (colors.includes('blue') || colors.includes('purple')) {
                suggestions.push('tech', 'calm');
            }
            if (colors.includes('gold') || colors.includes('black')) {
                suggestions.push('luxury');
            }
            if (colors.includes('red') || colors.includes('orange')) {
                suggestions.push('energetic', 'epic');
            }
        }

        // Deduplicate and return
        return [...new Set(suggestions)].slice(0, 3);
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 EXPORT
// ═══════════════════════════════════════════════════════════════

export function createAudioMemory(memoryCore: MemoryCore): AudioMemory {
    return new AudioMemory(memoryCore);
}
