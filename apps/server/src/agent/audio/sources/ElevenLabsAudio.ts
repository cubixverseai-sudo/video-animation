/**
 * 🔊 ELEVENLABS AUDIO CLIENT
 * Centralized client for ElevenLabs Sound Effects and Music generation.
 *
 * This module ONLY talks to ElevenLabs HTTP APIs and returns raw audio buffers.
 * File system concerns (paths, copying to public folders, etc.) are handled
 * by the callers (e.g. AudioFetcher).
 */

import 'dotenv/config';

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVEN_API_KEY) {
    // We don't throw here to avoid crashing the server at import time,
    // but log a clear warning so it's visible in logs.
    console.warn('⚠️ ELEVENLABS_API_KEY is not set. ElevenLabs audio generation will fail until it is configured.');
}

// Base endpoints from ElevenLabs docs
const ELEVEN_BASE_URL = 'https://api.elevenlabs.io';
const ELEVEN_SFX_ENDPOINT = `${ELEVEN_BASE_URL}/v1/sound-generation`;
const ELEVEN_MUSIC_ENDPOINT = `${ELEVEN_BASE_URL}/v1/music`;

// ────────────────────────────────────────────────────────────────────────────────
// Shared low-level HTTP helper
// ────────────────────────────────────────────────────────────────────────────────

async function postForAudioBuffer(
    url: string,
    body: Record<string, unknown>
): Promise<Buffer> {
    if (!ELEVEN_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'xi-api-key': ELEVEN_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
            `ElevenLabs API error (${response.status} ${response.statusText}): ${text || 'No response body'}`
        );
    }

    // ElevenLabs returns raw audio bytes for these endpoints
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// ────────────────────────────────────────────────────────────────────────────────
// Sound Effects (Text → SFX)
// Docs: https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert
// ────────────────────────────────────────────────────────────────────────────────

export interface ElevenSoundEffectOptions {
    /**
     * Natural language description of the sound effect.
     * Example: "Cinematic impact with deep braam and sub boom"
     */
    text: string;

    /**
     * Desired duration in seconds (0.5 - 30).
     * If omitted, ElevenLabs decides automatically based on the prompt.
     */
    durationSeconds?: number;

    /**
     * Whether the sound should be seamlessly loopable.
     * Useful for ambience / continuous textures.
     */
    loop?: boolean;

    /**
     * How strictly to follow the prompt (0.0 - 1.0).
     * Higher = more literal, lower = more creative.
     */
    promptInfluence?: number;

    /**
     * ElevenLabs output format identifier.
     * Example: "mp3_44100_128" (44.1kHz, 128kbps).
     * If omitted, ElevenLabs uses its default.
     */
    outputFormat?: string;
}

export async function generateElevenSoundEffect(
    options: ElevenSoundEffectOptions
): Promise<Buffer> {
    const {
        text,
        durationSeconds,
        loop,
        promptInfluence,
        outputFormat
    } = options;

    const payload: Record<string, unknown> = {
        text
    };

    if (typeof durationSeconds === 'number') {
        // ElevenLabs expects 0.5 - 30 seconds
        const clamped = Math.max(0.5, Math.min(30, durationSeconds));
        payload.duration_seconds = clamped;
    }

    if (typeof loop === 'boolean') {
        payload.loop = loop;
    }

    if (typeof promptInfluence === 'number') {
        payload.prompt_influence = Math.max(0, Math.min(1, promptInfluence));
    }

    if (outputFormat) {
        payload.output_format = outputFormat;
    }

    return postForAudioBuffer(ELEVEN_SFX_ENDPOINT, payload);
}

// ────────────────────────────────────────────────────────────────────────────────
// Music (Text → Music / BGM)
// Docs: https://elevenlabs.io/docs/api-reference/music/compose
// ────────────────────────────────────────────────────────────────────────────────

export interface ElevenMusicOptions {
    /**
     * Natural language music description.
     * Example: "Epic cinematic orchestral trailer music, powerful and emotional"
     */
    prompt: string;

    /**
     * Desired length in seconds (3 - 300).
     */
    durationSeconds?: number;

    /**
     * If true, forces instrumental-only output (no vocals).
     */
    forceInstrumental?: boolean;

    /**
     * Optional explicit model id. Defaults to ElevenLabs "music_v1".
     */
    modelId?: string;

    /**
     * ElevenLabs output format identifier, e.g. "mp3_44100_128".
     */
    outputFormat?: string;
}

export async function generateElevenMusic(
    options: ElevenMusicOptions
): Promise<Buffer> {
    const {
        prompt,
        durationSeconds,
        forceInstrumental,
        modelId,
        outputFormat
    } = options;

    const payload: Record<string, unknown> = {
        prompt
    };

    if (typeof durationSeconds === 'number') {
        // API expects milliseconds, 3s - 300s (5 minutes)
        const clampedSeconds = Math.max(3, Math.min(300, durationSeconds));
        payload.music_length_ms = Math.round(clampedSeconds * 1000);
    }

    if (typeof forceInstrumental === 'boolean') {
        payload.force_instrumental = forceInstrumental;
    }

    payload.model_id = modelId || 'music_v1';

    if (outputFormat) {
        payload.output_format = outputFormat;
    }

    return postForAudioBuffer(ELEVEN_MUSIC_ENDPOINT, payload);
}

