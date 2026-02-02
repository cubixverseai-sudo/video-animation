/**
 * 🔊 FREESOUND AUDIO SOURCE
 * Fetches sound effects from Freesound.org API (400,000+ sounds)
 * Primary source for SFX
 */

import { AudioRequirement, SFXCategory } from '../AudioDecisionEngine';

const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY || '';
const FREESOUND_BASE_URL = 'https://freesound.org/apiv2';

export interface FreesoundResult {
    id: number;
    name: string;
    description: string;
    tags: string[];
    duration: number;
    url: string;
    previews: {
        'preview-hq-mp3': string;
        'preview-lq-mp3': string;
        'preview-hq-ogg': string;
        'preview-lq-ogg': string;
    };
    download: string;
    license: string;
    username: string;
    avgRating: number;
    numDownloads: number;
}

export interface FreesoundSearchParams {
    query: string;
    filter?: string;
    sort?: 'score' | 'duration_asc' | 'duration_desc' | 'rating_desc' | 'downloads_desc';
    pageSize?: number;
    minDuration?: number;
    maxDuration?: number;
}

/**
 * Check if Freesound API is configured
 */
export function isFreesoundConfigured(): boolean {
    return !!FREESOUND_API_KEY && FREESOUND_API_KEY.length > 0;
}

/**
 * Search Freesound for sounds
 */
export async function searchFreesound(params: FreesoundSearchParams): Promise<FreesoundResult[]> {
    if (!isFreesoundConfigured()) {
        console.warn('⚠️ Freesound API key not configured. Skipping Freesound search.');
        return [];
    }

    const { 
        query, 
        filter, 
        sort = 'rating_desc', 
        pageSize = 10,
        minDuration,
        maxDuration 
    } = params;

    try {
        // Build filter string
        let filterStr = filter || '';
        if (minDuration !== undefined) {
            filterStr += ` duration:[${minDuration} TO *]`;
        }
        if (maxDuration !== undefined) {
            filterStr += ` duration:[* TO ${maxDuration}]`;
        }

        const searchParams = new URLSearchParams({
            query: query,
            token: FREESOUND_API_KEY,
            sort: sort,
            page_size: pageSize.toString(),
            fields: 'id,name,description,tags,duration,url,previews,download,license,username,avg_rating,num_downloads'
        });

        if (filterStr.trim()) {
            searchParams.append('filter', filterStr.trim());
        }

        const url = `${FREESOUND_BASE_URL}/search/text/?${searchParams.toString()}`;
        console.log(`🔍 Searching Freesound for: "${query}"`);

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ Freesound API: Invalid API key');
            } else {
                console.error(`❌ Freesound API error: ${response.status}`);
            }
            return [];
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            console.log(`ℹ️ No Freesound results for: "${query}"`);
            return [];
        }

        // Map to our format
        const results: FreesoundResult[] = data.results.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            tags: item.tags || [],
            duration: item.duration,
            url: item.url,
            previews: item.previews,
            download: item.download,
            license: item.license,
            username: item.username,
            avgRating: item.avg_rating || 0,
            numDownloads: item.num_downloads || 0
        }));

        console.log(`✅ Found ${results.length} sounds on Freesound`);
        return results;

    } catch (error) {
        console.error('Freesound search error:', error);
        return [];
    }
}

/**
 * Search specifically for SFX by category
 */
export async function searchFreesoundSFX(
    category: SFXCategory,
    additionalKeywords: string[] = []
): Promise<FreesoundResult[]> {
    // Category-specific search queries
    const categoryQueries: Record<SFXCategory, string> = {
        whoosh: 'whoosh swoosh swish air movement',
        impact: 'impact hit punch thud boom bass drop',
        transition: 'transition sweep pass cinematic',
        reveal: 'reveal magic sparkle shimmer shine',
        click: 'click button interface ui tap',
        pop: 'pop bubble plop cartoon notification',
        glitch: 'glitch digital error static distortion',
        notification: 'notification alert ding chime bell',
        rise: 'riser tension build anticipation suspense',
        fall: 'fall drop descend down pitch',
        sweep: 'sweep scan radar pass cinematic',
        swipe: 'swipe slide gesture movement quick',
        explosion: 'explosion blast bang burst boom',
        magic: 'magic spell mystical enchant fantasy',
        electric: 'electric spark zap shock electricity',
        mechanical: 'mechanical machine robot servo gear'
    };

    const baseQuery = categoryQueries[category] || category;
    const fullQuery = additionalKeywords.length > 0 
        ? `${baseQuery} ${additionalKeywords.join(' ')}`
        : baseQuery;

    return searchFreesound({
        query: fullQuery,
        sort: 'rating_desc',
        pageSize: 10,
        maxDuration: 10 // SFX should be short
    });
}

/**
 * Search for background music/ambient sounds
 */
export async function searchFreesoundMusic(
    mood: string,
    additionalKeywords: string[] = []
): Promise<FreesoundResult[]> {
    const query = `${mood} ${additionalKeywords.join(' ')} music ambient background`;
    
    return searchFreesound({
        query: query,
        sort: 'rating_desc',
        pageSize: 5,
        minDuration: 30 // Music should be at least 30 seconds
    });
}

/**
 * Download sound from Freesound
 * Note: Requires OAuth for full downloads, uses previews for now
 */
export async function downloadFreesoundAudio(
    result: FreesoundResult,
    destinationPath: string,
    usePreview: boolean = true
): Promise<string | null> {
    try {
        // Use preview URL (doesn't require OAuth)
        // For full quality, would need OAuth implementation
        const downloadUrl = usePreview 
            ? result.previews['preview-hq-mp3']
            : `${result.download}?token=${FREESOUND_API_KEY}`;

        if (!downloadUrl) {
            console.error('No download URL available');
            return null;
        }

        console.log(`📥 Downloading from Freesound: ${result.name}`);

        const response = await fetch(downloadUrl);

        if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const fs = await import('fs/promises');
        const path = await import('path');

        await fs.mkdir(path.dirname(destinationPath), { recursive: true });
        await fs.writeFile(destinationPath, buffer);

        console.log(`✅ Downloaded to: ${destinationPath}`);
        return destinationPath;

    } catch (error) {
        console.error('Freesound download error:', error);
        return null;
    }
}

/**
 * Find best matching sound for a requirement
 */
export async function findBestFreesoundMatch(
    requirement: AudioRequirement
): Promise<FreesoundResult | null> {
    let results: FreesoundResult[] = [];

    if (requirement.type === 'sfx' && requirement.category) {
        results = await searchFreesoundSFX(requirement.category, requirement.keywords);
    } else if (requirement.type === 'bgm' || requirement.type === 'ambience') {
        results = await searchFreesoundMusic(requirement.mood, requirement.keywords);
    } else {
        // Generic search
        results = await searchFreesound({
            query: requirement.keywords.join(' '),
            pageSize: 5
        });
    }

    if (results.length === 0) {
        return null;
    }

    // Score and rank results
    const scored = results.map(r => ({
        result: r,
        score: calculateMatchScore(r, requirement)
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored[0].result;
}

/**
 * Calculate how well a sound matches the requirement
 */
function calculateMatchScore(result: FreesoundResult, requirement: AudioRequirement): number {
    let score = 0;

    // Rating bonus (0-5 maps to 0-25)
    score += result.avgRating * 5;

    // Download popularity bonus (logarithmic)
    score += Math.min(Math.log10(result.numDownloads + 1) * 5, 25);

    // Keyword match bonus
    const keywords = requirement.keywords.map(k => k.toLowerCase());
    const matchedTags = result.tags.filter(tag => 
        keywords.some(kw => tag.toLowerCase().includes(kw))
    );
    score += matchedTags.length * 10;

    // Name/description match
    const nameLower = result.name.toLowerCase();
    const descLower = result.description.toLowerCase();
    keywords.forEach(kw => {
        if (nameLower.includes(kw)) score += 15;
        if (descLower.includes(kw)) score += 5;
    });

    // Duration appropriateness
    const durationFrames = result.duration * 30; // Assuming 30fps
    if (requirement.type === 'sfx') {
        // SFX should be short
        if (result.duration <= 3) score += 20;
        else if (result.duration <= 5) score += 10;
        else if (result.duration > 10) score -= 20;
    } else {
        // BGM/Ambience should be longer
        if (result.duration >= 30) score += 20;
        else if (result.duration >= 15) score += 10;
        else score -= 10;
    }

    return score;
}
