/**
 * 🎵 AUDIO FETCHER (ElevenLabs Edition)
 * Centralizes all audio generation for the Director Agent.
 *
 * This implementation uses ElevenLabs exclusively:
 * - ElevenLabs Sound Effects API for SFX / short ambience
 * - Eleven Music API for BGM / longer musical beds
 *
 * All legacy sources (Freesound, Pixabay, local library) have been retired from
 * the fetching pipeline to keep behavior predictable and fully AI‑driven.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AudioRequirement, AudioDecisionEngine, AudioPlan } from './AudioDecisionEngine';
import {
    generateElevenSoundEffect,
    generateElevenMusic
} from './sources/ElevenLabsAudio';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES
// ═══════════════════════════════════════════════════════════════

export type AudioSource = 'eleven_sfx' | 'eleven_music';

export interface FetchedAudio {
    requirement: AudioRequirement;
    source: AudioSource;
    localPath: string;
    publicPath: string; // Path for use in Remotion
    metadata: {
        originalName: string;
        duration: number;
        downloadedAt: string;
    };
}

export interface FetchResult {
    success: boolean;
    audio?: FetchedAudio;
    error?: string;
    triedSources: AudioSource[];
}

export interface BatchFetchResult {
    successful: FetchedAudio[];
    failed: Array<{ requirement: AudioRequirement; error: string }>;
    totalRequested: number;
    totalFetched: number;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 MAIN AUDIO FETCHER CLASS
// ═══════════════════════════════════════════════════════════════

export class AudioFetcher {
    private projectId: string;
    private projectAssetsPath: string;

    constructor(
        projectId: string
    ) {
        this.projectId = projectId;
        // Single source of truth: root /projects/{id}/assets/audio
        this.projectAssetsPath = path.resolve(
            process.cwd(),
            '../../projects',
            projectId,
            'assets/audio'
        );
    }

    /**
     * Initialize fetcher (create directories, etc.)
     */
    async initialize(): Promise<void> {
        await fs.mkdir(this.projectAssetsPath, { recursive: true });
        console.log(`🎵 AudioFetcher initialized for project: ${this.projectId}`);
    }

    /**
     * Fetch a single audio requirement
     * Uses ElevenLabs exclusively for generation:
     * - SFX / short ambience → Sound Effects API
     * - BGM / longer beds → Eleven Music API
     */
    async fetchAudio(requirement: AudioRequirement): Promise<FetchResult> {
        const triedSources: AudioSource[] = [];
        
        console.log(`\n🔍 Fetching audio for: ${requirement.id} (${requirement.type})`);
        console.log(`   Keywords: ${requirement.keywords.join(', ')}`);

        try {
            let result: FetchedAudio | null = null;

            if (requirement.type === 'sfx') {
                triedSources.push('eleven_sfx');
                result = await this.tryElevenSfx(requirement);
            } else {
                triedSources.push('eleven_music');
                result = await this.tryElevenMusic(requirement);
            }

            if (result) {
                console.log(`✅ Successfully generated from ElevenLabs (${result.source}): ${result.metadata.originalName}`);
                return {
                    success: true,
                    audio: result,
                    triedSources
                };
            }
        } catch (error) {
            console.warn('⚠️ ElevenLabs generation failed:', error);
        }

        // Generation failed
        return {
            success: false,
            error: `Could not generate audio from ElevenLabs for: ${requirement.keywords.join(', ')}`,
            triedSources
        };
    }

    /**
     * Generate SFX (and short ambience) via ElevenLabs Sound Effects API
     */
    private async tryElevenSfx(requirement: AudioRequirement): Promise<FetchedAudio | null> {
        console.log('   🔍 Generating SFX via ElevenLabs...');

        const keywords = requirement.keywords?.join(', ') || '';
        const baseCategory = requirement.category || 'sound effect';
        const mood = requirement.mood || 'tech';

        const promptParts = [
            baseCategory,
            'sound effect',
            `with ${mood} mood`,
            keywords && `keywords: ${keywords}`,
            'high quality, detailed, one-shot, suitable for cinematic motion graphics'
        ].filter(Boolean);

        const prompt = promptParts.join(', ');

        // Convert frames → seconds (assume 30fps as baseline)
        const rawSeconds = (requirement.duration || 60) / 30;
        // SFX should generally be short
        const durationSeconds = Math.max(0.5, Math.min(5, rawSeconds));

        const audioBuffer = await generateElevenSoundEffect({
            text: prompt,
            durationSeconds,
            loop: false,
            promptInfluence: 0.7,
            outputFormat: 'mp3_44100_128'
        });

        const filename = this.generateFilename(requirement, 'eleven_sfx', requirement.id);
        const localPath = path.join(this.projectAssetsPath, filename);

        await fs.mkdir(path.dirname(localPath), { recursive: true });
        await fs.writeFile(localPath, audioBuffer);

        await this.syncToPublicFolders(filename);

        return {
            requirement,
            source: 'eleven_sfx',
            localPath,
            publicPath: `assets/${this.projectId}/audio/${filename}`,
            metadata: {
                originalName: prompt,
                duration: durationSeconds,
                downloadedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Generate BGM / musical beds via Eleven Music API
     */
    private async tryElevenMusic(requirement: AudioRequirement): Promise<FetchedAudio | null> {
        console.log('   🔍 Generating music via ElevenLabs...');

        const keywords = requirement.keywords?.join(', ') || '';
        const mood = requirement.mood || 'tech';

        const promptParts = [
            'Background music track',
            `with ${mood} mood`,
            keywords && `style: ${keywords}`,
            'cinematic, cohesive, suitable for motion graphics video'
        ].filter(Boolean);

        const prompt = promptParts.join(', ');

        // Convert frames → seconds (assume 30fps baseline)
        const rawSeconds = (requirement.duration || 300) / 30;
        const durationSeconds = Math.max(10, Math.min(300, rawSeconds));

        const audioBuffer = await generateElevenMusic({
            prompt,
            durationSeconds,
            forceInstrumental: true,
            modelId: 'music_v1',
            outputFormat: 'mp3_44100_128'
        });

        const filename = this.generateFilename(requirement, 'eleven_music', requirement.id);
        const localPath = path.join(this.projectAssetsPath, filename);

        await fs.mkdir(path.dirname(localPath), { recursive: true });
        await fs.writeFile(localPath, audioBuffer);

        await this.syncToPublicFolders(filename);

        return {
            requirement,
            source: 'eleven_music',
            localPath,
            publicPath: `assets/${this.projectId}/audio/${filename}`,
            metadata: {
                originalName: prompt,
                duration: durationSeconds,
                downloadedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Generate consistent filename
     */
    private generateFilename(
        requirement: AudioRequirement,
        source: AudioSource,
        sourceId: string | number
    ): string {
        const typePrefix = requirement.type;
        const category = requirement.category || requirement.mood;
        const id = requirement.id.replace(/[^a-zA-Z0-9-_]/g, '-');
        
        return `${typePrefix}-${category}-${id}.mp3`;
    }

    /**
     * Log that file was saved (no sync needed - single source of truth)
     */
    private async syncToPublicFolders(filename: string): Promise<void> {
        // No sync needed - assets are served directly from /projects/{id}/assets/
        // via Express static middleware
        console.log(`   📁 Saved to project folder`);
    }

    /**
     * Batch fetch all audio requirements from a plan
     */
    async fetchAllFromPlan(plan: AudioPlan): Promise<BatchFetchResult> {
        // Safely handle null/undefined arrays with fallbacks
        const bgm = Array.isArray(plan.bgm) ? plan.bgm : [];
        const sfx = Array.isArray(plan.sfx) ? plan.sfx : [];
        const ambience = Array.isArray(plan.ambience) ? plan.ambience : [];
        
        const allRequirements = [...bgm, ...sfx, ...ambience];
        const result: BatchFetchResult = {
            successful: [],
            failed: [],
            totalRequested: allRequirements.length,
            totalFetched: 0
        };

        console.log(`\n🎵 Starting batch fetch for ${allRequirements.length} audio requirements...\n`);

        for (const requirement of allRequirements) {
            const fetchResult = await this.fetchAudio(requirement);

            if (fetchResult.success && fetchResult.audio) {
                result.successful.push(fetchResult.audio);
                result.totalFetched++;
            } else {
                result.failed.push({
                    requirement,
                    error: fetchResult.error || 'Unknown error'
                });
            }
        }

        console.log(`\n📊 Batch fetch complete:`);
        console.log(`   ✅ Successful: ${result.totalFetched}/${result.totalRequested}`);
        console.log(`   ❌ Failed: ${result.failed.length}`);

        return result;
    }

    /**
     * Generate Remotion audio components code from fetched audio
     */
    generateRemotionAudioCode(fetchedAudios: FetchedAudio[]): string {
        if (fetchedAudios.length === 0) {
            return '// No audio fetched';
        }

        const imports = `import { Audio, staticFile } from 'remotion';`;
        
        const audioComponents = fetchedAudios.map(audio => {
            const volume = audio.requirement.volume || 0.5;
            const startFrame = audio.requirement.timing || 0;
            
            return `      <Audio
        src={staticFile('${audio.publicPath}')}
        startFrom={${startFrame}}
        volume={${volume}}
      />`;
        }).join('\n');

        return `${imports}

// Audio Components (auto-generated)
export const AudioLayer: React.FC = () => {
  return (
    <>
${audioComponents}
    </>
  );
};`;
    }
}

// ═══════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Quick helper to fetch audio for a project
 */
export async function fetchAudioForProject(
    projectId: string,
    prompt: string,
    fps: number = 30,
    totalFrames: number = 300
): Promise<BatchFetchResult> {
    // Create decision engine
    const decisionEngine = new AudioDecisionEngine(projectId, fps, totalFrames);
    
    // Generate audio plan from prompt
    const plan = decisionEngine.generateAudioPlan(prompt, [
        { startFrame: 0, endFrame: 90, type: 'intro' },
        { startFrame: 90, endFrame: 210, type: 'content', hasText: true },
        { startFrame: 210, endFrame: totalFrames, type: 'outro' }
    ]);

    // Create fetcher and fetch all
    const fetcher = new AudioFetcher(projectId);
    await fetcher.initialize();
    
    return fetcher.fetchAllFromPlan(plan);
}

/**
 * Fetch a single SFX quickly
 */
export async function fetchSFX(
    projectId: string,
    category: string,
    keywords: string[] = []
): Promise<FetchResult> {
    const fetcher = new AudioFetcher(projectId);
    await fetcher.initialize();

    const requirement: AudioRequirement = {
        id: `sfx_${category}_${Date.now()}`,
        type: 'sfx',
        mood: 'tech',
        category: category as any,
        timing: 0,
        duration: 30,
        keywords: [category, ...keywords],
        priority: 7,
        volume: 0.7
    };

    return fetcher.fetchAudio(requirement);
}

/**
 * Fetch BGM quickly
 */
export async function fetchBGM(
    projectId: string,
    mood: string,
    keywords: string[] = []
): Promise<FetchResult> {
    const fetcher = new AudioFetcher(projectId);
    await fetcher.initialize();

    const requirement: AudioRequirement = {
        id: `bgm_${mood}_${Date.now()}`,
        type: 'bgm',
        mood: mood as any,
        timing: 0,
        duration: 300,
        keywords: [mood, ...keywords, 'music', 'background'],
        priority: 10,
        volume: 0.5
    };

    return fetcher.fetchAudio(requirement);
}
