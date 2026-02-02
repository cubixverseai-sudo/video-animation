/**
 * 🎬 MOTION MEMORY - Animation Pattern Learning
 * 
 * Learns and remembers successful animation patterns like a professional
 * motion graphics artist:
 * - Animation combinations that work well together
 * - Timing patterns for different scenarios
 * - Easing preferences per context
 * - Camera movement sequences
 * - Transition libraries
 */

import { MemoryCore, MemoryEntry } from '../core/MemoryCore';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export type AnimationType = 
    | 'entrance' | 'exit' | 'transition' | 'emphasis'
    | 'reveal' | 'hide' | 'loop' | 'hover' | 'camera';

export type EasingCategory = 
    | 'smooth' | 'bouncy' | 'snappy' | 'dramatic' 
    | 'elastic' | 'cinematic' | 'natural';

export type SceneType = 
    | 'intro' | 'content' | 'transition' | 'climax' 
    | 'outro' | 'logo' | 'text' | 'product';

export interface AnimationPattern {
    id: string;
    name: string;
    type: AnimationType;
    elements: AnimationElement[];
    timing: TimingConfig;
    easing: EasingConfig;
    camera?: CameraConfig;
    tags: string[];
    successScore: number;       // 0-1, based on feedback
    usageCount: number;
    lastUsed: number;
    createdAt: number;
    projectId?: string;
}

export interface AnimationElement {
    property: 'opacity' | 'scale' | 'x' | 'y' | 'rotation' | 'blur' | 'custom';
    from: number | string;
    to: number | string;
    delay: number;           // frames
    duration: number;        // frames
    easing: string;
}

export interface TimingConfig {
    totalDuration: number;   // frames
    staggerDelay: number;    // frames between elements
    staggerFrom: 'start' | 'center' | 'end' | 'random';
    overlap: number;         // 0-1, how much animations overlap
}

export interface EasingConfig {
    primary: string;
    secondary?: string;
    category: EasingCategory;
}

export interface CameraConfig {
    type: 'dolly' | 'pan' | 'tilt' | 'crane' | 'shake' | 'zoom' | 'orbit';
    intensity: number;
    startFrame: number;
    duration: number;
    easing: string;
}

export interface AnimationRecommendation {
    pattern: AnimationPattern;
    confidence: number;
    reason: string;
    adaptations?: Partial<AnimationPattern>;
}

export interface MotionStats {
    totalPatterns: number;
    byType: Record<AnimationType, number>;
    topEasings: Array<{ easing: string; count: number }>;
    averageSuccessScore: number;
    mostUsedPatterns: AnimationPattern[];
}

// ═══════════════════════════════════════════════════════════════
// 🎬 MOTION MEMORY CLASS
// ═══════════════════════════════════════════════════════════════

export class MotionMemory {
    private memoryCore: MemoryCore;
    private readonly CATEGORY = 'animation_pattern';

    // Pre-built professional patterns
    private readonly PROFESSIONAL_PATTERNS: Partial<AnimationPattern>[] = [
        {
            name: 'Premium Fade In',
            type: 'entrance',
            elements: [
                { property: 'opacity', from: 0, to: 1, delay: 0, duration: 20, easing: 'power2.out' },
                { property: 'y', from: 30, to: 0, delay: 0, duration: 25, easing: 'expo.out' }
            ],
            timing: { totalDuration: 25, staggerDelay: 3, staggerFrom: 'start', overlap: 0.2 },
            easing: { primary: 'expo.out', category: 'cinematic' },
            tags: ['premium', 'fade', 'entrance', 'professional']
        },
        {
            name: 'Logo Reveal',
            type: 'reveal',
            elements: [
                { property: 'scale', from: 0.8, to: 1, delay: 0, duration: 30, easing: 'back.out(1.7)' },
                { property: 'opacity', from: 0, to: 1, delay: 0, duration: 20, easing: 'power2.out' },
                { property: 'blur', from: 10, to: 0, delay: 5, duration: 20, easing: 'power2.out' }
            ],
            timing: { totalDuration: 35, staggerDelay: 0, staggerFrom: 'start', overlap: 0.5 },
            easing: { primary: 'back.out(1.7)', category: 'bouncy' },
            tags: ['logo', 'reveal', 'brand', 'impact']
        },
        {
            name: 'Staggered Text Reveal',
            type: 'entrance',
            elements: [
                { property: 'opacity', from: 0, to: 1, delay: 0, duration: 15, easing: 'power2.out' },
                { property: 'y', from: 40, to: 0, delay: 0, duration: 20, easing: 'expo.out' }
            ],
            timing: { totalDuration: 45, staggerDelay: 4, staggerFrom: 'start', overlap: 0.3 },
            easing: { primary: 'expo.out', category: 'smooth' },
            tags: ['text', 'stagger', 'reveal', 'typography']
        },
        {
            name: 'Dramatic Scale',
            type: 'emphasis',
            elements: [
                { property: 'scale', from: 1, to: 1.2, delay: 0, duration: 10, easing: 'power4.out' },
                { property: 'scale', from: 1.2, to: 1, delay: 10, duration: 15, easing: 'elastic.out(1, 0.5)' }
            ],
            timing: { totalDuration: 25, staggerDelay: 0, staggerFrom: 'start', overlap: 0 },
            easing: { primary: 'power4.out', secondary: 'elastic.out(1, 0.5)', category: 'dramatic' },
            tags: ['scale', 'emphasis', 'impact', 'attention']
        },
        {
            name: 'Smooth Exit',
            type: 'exit',
            elements: [
                { property: 'opacity', from: 1, to: 0, delay: 0, duration: 20, easing: 'power2.in' },
                { property: 'y', from: 0, to: -30, delay: 0, duration: 25, easing: 'power3.in' }
            ],
            timing: { totalDuration: 25, staggerDelay: 2, staggerFrom: 'end', overlap: 0.2 },
            easing: { primary: 'power3.in', category: 'smooth' },
            tags: ['exit', 'fade', 'smooth', 'departure']
        },
        {
            name: 'Cinematic Camera Push',
            type: 'camera',
            elements: [],
            timing: { totalDuration: 60, staggerDelay: 0, staggerFrom: 'start', overlap: 0 },
            easing: { primary: 'power2.inOut', category: 'cinematic' },
            camera: { type: 'dolly', intensity: 0.5, startFrame: 0, duration: 60, easing: 'power2.inOut' },
            tags: ['camera', 'dolly', 'push', 'cinematic']
        },
        {
            name: 'Bouncy Pop In',
            type: 'entrance',
            elements: [
                { property: 'scale', from: 0, to: 1, delay: 0, duration: 30, easing: 'elastic.out(1, 0.5)' },
                { property: 'opacity', from: 0, to: 1, delay: 0, duration: 10, easing: 'power2.out' }
            ],
            timing: { totalDuration: 35, staggerDelay: 5, staggerFrom: 'center', overlap: 0.3 },
            easing: { primary: 'elastic.out(1, 0.5)', category: 'bouncy' },
            tags: ['bounce', 'pop', 'fun', 'playful']
        },
        {
            name: 'Slide From Left',
            type: 'entrance',
            elements: [
                { property: 'x', from: -100, to: 0, delay: 0, duration: 25, easing: 'expo.out' },
                { property: 'opacity', from: 0, to: 1, delay: 0, duration: 15, easing: 'power2.out' }
            ],
            timing: { totalDuration: 25, staggerDelay: 3, staggerFrom: 'start', overlap: 0.2 },
            easing: { primary: 'expo.out', category: 'snappy' },
            tags: ['slide', 'left', 'entrance', 'direction']
        },
        {
            name: 'Impact Shake',
            type: 'emphasis',
            elements: [
                { property: 'x', from: 0, to: 5, delay: 0, duration: 2, easing: 'none' },
                { property: 'x', from: 5, to: -5, delay: 2, duration: 2, easing: 'none' },
                { property: 'x', from: -5, to: 3, delay: 4, duration: 2, easing: 'none' },
                { property: 'x', from: 3, to: 0, delay: 6, duration: 4, easing: 'power2.out' }
            ],
            timing: { totalDuration: 10, staggerDelay: 0, staggerFrom: 'start', overlap: 0 },
            easing: { primary: 'none', category: 'snappy' },
            camera: { type: 'shake', intensity: 0.3, startFrame: 0, duration: 10, easing: 'power2.out' },
            tags: ['shake', 'impact', 'emphasis', 'camera']
        }
    ];

    constructor(memoryCore: MemoryCore) {
        this.memoryCore = memoryCore;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    async initialize(): Promise<void> {
        // Load professional patterns into memory if not already there
        for (const pattern of this.PROFESSIONAL_PATTERNS) {
            const existing = await this.findPatternByName(pattern.name!);
            if (!existing) {
                await this.storePattern({
                    ...pattern,
                    id: this.generateId(),
                    successScore: 0.8, // Pre-built patterns start with good score
                    usageCount: 0,
                    lastUsed: 0,
                    createdAt: Date.now()
                } as AnimationPattern);
            }
        }

        console.log('🎬 MotionMemory initialized');
    }

    // ═══════════════════════════════════════════════════════════════
    // 💾 PATTERN STORAGE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Store a new animation pattern
     */
    async storePattern(pattern: AnimationPattern): Promise<string> {
        const id = await this.memoryCore.store('procedural', this.CATEGORY, pattern, {
            importance: pattern.successScore > 0.7 ? 'high' : 'medium',
            tags: ['animation', 'pattern', pattern.type, ...pattern.tags]
        });

        return id;
    }

    /**
     * Learn from a successful animation
     */
    async learnFromSuccess(
        animation: {
            type: AnimationType;
            elements: AnimationElement[];
            timing: TimingConfig;
            easing: EasingConfig;
            camera?: CameraConfig;
        },
        context: {
            sceneType: SceneType;
            projectId?: string;
            feedback?: number; // 1-5 rating
        }
    ): Promise<string> {
        const successScore = context.feedback ? context.feedback / 5 : 0.7;

        const pattern: AnimationPattern = {
            id: this.generateId(),
            name: `Learned ${animation.type} - ${context.sceneType}`,
            type: animation.type,
            elements: animation.elements,
            timing: animation.timing,
            easing: animation.easing,
            camera: animation.camera,
            tags: [animation.type, context.sceneType, 'learned', 'user_created'],
            successScore,
            usageCount: 1,
            lastUsed: Date.now(),
            createdAt: Date.now(),
            projectId: context.projectId
        };

        return this.storePattern(pattern);
    }

    /**
     * Update pattern after use
     */
    async recordUsage(patternId: string, success: boolean, feedback?: number): Promise<void> {
        const entry = this.memoryCore.get(patternId);
        if (!entry) return;

        const pattern = entry.content as AnimationPattern;
        pattern.usageCount++;
        pattern.lastUsed = Date.now();

        // Update success score with exponential moving average
        if (feedback !== undefined) {
            const newScore = feedback / 5;
            pattern.successScore = pattern.successScore * 0.7 + newScore * 0.3;
        } else if (success) {
            pattern.successScore = Math.min(1, pattern.successScore * 1.05);
        } else {
            pattern.successScore = Math.max(0, pattern.successScore * 0.95);
        }

        await this.memoryCore.update(patternId, pattern);
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔍 PATTERN RETRIEVAL
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get recommended pattern for a scenario
     */
    async recommend(
        scenario: {
            animationType: AnimationType;
            sceneType?: SceneType;
            mood?: 'energetic' | 'calm' | 'dramatic' | 'playful' | 'professional';
            preferredEasing?: EasingCategory;
        }
    ): Promise<AnimationRecommendation[]> {
        const patterns = await this.getPatternsByType(scenario.animationType);
        const recommendations: AnimationRecommendation[] = [];

        for (const pattern of patterns) {
            let confidence = pattern.successScore;
            const reasons: string[] = [];

            // Boost for matching scene type
            if (scenario.sceneType && pattern.tags.includes(scenario.sceneType)) {
                confidence += 0.15;
                reasons.push(`Matches scene: ${scenario.sceneType}`);
            }

            // Boost for matching mood
            if (scenario.mood) {
                const moodMatch = this.moodMatchesEasing(scenario.mood, pattern.easing.category);
                if (moodMatch) {
                    confidence += 0.1;
                    reasons.push(`Mood match: ${scenario.mood}`);
                }
            }

            // Boost for preferred easing
            if (scenario.preferredEasing && pattern.easing.category === scenario.preferredEasing) {
                confidence += 0.1;
                reasons.push(`Preferred easing: ${scenario.preferredEasing}`);
            }

            // Boost for frequently used
            if (pattern.usageCount > 5) {
                confidence += 0.05;
                reasons.push('Frequently used');
            }

            // Boost for recently used (still relevant)
            const daysSinceUse = (Date.now() - pattern.lastUsed) / (1000 * 60 * 60 * 24);
            if (daysSinceUse < 7) {
                confidence += 0.05;
                reasons.push('Recently used');
            }

            reasons.push(`Success rate: ${Math.round(pattern.successScore * 100)}%`);

            recommendations.push({
                pattern,
                confidence: Math.min(confidence, 1),
                reason: reasons.join(', ')
            });
        }

        // Sort by confidence
        recommendations.sort((a, b) => b.confidence - a.confidence);

        return recommendations.slice(0, 5);
    }

    /**
     * Get patterns by type
     */
    async getPatternsByType(type: AnimationType): Promise<AnimationPattern[]> {
        const entries = this.memoryCore.query({
            category: this.CATEGORY,
            tags: [type],
            limit: 50
        });

        return entries.map(e => e.content as AnimationPattern);
    }

    /**
     * Find pattern by name
     */
    async findPatternByName(name: string): Promise<AnimationPattern | null> {
        const entries = this.memoryCore.search([name], 5);
        
        for (const entry of entries) {
            if (entry.category === this.CATEGORY) {
                const pattern = entry.content as AnimationPattern;
                if (pattern.name === name) {
                    return pattern;
                }
            }
        }

        return null;
    }

    /**
     * Get best patterns overall
     */
    async getTopPatterns(limit: number = 10): Promise<AnimationPattern[]> {
        const entries = this.memoryCore.query({
            category: this.CATEGORY,
            limit: 100
        });

        const patterns = entries.map(e => e.content as AnimationPattern);
        
        // Sort by combined score (success + usage)
        patterns.sort((a, b) => {
            const scoreA = a.successScore * 0.7 + Math.min(a.usageCount / 20, 1) * 0.3;
            const scoreB = b.successScore * 0.7 + Math.min(b.usageCount / 20, 1) * 0.3;
            return scoreB - scoreA;
        });

        return patterns.slice(0, limit);
    }

    /**
     * Get patterns for a specific easing category
     */
    async getPatternsByEasing(category: EasingCategory): Promise<AnimationPattern[]> {
        const entries = this.memoryCore.query({
            category: this.CATEGORY,
            limit: 100
        });

        return entries
            .map(e => e.content as AnimationPattern)
            .filter(p => p.easing.category === category);
    }

    // ═══════════════════════════════════════════════════════════════
    // 📊 STATISTICS & ANALYSIS
    // ═══════════════════════════════════════════════════════════════

    async getStats(): Promise<MotionStats> {
        const entries = this.memoryCore.query({
            category: this.CATEGORY,
            limit: 500
        });

        const patterns = entries.map(e => e.content as AnimationPattern);
        
        const byType: Record<AnimationType, number> = {
            entrance: 0, exit: 0, transition: 0, emphasis: 0,
            reveal: 0, hide: 0, loop: 0, hover: 0, camera: 0
        };

        const easingCounts = new Map<string, number>();
        let totalSuccessScore = 0;

        for (const pattern of patterns) {
            byType[pattern.type]++;
            
            const easing = pattern.easing.primary;
            easingCounts.set(easing, (easingCounts.get(easing) || 0) + 1);
            
            totalSuccessScore += pattern.successScore;
        }

        const topEasings = Array.from(easingCounts.entries())
            .map(([easing, count]) => ({ easing, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const mostUsedPatterns = patterns
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 5);

        return {
            totalPatterns: patterns.length,
            byType,
            topEasings,
            averageSuccessScore: patterns.length > 0 ? totalSuccessScore / patterns.length : 0,
            mostUsedPatterns
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    private generateId(): string {
        return `motion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private moodMatchesEasing(mood: string, category: EasingCategory): boolean {
        const moodEasingMap: Record<string, EasingCategory[]> = {
            energetic: ['bouncy', 'snappy', 'elastic'],
            calm: ['smooth', 'natural', 'cinematic'],
            dramatic: ['dramatic', 'cinematic'],
            playful: ['bouncy', 'elastic', 'snappy'],
            professional: ['smooth', 'cinematic', 'natural']
        };

        return moodEasingMap[mood]?.includes(category) || false;
    }

    /**
     * Generate GSAP code from pattern
     */
    generateGSAPCode(pattern: AnimationPattern, target: string): string {
        const lines: string[] = [];
        lines.push(`// ${pattern.name}`);
        lines.push(`const tl = gsap.timeline();`);

        for (let i = 0; i < pattern.elements.length; i++) {
            const el = pattern.elements[i];
            const position = i === 0 ? '' : `"<${el.delay > 0 ? '+=' + (el.delay / 30) : ''}"`;
            
            lines.push(`tl.fromTo("${target}",`);
            lines.push(`  { ${el.property}: ${JSON.stringify(el.from)} },`);
            lines.push(`  { ${el.property}: ${JSON.stringify(el.to)}, duration: ${el.duration / 30}, ease: "${el.easing}" }${position ? ', ' + position : ''}`);
            lines.push(`);`);
        }

        return lines.join('\n');
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 EXPORT
// ═══════════════════════════════════════════════════════════════

export function createMotionMemory(memoryCore: MemoryCore): MotionMemory {
    return new MotionMemory(memoryCore);
}
