/**
 * 🎵 PIXABAY AUDIO SOURCE
 * Fetches music and sound effects from Pixabay API
 */

import { AudioRequirement } from '../AudioDecisionEngine';

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || '52153783-46f8a32fc696c7474e7c490d4';

export interface PixabayAudioResult {
    id: number;
    title: string;
    url: string;
    downloadUrl: string;
    duration: number;
    tags: string;
    type: 'music' | 'sfx';
    previewUrl?: string;
}

export interface PixabaySearchParams {
    query: string;
    type?: 'music' | 'sfx';
    category?: string;
    minDuration?: number;
    maxDuration?: number;
    perPage?: number;
}

/**
 * Search Pixabay for music tracks
 */
export async function searchPixabayMusic(params: PixabaySearchParams): Promise<PixabayAudioResult[]> {
    const { query, category, minDuration, maxDuration, perPage = 5 } = params;

    // Pixabay Music API endpoint
    const baseUrl = 'https://pixabay.com/api/videos/'; // Note: Pixabay doesn't have a dedicated music API
    // We'll use their general search approach

    // Build URL with parameters
    const searchParams = new URLSearchParams({
        key: PIXABAY_API_KEY,
        q: encodeURIComponent(query),
        per_page: perPage.toString(),
        safesearch: 'true'
    });

    if (category) {
        searchParams.append('category', category);
    }

    try {
        // Note: Pixabay's public API primarily supports images/videos
        // For actual music, we'd need to scrape or use alternative approach
        // Here we simulate the expected response structure
        
        console.log(`🎵 Searching Pixabay for: "${query}"`);
        
        // For now, return mock structure - in production, integrate with actual Pixabay audio API
        // Pixabay does have audio but it's accessed differently
        const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${perPage}`);
        
        if (!response.ok) {
            throw new Error(`Pixabay API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform to our format (this is a placeholder - actual implementation would use Pixabay's audio endpoint)
        return [];
        
    } catch (error) {
        console.error('Pixabay search error:', error);
        return [];
    }
}

/**
 * Search Pixabay specifically for sound effects
 * Note: Pixabay SFX requires different approach
 */
export async function searchPixabaySFX(query: string, perPage: number = 5): Promise<PixabayAudioResult[]> {
    try {
        console.log(`🔊 Searching Pixabay SFX for: "${query}"`);
        
        // Pixabay doesn't have a direct SFX API, would need web scraping or alternative
        // Returning empty for now - Freesound will be primary SFX source
        return [];
        
    } catch (error) {
        console.error('Pixabay SFX search error:', error);
        return [];
    }
}

/**
 * Download audio file from Pixabay
 */
export async function downloadPixabayAudio(
    result: PixabayAudioResult,
    destinationPath: string
): Promise<string | null> {
    try {
        const response = await fetch(result.downloadUrl);
        
        if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const fs = await import('fs/promises');
        const path = await import('path');

        await fs.mkdir(path.dirname(destinationPath), { recursive: true });
        await fs.writeFile(destinationPath, buffer);

        console.log(`✅ Downloaded Pixabay audio to: ${destinationPath}`);
        return destinationPath;

    } catch (error) {
        console.error('Pixabay download error:', error);
        return null;
    }
}

/**
 * Get best match from Pixabay based on requirement
 */
export async function findBestPixabayMatch(
    requirement: AudioRequirement
): Promise<PixabayAudioResult | null> {
    const query = requirement.keywords.slice(0, 3).join(' ');
    
    let results: PixabayAudioResult[] = [];
    
    if (requirement.type === 'bgm') {
        results = await searchPixabayMusic({ query, perPage: 5 });
    } else if (requirement.type === 'sfx') {
        results = await searchPixabaySFX(query, 5);
    }

    if (results.length === 0) {
        return null;
    }

    // Return first (best) match
    return results[0];
}
