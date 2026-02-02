/**
 * 🎵 AUDIO FETCHER
 * Multi-source audio fetching with intelligent fallback
 * Sources: Pixabay → Freesound → Local Library
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AudioRequirement, AudioDecisionEngine, AudioPlan } from './AudioDecisionEngine';
import { findBestPixabayMatch, downloadPixabayAudio, PixabayAudioResult } from './sources/PixabayAudio';
import { 
    findBestFreesoundMatch, 
    downloadFreesoundAudio, 
    FreesoundResult,
    isFreesoundConfigured,
    searchFreesoundSFX,
    searchFreesoundMusic
} from './sources/FreesoundAudio';
import { 
    findBestLocalMatch, 
    copyLocalAssetToProject, 
    LocalAudioAsset,
    initializeLocalLibrary 
} from './LocalAudioLibrary';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES
// ═══════════════════════════════════════════════════════════════

export type AudioSource = 'pixabay' | 'freesound' | 'local';

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
    private enabledSources: AudioSource[];

    constructor(
        projectId: string,
        enabledSources: AudioSource[] = ['freesound', 'pixabay', 'local']
    ) {
        this.projectId = projectId;
        this.projectAssetsPath = path.resolve(
            process.cwd(),
            'storage/projects',
            projectId,
            'assets/audio'
        );
        this.enabledSources = enabledSources;
    }

    /**
     * Initialize fetcher (create directories, etc.)
     */
    async initialize(): Promise<void> {
        await fs.mkdir(this.projectAssetsPath, { recursive: true });
        await initializeLocalLibrary();
        console.log(`🎵 AudioFetcher initialized for project: ${this.projectId}`);
    }

    /**
     * Fetch a single audio requirement
     * Tries sources in order: Freesound → Pixabay → Local
     */
    async fetchAudio(requirement: AudioRequirement): Promise<FetchResult> {
        const triedSources: AudioSource[] = [];
        
        console.log(`\n🔍 Fetching audio for: ${requirement.id} (${requirement.type})`);
        console.log(`   Keywords: ${requirement.keywords.join(', ')}`);

        // Determine source order based on audio type
        let sourceOrder: AudioSource[] = [];
        
        if (requirement.type === 'sfx') {
            // Freesound is best for SFX
            sourceOrder = ['freesound', 'pixabay', 'local'];
        } else {
            // Pixabay might be better for music
            sourceOrder = ['pixabay', 'freesound', 'local'];
        }

        // Filter by enabled sources
        sourceOrder = sourceOrder.filter(s => this.enabledSources.includes(s));

        // Try each source in order
        for (const source of sourceOrder) {
            triedSources.push(source);
            
            try {
                const result = await this.trySource(source, requirement);
                
                if (result) {
                    console.log(`✅ Successfully fetched from ${source}: ${result.metadata.originalName}`);
                    return {
                        success: true,
                        audio: result,
                        triedSources
                    };
                }
            } catch (error) {
                console.warn(`⚠️ ${source} failed:`, error);
            }
        }

        // All sources failed
        return {
            success: false,
            error: `Could not find audio matching: ${requirement.keywords.join(', ')}`,
            triedSources
        };
    }

    /**
     * Try a specific source
     */
    private async trySource(
        source: AudioSource,
        requirement: AudioRequirement
    ): Promise<FetchedAudio | null> {
        switch (source) {
            case 'freesound':
                return this.tryFreesound(requirement);
            case 'pixabay':
                return this.tryPixabay(requirement);
            case 'local':
                return this.tryLocal(requirement);
            default:
                return null;
        }
    }

    /**
     * Try Freesound source
     */
    private async tryFreesound(requirement: AudioRequirement): Promise<FetchedAudio | null> {
        if (!isFreesoundConfigured()) {
            console.log('   ℹ️ Freesound not configured, skipping...');
            return null;
        }

        console.log('   🔍 Trying Freesound...');
        const match = await findBestFreesoundMatch(requirement);
        
        if (!match) {
            console.log('   ❌ No match on Freesound');
            return null;
        }

        // Generate filename
        const filename = this.generateFilename(requirement, 'freesound', match.id);
        const localPath = path.join(this.projectAssetsPath, filename);

        // Download
        const downloaded = await downloadFreesoundAudio(match, localPath, true);
        
        if (!downloaded) {
            return null;
        }

        // Sync to public folders
        await this.syncToPublicFolders(filename);

        return {
            requirement,
            source: 'freesound',
            localPath: downloaded,
            publicPath: `assets/${this.projectId}/audio/${filename}`,
            metadata: {
                originalName: match.name,
                duration: match.duration,
                downloadedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Try Pixabay source
     */
    private async tryPixabay(requirement: AudioRequirement): Promise<FetchedAudio | null> {
        console.log('   🔍 Trying Pixabay...');
        const match = await findBestPixabayMatch(requirement);
        
        if (!match) {
            console.log('   ❌ No match on Pixabay');
            return null;
        }

        // Generate filename
        const filename = this.generateFilename(requirement, 'pixabay', match.id);
        const localPath = path.join(this.projectAssetsPath, filename);

        // Download
        const downloaded = await downloadPixabayAudio(match, localPath);
        
        if (!downloaded) {
            return null;
        }

        // Sync to public folders
        await this.syncToPublicFolders(filename);

        return {
            requirement,
            source: 'pixabay',
            localPath: downloaded,
            publicPath: `assets/${this.projectId}/audio/${filename}`,
            metadata: {
                originalName: match.title,
                duration: match.duration,
                downloadedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Try Local library source
     */
    private async tryLocal(requirement: AudioRequirement): Promise<FetchedAudio | null> {
        console.log('   🔍 Trying Local Library...');
        const match = findBestLocalMatch(requirement);
        
        if (!match) {
            console.log('   ❌ No match in Local Library');
            return null;
        }

        // Generate filename
        const filename = this.generateFilename(requirement, 'local', match.id);

        // Copy to project
        const copied = await copyLocalAssetToProject(match, this.projectId, filename);
        
        if (!copied) {
            // If local file doesn't exist, we can't use it
            console.log('   ⚠️ Local file not available');
            return null;
        }

        // Sync to public folders
        await this.syncToPublicFolders(filename);

        return {
            requirement,
            source: 'local',
            localPath: copied,
            publicPath: `assets/${this.projectId}/audio/${filename}`,
            metadata: {
                originalName: match.name,
                duration: match.duration,
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
     * Sync audio file to public folders for Remotion and Web
     */
    private async syncToPublicFolders(filename: string): Promise<void> {
        const sourcePath = path.join(this.projectAssetsPath, filename);

        // Destinations
        const remotionDest = path.resolve(
            process.cwd(),
            '../../packages/remotion-core/public/assets',
            this.projectId,
            'audio',
            filename
        );
        const webDest = path.resolve(
            process.cwd(),
            '../web/public/assets',
            this.projectId,
            'audio',
            filename
        );

        try {
            // Ensure directories exist
            await fs.mkdir(path.dirname(remotionDest), { recursive: true });
            await fs.mkdir(path.dirname(webDest), { recursive: true });

            // Copy files
            await fs.copyFile(sourcePath, remotionDest);
            await fs.copyFile(sourcePath, webDest);

            console.log(`   📁 Synced to public folders`);
        } catch (error) {
            console.error('   ⚠️ Failed to sync to public folders:', error);
        }
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
