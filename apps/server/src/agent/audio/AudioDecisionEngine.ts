/**
 * 🎵 AUDIO DECISION ENGINE
 * Intelligent system for analyzing video context and deciding audio requirements
 */

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export type AudioType = 'bgm' | 'sfx' | 'ambience';

export type AudioMood = 
    | 'epic' | 'cinematic' | 'dramatic' | 'intense'
    | 'calm' | 'peaceful' | 'relaxing' | 'ambient'
    | 'tech' | 'futuristic' | 'digital' | 'cyber'
    | 'playful' | 'fun' | 'upbeat' | 'energetic'
    | 'corporate' | 'professional' | 'business'
    | 'emotional' | 'inspiring' | 'motivational'
    | 'dark' | 'mysterious' | 'suspense' | 'horror'
    | 'luxury' | 'elegant' | 'sophisticated';

export type SFXCategory = 
    | 'whoosh' | 'impact' | 'transition' | 'reveal'
    | 'click' | 'pop' | 'glitch' | 'notification'
    | 'rise' | 'fall' | 'sweep' | 'swipe'
    | 'explosion' | 'magic' | 'electric' | 'mechanical';

export interface AudioRequirement {
    id: string;
    type: AudioType;
    mood: AudioMood;
    category?: SFXCategory;
    timing: number;      // frame number to start
    duration: number;    // duration in frames
    keywords: string[];  // search keywords for fetching
    priority: number;    // 1-10, higher = more important
    volume: number;      // 0-1
    fadeIn?: number;     // frames to fade in
    fadeOut?: number;    // frames to fade out
    duck?: boolean;      // should duck other audio when playing
}

export interface SceneAnalysis {
    sceneType: 'intro' | 'content' | 'transition' | 'climax' | 'outro';
    mood: AudioMood;
    energy: number;      // 0-10
    hasText: boolean;
    hasLogo: boolean;
    suggestedBGM: string[];
    suggestedSFX: SFXCategory[];
}

export interface AudioPlan {
    projectId: string;
    totalDuration: number;
    fps: number;
    bgm: AudioRequirement[];
    sfx: AudioRequirement[];
    ambience: AudioRequirement[];
    duckingRules: DuckingRule[];
}

export interface DuckingRule {
    triggerType: 'sfx' | 'text' | 'climax';
    targetType: 'bgm' | 'ambience';
    duckTo: number;      // volume to duck to (0-1)
    attackTime: number;  // frames to reach ducked volume
    releaseTime: number; // frames to return to normal
}

// ═══════════════════════════════════════════════════════════════
// 🎨 MOOD TO KEYWORDS MAPPING
// ═══════════════════════════════════════════════════════════════

const MOOD_KEYWORDS: Record<AudioMood, string[]> = {
    epic: ['epic', 'cinematic', 'orchestra', 'trailer', 'powerful'],
    cinematic: ['cinematic', 'film', 'movie', 'score', 'dramatic'],
    dramatic: ['dramatic', 'tension', 'intense', 'emotional'],
    intense: ['intense', 'action', 'aggressive', 'powerful', 'energy'],
    calm: ['calm', 'peaceful', 'soft', 'gentle', 'quiet'],
    peaceful: ['peaceful', 'serene', 'tranquil', 'nature'],
    relaxing: ['relaxing', 'chill', 'lounge', 'smooth'],
    ambient: ['ambient', 'atmospheric', 'background', 'drone'],
    tech: ['tech', 'technology', 'digital', 'electronic', 'modern'],
    futuristic: ['futuristic', 'sci-fi', 'space', 'cyber'],
    digital: ['digital', 'electronic', 'synth', 'computer'],
    cyber: ['cyberpunk', 'neon', 'synth', 'retro'],
    playful: ['playful', 'fun', 'happy', 'cheerful', 'light'],
    fun: ['fun', 'upbeat', 'positive', 'joyful'],
    upbeat: ['upbeat', 'energetic', 'dynamic', 'lively'],
    energetic: ['energetic', 'high energy', 'fast', 'pumping'],
    corporate: ['corporate', 'business', 'professional', 'commercial'],
    professional: ['professional', 'clean', 'modern', 'corporate'],
    business: ['business', 'presentation', 'success', 'achievement'],
    emotional: ['emotional', 'touching', 'heartfelt', 'moving'],
    inspiring: ['inspiring', 'inspirational', 'uplifting', 'motivational'],
    motivational: ['motivational', 'triumph', 'victory', 'success'],
    dark: ['dark', 'ominous', 'sinister', 'evil'],
    mysterious: ['mysterious', 'mystery', 'suspense', 'intrigue'],
    suspense: ['suspense', 'thriller', 'tension', 'anticipation'],
    horror: ['horror', 'scary', 'creepy', 'fear'],
    luxury: ['luxury', 'elegant', 'premium', 'high-end'],
    elegant: ['elegant', 'sophisticated', 'classy', 'refined'],
    sophisticated: ['sophisticated', 'jazzy', 'smooth', 'lounge']
};

const SFX_KEYWORDS: Record<SFXCategory, string[]> = {
    whoosh: ['whoosh', 'swoosh', 'swish', 'air', 'wind'],
    impact: ['impact', 'hit', 'punch', 'boom', 'thud'],
    transition: ['transition', 'sweep', 'pass', 'movement'],
    reveal: ['reveal', 'shine', 'sparkle', 'magic', 'appear'],
    click: ['click', 'button', 'tap', 'interface'],
    pop: ['pop', 'bubble', 'plop', 'notification'],
    glitch: ['glitch', 'digital', 'error', 'distortion', 'static'],
    notification: ['notification', 'alert', 'ding', 'chime'],
    rise: ['rise', 'riser', 'tension', 'build', 'anticipation'],
    fall: ['fall', 'drop', 'descend', 'down'],
    sweep: ['sweep', 'scan', 'radar', 'pass'],
    swipe: ['swipe', 'slide', 'move', 'gesture'],
    explosion: ['explosion', 'blast', 'bang', 'burst'],
    magic: ['magic', 'spell', 'enchant', 'mystical', 'shimmer'],
    electric: ['electric', 'spark', 'zap', 'shock', 'power'],
    mechanical: ['mechanical', 'machine', 'robot', 'servo', 'gear']
};

// ═══════════════════════════════════════════════════════════════
// 🧠 AUDIO DECISION ENGINE CLASS
// ═══════════════════════════════════════════════════════════════

export class AudioDecisionEngine {
    private projectId: string;
    private fps: number;
    private totalFrames: number;

    constructor(projectId: string, fps: number = 30, totalFrames: number = 300) {
        this.projectId = projectId;
        this.fps = fps;
        this.totalFrames = totalFrames;
    }

    /**
     * Analyze a text prompt and extract mood/style requirements
     */
    analyzePrompt(prompt: string): { mood: AudioMood; energy: number; suggestedSFX: SFXCategory[] } {
        const promptLower = prompt.toLowerCase();
        
        // Detect mood from keywords
        let detectedMood: AudioMood = 'tech'; // default
        let maxScore = 0;

        for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
            const score = keywords.filter(kw => promptLower.includes(kw)).length;
            if (score > maxScore) {
                maxScore = score;
                detectedMood = mood as AudioMood;
            }
        }

        // Detect energy level (0-10)
        let energy = 5;
        if (promptLower.includes('fast') || promptLower.includes('quick') || promptLower.includes('energetic')) energy = 8;
        if (promptLower.includes('slow') || promptLower.includes('calm') || promptLower.includes('peaceful')) energy = 3;
        if (promptLower.includes('epic') || promptLower.includes('powerful') || promptLower.includes('intense')) energy = 9;
        if (promptLower.includes('minimal') || promptLower.includes('simple') || promptLower.includes('clean')) energy = 4;

        // Suggest SFX categories based on prompt
        const suggestedSFX: SFXCategory[] = [];
        if (promptLower.includes('logo') || promptLower.includes('reveal')) suggestedSFX.push('reveal', 'impact');
        if (promptLower.includes('transition') || promptLower.includes('slide')) suggestedSFX.push('whoosh', 'transition');
        if (promptLower.includes('tech') || promptLower.includes('digital')) suggestedSFX.push('glitch', 'electric');
        if (promptLower.includes('button') || promptLower.includes('click')) suggestedSFX.push('click', 'pop');
        if (promptLower.includes('magic') || promptLower.includes('sparkle')) suggestedSFX.push('magic', 'reveal');

        // Default SFX if none detected
        if (suggestedSFX.length === 0) {
            suggestedSFX.push('whoosh', 'impact');
        }

        return { mood: detectedMood, energy, suggestedSFX };
    }

    /**
     * Generate a complete audio plan for a video
     */
    generateAudioPlan(
        prompt: string,
        scenes: Array<{ startFrame: number; endFrame: number; type: string; hasText?: boolean }>
    ): AudioPlan {
        const analysis = this.analyzePrompt(prompt);
        const plan: AudioPlan = {
            projectId: this.projectId,
            totalDuration: this.totalFrames,
            fps: this.fps,
            bgm: [],
            sfx: [],
            ambience: [],
            duckingRules: []
        };

        // 1. Add Background Music (full duration)
        plan.bgm.push(this.createBGMRequirement(analysis.mood, analysis.energy));

        // 2. Add Ambience if mood requires it
        if (['ambient', 'tech', 'futuristic', 'cyber', 'mysterious'].includes(analysis.mood)) {
            plan.ambience.push(this.createAmbienceRequirement(analysis.mood));
        }

        // 3. Generate SFX for each scene transition
        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            
            // Transition whoosh at scene start (except first scene)
            if (i > 0) {
                plan.sfx.push(this.createSFXRequirement(
                    'whoosh',
                    scene.startFrame - 5, // Start slightly before scene
                    15, // Short duration
                    7   // Medium-high priority
                ));
            }

            // Impact at scene reveal points
            if (scene.type === 'reveal' || scene.type === 'climax') {
                plan.sfx.push(this.createSFXRequirement(
                    'impact',
                    scene.startFrame + 10,
                    20,
                    8
                ));
            }

            // Text reveal sound
            if (scene.hasText) {
                plan.sfx.push(this.createSFXRequirement(
                    'reveal',
                    scene.startFrame + 5,
                    15,
                    6
                ));
            }
        }

        // 4. Add intro riser
        if (this.totalFrames > 90) { // Only if video is long enough
            plan.sfx.push({
                id: `sfx_riser_intro`,
                type: 'sfx',
                mood: analysis.mood,
                category: 'rise',
                timing: 0,
                duration: Math.min(60, Math.floor(this.totalFrames * 0.2)),
                keywords: ['riser', 'tension', 'build', 'anticipation'],
                priority: 5,
                volume: 0.4,
                fadeIn: 10,
                fadeOut: 5
            });
        }

        // 5. Add ducking rules
        plan.duckingRules = [
            {
                triggerType: 'sfx',
                targetType: 'bgm',
                duckTo: 0.3,
                attackTime: 3,
                releaseTime: 10
            },
            {
                triggerType: 'climax',
                targetType: 'bgm',
                duckTo: 0.5,
                attackTime: 5,
                releaseTime: 15
            }
        ];

        return plan;
    }

    /**
     * Create BGM requirement
     */
    private createBGMRequirement(mood: AudioMood, energy: number): AudioRequirement {
        const keywords = [...MOOD_KEYWORDS[mood]];
        
        // Add energy-based keywords
        if (energy >= 7) keywords.push('energetic', 'powerful');
        if (energy <= 3) keywords.push('soft', 'gentle');

        return {
            id: `bgm_main`,
            type: 'bgm',
            mood: mood,
            timing: 0,
            duration: this.totalFrames,
            keywords: keywords,
            priority: 10,
            volume: 0.5,
            fadeIn: Math.floor(this.fps * 0.5),  // 0.5 second fade in
            fadeOut: Math.floor(this.fps * 1.5), // 1.5 second fade out
            duck: false
        };
    }

    /**
     * Create Ambience requirement
     */
    private createAmbienceRequirement(mood: AudioMood): AudioRequirement {
        let keywords: string[] = [];

        switch (mood) {
            case 'tech':
            case 'futuristic':
            case 'cyber':
                keywords = ['digital', 'electronic', 'ambient', 'drone', 'hum'];
                break;
            case 'ambient':
            case 'peaceful':
                keywords = ['nature', 'ambient', 'atmosphere', 'background'];
                break;
            case 'mysterious':
            case 'dark':
                keywords = ['dark', 'ambient', 'ominous', 'atmosphere'];
                break;
            default:
                keywords = ['ambient', 'background', 'atmosphere'];
        }

        return {
            id: `ambience_main`,
            type: 'ambience',
            mood: mood,
            timing: 0,
            duration: this.totalFrames,
            keywords: keywords,
            priority: 3,
            volume: 0.15,
            fadeIn: Math.floor(this.fps),
            fadeOut: Math.floor(this.fps)
        };
    }

    /**
     * Create SFX requirement
     */
    private createSFXRequirement(
        category: SFXCategory,
        timing: number,
        duration: number,
        priority: number
    ): AudioRequirement {
        return {
            id: `sfx_${category}_${timing}`,
            type: 'sfx',
            mood: 'tech', // Default, not really used for SFX
            category: category,
            timing: Math.max(0, timing),
            duration: duration,
            keywords: SFX_KEYWORDS[category],
            priority: priority,
            volume: 0.7,
            duck: priority >= 7 // High priority SFX should duck BGM
        };
    }

    /**
     * Get search keywords for an audio requirement
     */
    static getSearchQuery(requirement: AudioRequirement): string {
        let query = requirement.keywords.slice(0, 3).join(' ');
        
        if (requirement.type === 'bgm') {
            query += ' music background';
        } else if (requirement.type === 'sfx') {
            query += ' sound effect';
        } else if (requirement.type === 'ambience') {
            query += ' ambient atmosphere';
        }

        return query;
    }

    /**
     * Suggest audio based on visual elements detected
     */
    suggestFromVisualElements(elements: {
        hasLogo?: boolean;
        hasText?: boolean;
        hasImages?: boolean;
        hasTransitions?: boolean;
        colorScheme?: 'dark' | 'light' | 'colorful' | 'monochrome';
    }): Partial<AudioPlan> {
        const sfx: AudioRequirement[] = [];

        if (elements.hasLogo) {
            sfx.push(this.createSFXRequirement('impact', 0, 30, 9));
            sfx.push(this.createSFXRequirement('reveal', 5, 20, 7));
        }

        if (elements.hasText) {
            sfx.push(this.createSFXRequirement('whoosh', 0, 15, 6));
        }

        if (elements.hasTransitions) {
            sfx.push(this.createSFXRequirement('transition', 0, 20, 7));
        }

        // Mood suggestion based on color scheme
        let suggestedMood: AudioMood = 'tech';
        if (elements.colorScheme === 'dark') suggestedMood = 'dark';
        if (elements.colorScheme === 'light') suggestedMood = 'calm';
        if (elements.colorScheme === 'colorful') suggestedMood = 'playful';

        return {
            sfx,
            bgm: [this.createBGMRequirement(suggestedMood, 5)]
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════

export const AVAILABLE_MOODS = Object.keys(MOOD_KEYWORDS) as AudioMood[];
export const AVAILABLE_SFX_CATEGORIES = Object.keys(SFX_KEYWORDS) as SFXCategory[];
