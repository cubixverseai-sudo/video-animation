/**
 * 📚 TEMPLATE LIBRARY - Successful Composition Templates
 * 
 * Stores and retrieves successful video compositions for reuse:
 * - Complete scene structures
 * - Proven animation combinations
 * - Tested audio-visual pairings
 * - Scene timing blueprints
 */

import { MemoryCore, MemoryEntry } from '../core/MemoryCore';
import { AnimationPattern } from '../motion/MotionMemory';
import { AudioSceneMapping } from '../audio/AudioMemory';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export type VideoType = 'ad' | 'explainer' | 'brand' | 'promo' | 'social' | 'intro' | 'logo';
export type TemplateComplexity = 'simple' | 'medium' | 'complex';

export interface CompositionTemplate {
    id: string;
    name: string;
    description: string;
    videoType: VideoType;
    complexity: TemplateComplexity;
    
    // Structure
    structure: TemplateStructure;
    
    // Components
    scenes: SceneTemplate[];
    
    // Metadata
    tags: string[];
    successScore: number;
    usageCount: number;
    lastUsed: number;
    createdAt: number;
    projectId?: string;
    
    // Source code reference (if available)
    sourceFiles?: string[];
    thumbnail?: string;
}

export interface TemplateStructure {
    totalDuration: number;        // frames
    fps: number;
    width: number;
    height: number;
    aspectRatio: string;
    sceneCount: number;
    audioLayers: number;
}

export interface SceneTemplate {
    id: string;
    name: string;
    type: 'intro' | 'content' | 'transition' | 'climax' | 'outro' | 'logo';
    startFrame: number;
    endFrame: number;
    duration: number;
    
    // Visual elements
    elements: ElementTemplate[];
    
    // Animation
    animations: AnimationReference[];
    
    // Audio
    audio: AudioReference[];
    
    // Effects
    effects: EffectReference[];
    
    // Camera
    camera?: CameraReference;
}

export interface ElementTemplate {
    type: 'text' | 'image' | 'shape' | 'video' | 'logo' | 'background';
    layer: number;
    position: { x: number | string; y: number | string };
    size?: { width: number | string; height: number | string };
    style?: Record<string, any>;
    content?: string;  // For text elements
}

export interface AnimationReference {
    patternId?: string;           // Reference to MotionMemory pattern
    patternName?: string;
    targetElement: number;        // Index in elements array
    startFrame: number;
    endFrame: number;
    properties: Record<string, any>;
}

export interface AudioReference {
    type: 'bgm' | 'sfx' | 'ambience';
    mood?: string;
    keywords?: string[];
    startFrame: number;
    duration: number;
    volume: number;
    fadeIn?: number;
    fadeOut?: number;
}

export interface EffectReference {
    type: 'particle' | 'colorGrade' | 'vignette' | 'grain' | 'blur' | 'glow';
    preset?: string;
    settings: Record<string, any>;
    startFrame: number;
    endFrame: number;
}

export interface CameraReference {
    type: 'dolly' | 'pan' | 'tilt' | 'crane' | 'shake' | 'zoom';
    intensity: number;
    startFrame: number;
    endFrame: number;
    easing: string;
}

export interface TemplateRecommendation {
    template: CompositionTemplate;
    confidence: number;
    reason: string;
    requiredAdaptations: string[];
}

// ═══════════════════════════════════════════════════════════════
// 📚 TEMPLATE LIBRARY CLASS
// ═══════════════════════════════════════════════════════════════

export class TemplateLibrary {
    private memoryCore: MemoryCore;
    private readonly CATEGORY = 'composition_template';

    // Pre-built professional templates
    private readonly PROFESSIONAL_TEMPLATES: Partial<CompositionTemplate>[] = [
        {
            name: 'Modern Logo Reveal',
            description: 'Clean, professional logo reveal with impact and glow effects',
            videoType: 'logo',
            complexity: 'simple',
            structure: {
                totalDuration: 150,
                fps: 30,
                width: 1920,
                height: 1080,
                aspectRatio: '16:9',
                sceneCount: 1,
                audioLayers: 2
            },
            scenes: [
                {
                    id: 'scene_logo',
                    name: 'Logo Reveal',
                    type: 'logo',
                    startFrame: 0,
                    endFrame: 150,
                    duration: 150,
                    elements: [
                        { type: 'background', layer: 0, position: { x: 0, y: 0 }, style: { backgroundColor: '#0a0a0a' } },
                        { type: 'logo', layer: 1, position: { x: '50%', y: '50%' }, size: { width: '30%', height: 'auto' } }
                    ],
                    animations: [
                        { targetElement: 1, startFrame: 15, endFrame: 45, patternName: 'Logo Reveal', properties: { scale: [0.8, 1], opacity: [0, 1] } }
                    ],
                    audio: [
                        { type: 'sfx', keywords: ['impact', 'logo', 'hit'], startFrame: 20, duration: 30, volume: 0.8 }
                    ],
                    effects: [
                        { type: 'glow', preset: 'soft', settings: { color: '#6366F1', intensity: 0.5 }, startFrame: 25, endFrame: 120 },
                        { type: 'vignette', settings: { intensity: 0.3 }, startFrame: 0, endFrame: 150 }
                    ],
                    camera: { type: 'dolly', intensity: 0.3, startFrame: 0, endFrame: 60, easing: 'power2.out' }
                }
            ],
            tags: ['logo', 'reveal', 'modern', 'clean', 'impact']
        },
        {
            name: 'Tech Product Showcase',
            description: '3-scene product showcase with tech aesthetic',
            videoType: 'promo',
            complexity: 'medium',
            structure: {
                totalDuration: 300,
                fps: 30,
                width: 1920,
                height: 1080,
                aspectRatio: '16:9',
                sceneCount: 3,
                audioLayers: 3
            },
            scenes: [
                {
                    id: 'scene_intro',
                    name: 'Intro',
                    type: 'intro',
                    startFrame: 0,
                    endFrame: 90,
                    duration: 90,
                    elements: [
                        { type: 'background', layer: 0, position: { x: 0, y: 0 }, style: { background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)' } },
                        { type: 'text', layer: 1, position: { x: '50%', y: '50%' }, content: 'INTRODUCING', style: { fontSize: '24px', color: '#8B5CF6' } }
                    ],
                    animations: [
                        { targetElement: 1, startFrame: 10, endFrame: 40, patternName: 'Premium Fade In', properties: {} }
                    ],
                    audio: [
                        { type: 'bgm', mood: 'tech', keywords: ['electronic', 'modern'], startFrame: 0, duration: 300, volume: 0.4, fadeIn: 30 },
                        { type: 'ambience', keywords: ['digital', 'atmosphere'], startFrame: 0, duration: 300, volume: 0.15 }
                    ],
                    effects: [],
                    camera: { type: 'crane', intensity: 0.2, startFrame: 0, endFrame: 90, easing: 'power2.out' }
                },
                {
                    id: 'scene_product',
                    name: 'Product',
                    type: 'content',
                    startFrame: 90,
                    endFrame: 210,
                    duration: 120,
                    elements: [
                        { type: 'image', layer: 1, position: { x: '50%', y: '50%' }, size: { width: '60%', height: 'auto' } }
                    ],
                    animations: [
                        { targetElement: 0, startFrame: 90, endFrame: 120, patternName: 'Dramatic Scale', properties: {} }
                    ],
                    audio: [
                        { type: 'sfx', keywords: ['whoosh', 'transition'], startFrame: 88, duration: 15, volume: 0.7 }
                    ],
                    effects: [
                        { type: 'particle', preset: 'glow', settings: { count: 30, color: '#6366F1' }, startFrame: 100, endFrame: 200 }
                    ]
                },
                {
                    id: 'scene_cta',
                    name: 'CTA',
                    type: 'outro',
                    startFrame: 210,
                    endFrame: 300,
                    duration: 90,
                    elements: [
                        { type: 'text', layer: 1, position: { x: '50%', y: '40%' }, content: 'Get Started', style: { fontSize: '48px', fontWeight: 'bold' } },
                        { type: 'logo', layer: 2, position: { x: '50%', y: '70%' }, size: { width: '15%', height: 'auto' } }
                    ],
                    animations: [
                        { targetElement: 0, startFrame: 215, endFrame: 245, patternName: 'Staggered Text Reveal', properties: {} },
                        { targetElement: 1, startFrame: 235, endFrame: 265, patternName: 'Premium Fade In', properties: {} }
                    ],
                    audio: [
                        { type: 'sfx', keywords: ['reveal', 'shine'], startFrame: 220, duration: 30, volume: 0.6 }
                    ],
                    effects: []
                }
            ],
            tags: ['tech', 'product', 'showcase', 'modern', 'promo']
        },
        {
            name: 'Social Media Ad (15s)',
            description: 'Fast-paced 15-second social media ad',
            videoType: 'social',
            complexity: 'simple',
            structure: {
                totalDuration: 450,
                fps: 30,
                width: 1080,
                height: 1920,
                aspectRatio: '9:16',
                sceneCount: 3,
                audioLayers: 2
            },
            scenes: [
                {
                    id: 'scene_hook',
                    name: 'Hook',
                    type: 'intro',
                    startFrame: 0,
                    endFrame: 90,
                    duration: 90,
                    elements: [
                        { type: 'text', layer: 1, position: { x: '50%', y: '50%' }, content: 'STOP SCROLLING', style: { fontSize: '64px', fontWeight: 'black' } }
                    ],
                    animations: [
                        { targetElement: 0, startFrame: 5, endFrame: 25, patternName: 'Bouncy Pop In', properties: {} }
                    ],
                    audio: [
                        { type: 'bgm', mood: 'energetic', keywords: ['upbeat', 'trendy'], startFrame: 0, duration: 450, volume: 0.5 },
                        { type: 'sfx', keywords: ['impact', 'attention'], startFrame: 8, duration: 20, volume: 0.8 }
                    ],
                    effects: []
                },
                {
                    id: 'scene_value',
                    name: 'Value Prop',
                    type: 'content',
                    startFrame: 90,
                    endFrame: 330,
                    duration: 240,
                    elements: [
                        { type: 'text', layer: 1, position: { x: '50%', y: '30%' } },
                        { type: 'image', layer: 2, position: { x: '50%', y: '60%' } }
                    ],
                    animations: [],
                    audio: [
                        { type: 'sfx', keywords: ['whoosh'], startFrame: 88, duration: 10, volume: 0.6 }
                    ],
                    effects: []
                },
                {
                    id: 'scene_cta',
                    name: 'CTA',
                    type: 'outro',
                    startFrame: 330,
                    endFrame: 450,
                    duration: 120,
                    elements: [
                        { type: 'text', layer: 1, position: { x: '50%', y: '50%' }, content: 'Link in Bio' }
                    ],
                    animations: [],
                    audio: [],
                    effects: []
                }
            ],
            tags: ['social', 'vertical', 'fast', 'attention', '15s']
        }
    ];

    constructor(memoryCore: MemoryCore) {
        this.memoryCore = memoryCore;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    async initialize(): Promise<void> {
        for (const template of this.PROFESSIONAL_TEMPLATES) {
            const existing = await this.findTemplateByName(template.name!);
            if (!existing) {
                await this.storeTemplate({
                    ...template,
                    id: this.generateId(),
                    successScore: 0.8,
                    usageCount: 0,
                    lastUsed: 0,
                    createdAt: Date.now()
                } as CompositionTemplate);
            }
        }

        console.log('📚 TemplateLibrary initialized');
    }

    // ═══════════════════════════════════════════════════════════════
    // 💾 STORAGE METHODS
    // ═══════════════════════════════════════════════════════════════

    async storeTemplate(template: CompositionTemplate): Promise<string> {
        return this.memoryCore.store('procedural', this.CATEGORY, template, {
            importance: template.successScore > 0.7 ? 'high' : 'medium',
            tags: ['template', 'composition', template.videoType, template.complexity, ...template.tags]
        });
    }

    /**
     * Save a successful composition as template
     */
    async saveAsTemplate(
        composition: {
            name: string;
            description: string;
            videoType: VideoType;
            structure: TemplateStructure;
            scenes: SceneTemplate[];
            sourceFiles?: string[];
        },
        projectId?: string
    ): Promise<string> {
        const complexity = this.determineComplexity(composition.scenes);

        const template: CompositionTemplate = {
            id: this.generateId(),
            name: composition.name,
            description: composition.description,
            videoType: composition.videoType,
            complexity,
            structure: composition.structure,
            scenes: composition.scenes,
            tags: this.extractTags(composition),
            successScore: 0.7,
            usageCount: 0,
            lastUsed: 0,
            createdAt: Date.now(),
            projectId,
            sourceFiles: composition.sourceFiles
        };

        return this.storeTemplate(template);
    }

    /**
     * Update template after successful use
     */
    async recordUsage(templateId: string, feedback?: number): Promise<void> {
        const entry = this.memoryCore.get(templateId);
        if (!entry) return;

        const template = entry.content as CompositionTemplate;
        template.usageCount++;
        template.lastUsed = Date.now();

        if (feedback !== undefined) {
            template.successScore = template.successScore * 0.8 + (feedback / 5) * 0.2;
        }

        await this.memoryCore.update(templateId, template);
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔍 RETRIEVAL METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Recommend templates for a video type
     */
    async recommend(
        criteria: {
            videoType?: VideoType;
            complexity?: TemplateComplexity;
            duration?: number;
            keywords?: string[];
        }
    ): Promise<TemplateRecommendation[]> {
        const entries = this.memoryCore.query({
            category: this.CATEGORY,
            tags: criteria.videoType ? [criteria.videoType] : undefined,
            limit: 20
        });

        const recommendations: TemplateRecommendation[] = [];

        for (const entry of entries) {
            const template = entry.content as CompositionTemplate;
            let confidence = template.successScore;
            const reasons: string[] = [];
            const adaptations: string[] = [];

            // Video type match
            if (criteria.videoType && template.videoType === criteria.videoType) {
                confidence += 0.15;
                reasons.push(`Type: ${criteria.videoType}`);
            }

            // Complexity match
            if (criteria.complexity && template.complexity === criteria.complexity) {
                confidence += 0.1;
                reasons.push(`Complexity: ${criteria.complexity}`);
            } else if (criteria.complexity && template.complexity !== criteria.complexity) {
                adaptations.push(`Adjust complexity from ${template.complexity} to ${criteria.complexity}`);
            }

            // Duration consideration
            if (criteria.duration) {
                const templateDuration = template.structure.totalDuration / template.structure.fps;
                const durationDiff = Math.abs(templateDuration - criteria.duration);
                
                if (durationDiff < 5) {
                    confidence += 0.1;
                    reasons.push('Duration match');
                } else {
                    adaptations.push(`Adjust timing (template: ${templateDuration}s, target: ${criteria.duration}s)`);
                }
            }

            // Keyword match
            if (criteria.keywords && criteria.keywords.length > 0) {
                const matches = criteria.keywords.filter(kw => 
                    template.tags.some(tag => tag.toLowerCase().includes(kw.toLowerCase()))
                );
                if (matches.length > 0) {
                    confidence += 0.1 * (matches.length / criteria.keywords.length);
                    reasons.push(`Keywords: ${matches.join(', ')}`);
                }
            }

            // Usage bonus
            if (template.usageCount > 3) {
                confidence += 0.05;
                reasons.push('Proven');
            }

            recommendations.push({
                template,
                confidence: Math.min(confidence, 1),
                reason: reasons.join(', ') || template.name,
                requiredAdaptations: adaptations
            });
        }

        recommendations.sort((a, b) => b.confidence - a.confidence);
        return recommendations.slice(0, 5);
    }

    /**
     * Find template by name
     */
    async findTemplateByName(name: string): Promise<CompositionTemplate | null> {
        const entries = this.memoryCore.search([name], 5);
        
        for (const entry of entries) {
            if (entry.category === this.CATEGORY) {
                const template = entry.content as CompositionTemplate;
                if (template.name === name) {
                    return template;
                }
            }
        }

        return null;
    }

    /**
     * Get all templates by type
     */
    async getByVideoType(videoType: VideoType): Promise<CompositionTemplate[]> {
        const entries = this.memoryCore.query({
            category: this.CATEGORY,
            tags: [videoType],
            limit: 20
        });

        return entries
            .map(e => e.content as CompositionTemplate)
            .sort((a, b) => b.successScore - a.successScore);
    }

    /**
     * Get top templates overall
     */
    async getTopTemplates(limit: number = 10): Promise<CompositionTemplate[]> {
        const entries = this.memoryCore.query({
            category: this.CATEGORY,
            limit: 50
        });

        return entries
            .map(e => e.content as CompositionTemplate)
            .sort((a, b) => {
                const scoreA = a.successScore * 0.6 + Math.min(a.usageCount / 10, 1) * 0.4;
                const scoreB = b.successScore * 0.6 + Math.min(b.usageCount / 10, 1) * 0.4;
                return scoreB - scoreA;
            })
            .slice(0, limit);
    }

    /**
     * Generate Remotion code from template
     */
    async generateCode(templateId: string): Promise<string | null> {
        const entry = this.memoryCore.get(templateId);
        if (!entry) return null;

        const template = entry.content as CompositionTemplate;
        
        // Generate basic Remotion component structure
        const code = this.generateRemotionComponent(template);
        return code;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    private generateId(): string {
        return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private determineComplexity(scenes: SceneTemplate[]): TemplateComplexity {
        const totalElements = scenes.reduce((sum, s) => sum + s.elements.length, 0);
        const totalAnimations = scenes.reduce((sum, s) => sum + s.animations.length, 0);
        const hasEffects = scenes.some(s => s.effects.length > 0);
        const hasCamera = scenes.some(s => s.camera !== undefined);

        const score = totalElements * 0.5 + totalAnimations * 1 + (hasEffects ? 2 : 0) + (hasCamera ? 1 : 0);

        if (score < 5) return 'simple';
        if (score < 15) return 'medium';
        return 'complex';
    }

    private extractTags(composition: any): string[] {
        const tags: string[] = [composition.videoType];

        // Extract from scene types
        for (const scene of composition.scenes) {
            tags.push(scene.type);
        }

        // Extract from name/description
        const text = `${composition.name} ${composition.description}`.toLowerCase();
        const commonTags = ['modern', 'clean', 'minimal', 'bold', 'tech', 'elegant', 'playful', 'professional'];
        for (const tag of commonTags) {
            if (text.includes(tag)) tags.push(tag);
        }

        return [...new Set(tags)];
    }

    private generateRemotionComponent(template: CompositionTemplate): string {
        const componentName = template.name.replace(/[^a-zA-Z0-9]/g, '');
        
        return `/**
 * ${template.name}
 * ${template.description}
 * Generated from template
 */

import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence, Audio, staticFile } from 'remotion';
import { createSpring, SPRING_PRESETS } from './animations/SpringPhysics';
import { VirtualCamera, createCameraMove } from './camera/VirtualCamera';
import { ColorGrading } from './vfx/ColorGrading';
import { CinematicLens } from './vfx/LensEffects';

export const ${componentName}: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames, width, height } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
            <ColorGrading preset="cinematic_orange_teal" intensity={0.5}>
                <CinematicLens vignette={{ intensity: 0.3 }}>
                    ${template.scenes.map((scene, i) => `
                    {/* ${scene.name} */}
                    <Sequence from={${scene.startFrame}} durationInFrames={${scene.duration}}>
                        {/* Scene ${i + 1} content */}
                    </Sequence>`).join('\n')}
                </CinematicLens>
            </ColorGrading>
            
            {/* Audio layers */}
            {/* Add Audio components here */}
        </AbsoluteFill>
    );
};

// Composition config
export const ${componentName}Config = {
    id: '${componentName}',
    durationInFrames: ${template.structure.totalDuration},
    fps: ${template.structure.fps},
    width: ${template.structure.width},
    height: ${template.structure.height}
};
`;
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 EXPORT
// ═══════════════════════════════════════════════════════════════

export function createTemplateLibrary(memoryCore: MemoryCore): TemplateLibrary {
    return new TemplateLibrary(memoryCore);
}
