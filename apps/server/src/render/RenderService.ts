/**
 * 🎬 RENDER SERVICE
 * 
 * Handles video rendering using @remotion/renderer and @remotion/bundler.
 * Bundles the Remotion project, selects the composition, and renders to MP4/WebM.
 * Emits progress events via Socket.IO for real-time UI updates.
 */

import path from 'path';
import fs from 'fs/promises';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { SocketManager } from '../socket/SocketManager';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface RenderRequest {
    projectId: string;
    format: 'mp4' | 'webm' | 'gif';
    quality: 'low' | 'medium' | 'high';
}

export interface RenderResult {
    success: boolean;
    outputPath?: string;
    filename?: string;
    downloadUrl?: string;
    error?: string;
    durationMs?: number;
}

interface QualityConfig {
    crf: number;
    scale: number;
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const QUALITY_MAP: Record<string, QualityConfig> = {
    low:    { crf: 28, scale: 0.5 },   // 960x540
    medium: { crf: 20, scale: 0.75 },  // 1440x810
    high:   { crf: 14, scale: 1 },     // 1920x1080
};

const CODEC_MAP: Record<string, 'h264' | 'vp8' | 'gif'> = {
    mp4:  'h264',
    webm: 'vp8',
    gif:  'gif',
};

// ═══════════════════════════════════════════════════════════════
// Render Service
// ═══════════════════════════════════════════════════════════════

export class RenderService {
    private readonly REMOTION_ROOT: string;
    private readonly PROJECTS_ROOT: string;
    private readonly EXPORTS_DIR: string;
    private socketManager: SocketManager;
    private isRendering: boolean = false;
    private bundleCache: string | null = null;

    constructor(socketManager: SocketManager) {
        this.socketManager = socketManager;
        this.REMOTION_ROOT = path.resolve(process.cwd(), '../../packages/remotion-core');
        this.PROJECTS_ROOT = path.resolve(process.cwd(), '../../projects');
        this.EXPORTS_DIR = path.resolve(process.cwd(), '../../exports');
    }

    /**
     * Render a video composition to a file.
     */
    async render(request: RenderRequest): Promise<RenderResult> {
        if (this.isRendering) {
            return { success: false, error: 'A render is already in progress. Please wait.' };
        }

        const startTime = Date.now();
        this.isRendering = true;

        try {
            // Validate project exists
            const projectPath = path.join(this.PROJECTS_ROOT, request.projectId);
            const mainPath = path.join(projectPath, 'Main.tsx');
            
            try {
                await fs.access(mainPath);
            } catch {
                return { success: false, error: `Project ${request.projectId} has no Main.tsx` };
            }

            // Ensure exports directory exists
            await fs.mkdir(this.EXPORTS_DIR, { recursive: true });

            const qualityConfig = QUALITY_MAP[request.quality] || QUALITY_MAP.high;
            const codec = CODEC_MAP[request.format] || 'h264';
            const extension = request.format === 'gif' ? 'gif' : request.format;
            const filename = `${request.projectId}-${Date.now()}.${extension}`;
            const outputPath = path.join(this.EXPORTS_DIR, filename);

            // ── Step 1: Bundle ──
            this.emitProgress(0, 'Bundling project...');

            const entryPoint = path.join(this.REMOTION_ROOT, 'src/Root.tsx');
            
            let bundleLocation: string;
            try {
                bundleLocation = await bundle({
                    entryPoint,
                    webpackOverride: (config) => ({
                        ...config,
                        resolve: {
                            ...config.resolve,
                            alias: {
                                ...(config.resolve?.alias || {}),
                                '@projects': this.PROJECTS_ROOT,
                            },
                        },
                    }),
                });
                this.bundleCache = bundleLocation;
            } catch (bundleError: any) {
                return { success: false, error: `Bundle failed: ${bundleError.message}` };
            }

            // ── Step 1.5: Copy project assets into the bundle's public directory ──
            // staticFile('assets/{projectId}/audio/...') expects files at {bundle}/public/assets/{projectId}/audio/
            // Actual files are at projects/{projectId}/assets/audio/
            try {
                const projectAssetsDir = path.join(this.PROJECTS_ROOT, request.projectId, 'assets');
                const bundleAssetsDir = path.join(bundleLocation, 'public', 'assets', request.projectId);

                for (const subDir of ['audio', 'images']) {
                    const srcDir = path.join(projectAssetsDir, subDir);
                    const destDir = path.join(bundleAssetsDir, subDir);
                    try {
                        const files = await fs.readdir(srcDir);
                        await fs.mkdir(destDir, { recursive: true });
                        for (const file of files) {
                            await fs.copyFile(path.join(srcDir, file), path.join(destDir, file));
                        }
                        if (files.length > 0) {
                            console.log(`📁 [RENDER] Copied ${files.length} ${subDir} files into bundle`);
                        }
                    } catch {
                        // Directory doesn't exist or is empty — skip
                    }
                }
            } catch (copyError: any) {
                console.warn(`⚠️ [RENDER] Could not copy assets: ${copyError.message}`);
            }

            this.emitProgress(20, 'Bundle complete. Selecting composition...');

            // ── Step 2: Select Composition ──
            let composition;
            try {
                composition = await selectComposition({
                    serveUrl: bundleLocation,
                    id: 'Default',
                });
            } catch (compError: any) {
                return { success: false, error: `Composition selection failed: ${compError.message}` };
            }

            this.emitProgress(30, `Rendering ${request.format.toUpperCase()} (${request.quality})...`);

            // ── Step 3: Render ──
            try {
                await renderMedia({
                    composition,
                    serveUrl: bundleLocation,
                    codec,
                    outputLocation: outputPath,
                    crf: qualityConfig.crf,
                    scale: qualityConfig.scale,
                    onProgress: ({ progress }) => {
                        // Map render progress (0-1) to our range (30-95%)
                        const percent = Math.round(30 + progress * 65);
                        this.emitProgress(percent, `Rendering... ${Math.round(progress * 100)}%`);
                    },
                });
            } catch (renderError: any) {
                return { success: false, error: `Render failed: ${renderError.message}` };
            }

            // ── Step 4: Verify output ──
            try {
                const stats = await fs.stat(outputPath);
                if (stats.size === 0) {
                    return { success: false, error: 'Render produced an empty file' };
                }
            } catch {
                return { success: false, error: 'Output file was not created' };
            }

            this.emitProgress(100, 'Export complete!');

            const durationMs = Date.now() - startTime;
            const downloadUrl = `/exports/${filename}`;

            return {
                success: true,
                outputPath,
                filename,
                downloadUrl,
                durationMs,
            };

        } catch (error: any) {
            return { success: false, error: `Unexpected error: ${error.message}` };
        } finally {
            this.isRendering = false;
        }
    }

    /**
     * Emit render progress to all connected clients.
     */
    private emitProgress(percent: number, message: string) {
        console.log(`🎬 [RENDER] ${percent}% - ${message}`);
        this.socketManager.emit('render:progress', { percent, message });
    }

    /**
     * Check if a render is currently in progress.
     */
    get busy(): boolean {
        return this.isRendering;
    }

    /**
     * List all exported files for a project.
     */
    async listExports(projectId: string): Promise<string[]> {
        try {
            const files = await fs.readdir(this.EXPORTS_DIR);
            return files.filter(f => f.startsWith(projectId));
        } catch {
            return [];
        }
    }

    /**
     * Clean up old exports for a project.
     */
    async cleanExports(projectId: string): Promise<number> {
        const files = await this.listExports(projectId);
        let deleted = 0;
        for (const file of files) {
            try {
                await fs.unlink(path.join(this.EXPORTS_DIR, file));
                deleted++;
            } catch { /* ignore */ }
        }
        return deleted;
    }
}
