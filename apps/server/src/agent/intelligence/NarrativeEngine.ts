/**
 * 📖 NARRATIVE ENGINE
 * Story structure and emotional pacing for video content
 * Creates optimal narrative arcs for different video types
 */

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export type VideoType = 'ad' | 'explainer' | 'brand' | 'promo' | 'social' | 'trailer' | 'intro';

export type SceneType = 
    | 'hook'           // Attention grabber
    | 'intro'          // Brand/context introduction
    | 'problem'        // Problem statement
    | 'solution'       // Solution presentation
    | 'features'       // Feature showcase
    | 'benefits'       // Benefit highlights
    | 'social_proof'   // Testimonials/stats
    | 'climax'         // Dramatic peak
    | 'cta'            // Call to action
    | 'outro'          // Brand resolve/logo
    | 'transition'     // Scene transition
    | 'content'        // Main content
    | 'reveal';        // Big reveal moment

export type EmotionalState = 
    | 'neutral'
    | 'curious'
    | 'excited'
    | 'trust'
    | 'desire'
    | 'urgency'
    | 'satisfaction';

export interface Scene {
    id: string;
    type: SceneType;
    name: string;
    description: string;
    startFrame: number;
    endFrame: number;
    duration: number; // frames
    emotionalTarget: EmotionalState;
    energyLevel: number; // 0-1
    audioMood: string;
    suggestedElements: string[];
    transitionIn?: string;
    transitionOut?: string;
}

export interface NarrativeStructure {
    videoType: VideoType;
    totalDuration: number; // frames
    fps: number;
    scenes: Scene[];
    emotionalCurve: EmotionalCurvePoint[];
    keyMoments: {
        hook: number;      // frame
        climax: number;    // frame
        resolution: number; // frame
    };
}

export interface EmotionalCurvePoint {
    frame: number;
    intensity: number; // 0-1
    emotion: EmotionalState;
}

export type PacingStyle = 'build_release' | 'constant_energy' | 'dramatic_arc' | 'pulse';

// ═══════════════════════════════════════════════════════════════
// 🎬 NARRATIVE TEMPLATES
// ═══════════════════════════════════════════════════════════════

interface NarrativeTemplate {
    name: string;
    description: string;
    scenes: Array<{
        type: SceneType;
        name: string;
        durationPercent: number;
        emotionalTarget: EmotionalState;
        energyLevel: number;
        audioMood: string;
        suggestedElements: string[];
    }>;
}

const NARRATIVE_TEMPLATES: Record<VideoType, NarrativeTemplate> = {
    ad: {
        name: 'Advertisement',
        description: 'Hook → Problem → Solution → CTA',
        scenes: [
            { 
                type: 'hook', 
                name: 'Attention Hook', 
                durationPercent: 0.15,
                emotionalTarget: 'curious',
                energyLevel: 0.8,
                audioMood: 'energetic',
                suggestedElements: ['Bold text', 'Quick cuts', 'Striking visual']
            },
            { 
                type: 'problem', 
                name: 'Problem Statement', 
                durationPercent: 0.20,
                emotionalTarget: 'curious',
                energyLevel: 0.5,
                audioMood: 'tense',
                suggestedElements: ['Relatable scenario', 'Pain points']
            },
            { 
                type: 'solution', 
                name: 'Solution Reveal', 
                durationPercent: 0.30,
                emotionalTarget: 'excited',
                energyLevel: 0.9,
                audioMood: 'uplifting',
                suggestedElements: ['Product showcase', 'Key features']
            },
            { 
                type: 'benefits', 
                name: 'Benefits', 
                durationPercent: 0.20,
                emotionalTarget: 'desire',
                energyLevel: 0.7,
                audioMood: 'inspiring',
                suggestedElements: ['Benefit icons', 'Statistics']
            },
            { 
                type: 'cta', 
                name: 'Call to Action', 
                durationPercent: 0.15,
                emotionalTarget: 'urgency',
                energyLevel: 0.8,
                audioMood: 'powerful',
                suggestedElements: ['CTA button', 'Logo', 'Contact info']
            }
        ]
    },

    explainer: {
        name: 'Explainer Video',
        description: 'Problem → How It Works → Benefits → CTA',
        scenes: [
            {
                type: 'hook',
                name: 'Introduction',
                durationPercent: 0.10,
                emotionalTarget: 'curious',
                energyLevel: 0.6,
                audioMood: 'friendly',
                suggestedElements: ['Question', 'Relatable situation']
            },
            {
                type: 'problem',
                name: 'The Challenge',
                durationPercent: 0.15,
                emotionalTarget: 'curious',
                energyLevel: 0.4,
                audioMood: 'thoughtful',
                suggestedElements: ['Problem visualization', 'Statistics']
            },
            {
                type: 'solution',
                name: 'How It Works',
                durationPercent: 0.40,
                emotionalTarget: 'trust',
                energyLevel: 0.6,
                audioMood: 'educational',
                suggestedElements: ['Step-by-step', 'Diagrams', 'Icons']
            },
            {
                type: 'benefits',
                name: 'Key Benefits',
                durationPercent: 0.20,
                emotionalTarget: 'desire',
                energyLevel: 0.7,
                audioMood: 'uplifting',
                suggestedElements: ['Benefit list', 'Before/After']
            },
            {
                type: 'cta',
                name: 'Get Started',
                durationPercent: 0.15,
                emotionalTarget: 'satisfaction',
                energyLevel: 0.5,
                audioMood: 'confident',
                suggestedElements: ['CTA', 'Website', 'Logo']
            }
        ]
    },

    brand: {
        name: 'Brand Video',
        description: 'Logo Intro → Story → Values → Logo Outro',
        scenes: [
            {
                type: 'intro',
                name: 'Logo Reveal',
                durationPercent: 0.20,
                emotionalTarget: 'curious',
                energyLevel: 0.7,
                audioMood: 'cinematic',
                suggestedElements: ['Animated logo', 'Tagline']
            },
            {
                type: 'content',
                name: 'Brand Story',
                durationPercent: 0.40,
                emotionalTarget: 'trust',
                energyLevel: 0.5,
                audioMood: 'inspiring',
                suggestedElements: ['Brand values', 'Mission statement', 'Visuals']
            },
            {
                type: 'climax',
                name: 'Brand Promise',
                durationPercent: 0.25,
                emotionalTarget: 'desire',
                energyLevel: 0.8,
                audioMood: 'powerful',
                suggestedElements: ['Key message', 'Emotional appeal']
            },
            {
                type: 'outro',
                name: 'Logo Resolve',
                durationPercent: 0.15,
                emotionalTarget: 'satisfaction',
                energyLevel: 0.4,
                audioMood: 'elegant',
                suggestedElements: ['Logo', 'Tagline', 'Website']
            }
        ]
    },

    promo: {
        name: 'Promotional Video',
        description: 'Teaser → Features → Offer → CTA',
        scenes: [
            {
                type: 'hook',
                name: 'Teaser',
                durationPercent: 0.15,
                emotionalTarget: 'excited',
                energyLevel: 0.9,
                audioMood: 'energetic',
                suggestedElements: ['Bold announcement', 'Dynamic text']
            },
            {
                type: 'features',
                name: 'Feature Showcase',
                durationPercent: 0.35,
                emotionalTarget: 'desire',
                energyLevel: 0.7,
                audioMood: 'upbeat',
                suggestedElements: ['Product shots', 'Feature highlights']
            },
            {
                type: 'social_proof',
                name: 'Social Proof',
                durationPercent: 0.20,
                emotionalTarget: 'trust',
                energyLevel: 0.6,
                audioMood: 'confident',
                suggestedElements: ['Reviews', 'Testimonials', 'Stats']
            },
            {
                type: 'cta',
                name: 'Limited Offer',
                durationPercent: 0.30,
                emotionalTarget: 'urgency',
                energyLevel: 0.85,
                audioMood: 'urgent',
                suggestedElements: ['Offer details', 'Countdown', 'CTA button']
            }
        ]
    },

    social: {
        name: 'Social Media Video',
        description: 'Hook → Quick Value → CTA',
        scenes: [
            {
                type: 'hook',
                name: 'Scroll-Stopper',
                durationPercent: 0.20,
                emotionalTarget: 'curious',
                energyLevel: 0.9,
                audioMood: 'catchy',
                suggestedElements: ['Bold statement', 'Eye-catching visual']
            },
            {
                type: 'content',
                name: 'Quick Value',
                durationPercent: 0.50,
                emotionalTarget: 'excited',
                energyLevel: 0.7,
                audioMood: 'trendy',
                suggestedElements: ['Key points', 'Fast pacing', 'Captions']
            },
            {
                type: 'cta',
                name: 'Engage',
                durationPercent: 0.30,
                emotionalTarget: 'desire',
                energyLevel: 0.8,
                audioMood: 'fun',
                suggestedElements: ['Follow CTA', 'Hashtag', 'Link']
            }
        ]
    },

    trailer: {
        name: 'Trailer/Teaser',
        description: 'Dramatic Build → Climax → Date/Logo',
        scenes: [
            {
                type: 'intro',
                name: 'Atmospheric Open',
                durationPercent: 0.20,
                emotionalTarget: 'curious',
                energyLevel: 0.3,
                audioMood: 'mysterious',
                suggestedElements: ['Ambient visuals', 'Subtle movement']
            },
            {
                type: 'content',
                name: 'Build Up',
                durationPercent: 0.35,
                emotionalTarget: 'excited',
                energyLevel: 0.6,
                audioMood: 'building',
                suggestedElements: ['Quick cuts', 'Teasers', 'Action hints']
            },
            {
                type: 'climax',
                name: 'Climax',
                durationPercent: 0.25,
                emotionalTarget: 'excited',
                energyLevel: 1.0,
                audioMood: 'epic',
                suggestedElements: ['Best shots', 'Impact moments']
            },
            {
                type: 'reveal',
                name: 'Title/Date Reveal',
                durationPercent: 0.20,
                emotionalTarget: 'desire',
                energyLevel: 0.5,
                audioMood: 'resolving',
                suggestedElements: ['Title card', 'Release date', 'Logo']
            }
        ]
    },

    intro: {
        name: 'Intro/Outro',
        description: 'Logo Animation',
        scenes: [
            {
                type: 'intro',
                name: 'Logo Build',
                durationPercent: 0.60,
                emotionalTarget: 'curious',
                energyLevel: 0.7,
                audioMood: 'signature',
                suggestedElements: ['Logo elements', 'Brand colors', 'Movement']
            },
            {
                type: 'reveal',
                name: 'Logo Reveal',
                durationPercent: 0.25,
                emotionalTarget: 'satisfaction',
                energyLevel: 0.9,
                audioMood: 'impact',
                suggestedElements: ['Full logo', 'Tagline']
            },
            {
                type: 'outro',
                name: 'Settle',
                durationPercent: 0.15,
                emotionalTarget: 'trust',
                energyLevel: 0.3,
                audioMood: 'calm',
                suggestedElements: ['Hold on logo']
            }
        ]
    }
};

// ═══════════════════════════════════════════════════════════════
// 🧠 NARRATIVE ENGINE CLASS
// ═══════════════════════════════════════════════════════════════

export class NarrativeEngine {
    private fps: number;

    constructor(fps: number = 30) {
        this.fps = fps;
    }

    /**
     * Generate narrative structure for a video
     */
    generateStructure(
        videoType: VideoType,
        durationSeconds: number,
        keyMessage?: string
    ): NarrativeStructure {
        const template = NARRATIVE_TEMPLATES[videoType];
        const totalFrames = Math.round(durationSeconds * this.fps);

        // Generate scenes based on template
        let currentFrame = 0;
        const scenes: Scene[] = template.scenes.map((sceneTemplate, index) => {
            const duration = Math.round(totalFrames * sceneTemplate.durationPercent);
            const startFrame = currentFrame;
            const endFrame = startFrame + duration;
            currentFrame = endFrame;

            return {
                id: `scene_${index + 1}`,
                type: sceneTemplate.type,
                name: sceneTemplate.name,
                description: `${sceneTemplate.name} - ${sceneTemplate.suggestedElements.join(', ')}`,
                startFrame,
                endFrame,
                duration,
                emotionalTarget: sceneTemplate.emotionalTarget,
                energyLevel: sceneTemplate.energyLevel,
                audioMood: sceneTemplate.audioMood,
                suggestedElements: sceneTemplate.suggestedElements,
                transitionIn: index === 0 ? 'fade' : 'cut',
                transitionOut: index === template.scenes.length - 1 ? 'fade' : 'cut'
            };
        });

        // Generate emotional curve
        const emotionalCurve = this.generateEmotionalCurve(scenes, totalFrames);

        // Find key moments
        const keyMoments = {
            hook: scenes[0]?.startFrame || 0,
            climax: scenes.find(s => s.type === 'climax' || s.type === 'reveal')?.startFrame || Math.round(totalFrames * 0.7),
            resolution: scenes[scenes.length - 1]?.startFrame || totalFrames - this.fps
        };

        return {
            videoType,
            totalDuration: totalFrames,
            fps: this.fps,
            scenes,
            emotionalCurve,
            keyMoments
        };
    }

    /**
     * Generate emotional curve from scenes
     */
    private generateEmotionalCurve(scenes: Scene[], totalFrames: number): EmotionalCurvePoint[] {
        const points: EmotionalCurvePoint[] = [];
        const resolution = Math.max(10, Math.floor(totalFrames / 20)); // ~20 points

        for (let frame = 0; frame <= totalFrames; frame += resolution) {
            const currentScene = scenes.find(s => frame >= s.startFrame && frame < s.endFrame);
            
            points.push({
                frame,
                intensity: currentScene?.energyLevel || 0.5,
                emotion: currentScene?.emotionalTarget || 'neutral'
            });
        }

        return points;
    }

    /**
     * Calculate emotional curve for pacing
     */
    calculateEmotionalCurve(
        durationSeconds: number,
        style: PacingStyle = 'build_release'
    ): EmotionalCurvePoint[] {
        const totalFrames = Math.round(durationSeconds * this.fps);
        const points: EmotionalCurvePoint[] = [];
        const resolution = Math.max(5, Math.floor(totalFrames / 30));

        for (let frame = 0; frame <= totalFrames; frame += resolution) {
            const progress = frame / totalFrames;
            let intensity: number;
            let emotion: EmotionalState;

            switch (style) {
                case 'build_release':
                    // Gradual build to climax at 75%, then resolve
                    if (progress < 0.75) {
                        intensity = 0.3 + progress * 0.8;
                    } else {
                        intensity = 0.9 - (progress - 0.75) * 1.5;
                    }
                    emotion = progress < 0.5 ? 'curious' : progress < 0.75 ? 'excited' : 'satisfaction';
                    break;

                case 'constant_energy':
                    // Maintain consistent energy with slight variation
                    intensity = 0.6 + Math.sin(progress * Math.PI * 4) * 0.15;
                    emotion = 'excited';
                    break;

                case 'dramatic_arc':
                    // Slow build, dramatic peak, quick resolve
                    if (progress < 0.6) {
                        intensity = 0.2 + Math.pow(progress / 0.6, 2) * 0.6;
                    } else if (progress < 0.8) {
                        intensity = 0.8 + (progress - 0.6) * 1;
                    } else {
                        intensity = 1 - (progress - 0.8) * 4;
                    }
                    emotion = progress < 0.6 ? 'curious' : progress < 0.85 ? 'excited' : 'satisfaction';
                    break;

                case 'pulse':
                    // Rhythmic energy pulses
                    intensity = 0.4 + Math.abs(Math.sin(progress * Math.PI * 6)) * 0.5;
                    emotion = Math.sin(progress * Math.PI * 6) > 0 ? 'excited' : 'curious';
                    break;

                default:
                    intensity = 0.5;
                    emotion = 'neutral';
            }

            points.push({
                frame,
                intensity: Math.max(0, Math.min(1, intensity)),
                emotion
            });
        }

        return points;
    }

    /**
     * Get scene suggestions for a specific type
     */
    getSceneSuggestions(videoType: VideoType): NarrativeTemplate {
        return NARRATIVE_TEMPLATES[videoType];
    }

    /**
     * Get all available video types
     */
    static getVideoTypes(): VideoType[] {
        return Object.keys(NARRATIVE_TEMPLATES) as VideoType[];
    }

    /**
     * Get timing recommendations
     */
    getTimingRecommendations(videoType: VideoType): {
        idealDuration: { min: number; max: number };
        sceneDurations: Record<string, number>;
    } {
        const recommendations: Record<VideoType, { min: number; max: number }> = {
            ad: { min: 15, max: 60 },
            explainer: { min: 60, max: 180 },
            brand: { min: 30, max: 120 },
            promo: { min: 15, max: 45 },
            social: { min: 6, max: 30 },
            trailer: { min: 30, max: 120 },
            intro: { min: 3, max: 10 }
        };

        const template = NARRATIVE_TEMPLATES[videoType];
        const idealAvg = (recommendations[videoType].min + recommendations[videoType].max) / 2;
        
        const sceneDurations: Record<string, number> = {};
        template.scenes.forEach(scene => {
            sceneDurations[scene.name] = Math.round(idealAvg * scene.durationPercent);
        });

        return {
            idealDuration: recommendations[videoType],
            sceneDurations
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════

export function createNarrativeEngine(fps: number = 30): NarrativeEngine {
    return new NarrativeEngine(fps);
}

export const VIDEO_TYPES = Object.keys(NARRATIVE_TEMPLATES) as VideoType[];

export default NarrativeEngine;
