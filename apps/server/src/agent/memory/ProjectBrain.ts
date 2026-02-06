/**
 * 🧠 PROJECT BRAIN - Unified Project-Scoped Memory System
 * 
 * Single-file memory replacing 9 old memory modules.
 * Based on best practices from MemGPT, GitHub Copilot, LangMem, and Claude.
 * 
 * Architecture:
 *   Core Memory  (always injected into context ~2K tokens)
 *     - project_state: file map with summaries, imports, asset refs
 *     - brand_identity: colors, logo, style, font
 *     - decisions: top design decisions with citations
 *   Recall Memory (persisted to disk, last N items injected)
 *     - conversation: user + assistant messages (max 50)
 *     - actions: tool calls + results (max 30)
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES
// ═══════════════════════════════════════════════════════════════

export interface FileEntry {
    role: 'entry' | 'scene' | 'component' | 'config' | 'other';
    summary: string;
    imports: string[];
    assetRefs: string[];
    lastModified: string;
}

export interface BrandIdentity {
    name: string | null;
    logo: string | null;
    colors: string[];
    style: string | null;
    font: string | null;
}

export interface Decision {
    what: string;
    why: string;
    file: string | null;
}

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    ts: string;
}

export interface ActionEntry {
    tool: string;
    path?: string;
    result: 'success' | 'fail';
    error?: string;
    ts: string;
}

export interface BrainData {
    version: number;
    updatedAt: string;
    core: {
        project_state: {
            totalDuration: number;
            fps: number;
            compositionEntry: string;
            files: Record<string, FileEntry>;
            assets: {
                images: string[];
                audio: string[];
            };
        };
        brand_identity: BrandIdentity;
        decisions: Decision[];
    };
    recall: {
        conversation: ConversationMessage[];
        actions: ActionEntry[];
    };
}

// ═══════════════════════════════════════════════════════════════
// 🧠 PROJECT BRAIN CLASS
// ═══════════════════════════════════════════════════════════════

export class ProjectBrain {
    private brainPath: string;
    private data: BrainData;
    private isDirty: boolean = false;
    private projectRoot: string;
    private projectId: string;

    // Limits
    private readonly MAX_CONVERSATIONS = 50;
    private readonly MAX_ACTIONS = 30;
    private readonly MAX_DECISIONS = 15;

    constructor(projectRoot: string, projectId: string) {
        this.projectRoot = projectRoot;
        this.projectId = projectId;
        this.brainPath = path.join(projectRoot, 'memory', 'BRAIN.json');
        this.data = this.createEmpty();
    }

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    async initialize(): Promise<void> {
        const memoryDir = path.join(this.projectRoot, 'memory');
        await fs.mkdir(memoryDir, { recursive: true });

        try {
            const raw = await fs.readFile(this.brainPath, 'utf-8');
            const parsed = JSON.parse(raw);

            // Migrate from v1 or validate
            if (parsed.version === 2) {
                this.data = parsed;
            } else {
                // Attempt to migrate legacy data
                await this.migrateFromLegacy();
            }
        } catch {
            // No existing BRAIN.json — try migrating from legacy files
            await this.migrateFromLegacy();
        }

        console.log(`🧠 ProjectBrain initialized for ${this.projectId} (${Object.keys(this.data.core.project_state.files).length} files tracked)`);
    }

    private createEmpty(): BrainData {
        return {
            version: 2,
            updatedAt: new Date().toISOString(),
            core: {
                project_state: {
                    totalDuration: 150,
                    fps: 30,
                    compositionEntry: 'Main.tsx',
                    files: {},
                    assets: { images: [], audio: [] }
                },
                brand_identity: {
                    name: null,
                    logo: null,
                    colors: [],
                    style: null,
                    font: null
                },
                decisions: []
            },
            recall: {
                conversation: [],
                actions: []
            }
        };
    }

    /**
     * Migrate from legacy memory files (directors_log.md, project_data.json, etc.)
     */
    private async migrateFromLegacy(): Promise<void> {
        const memoryDir = path.join(this.projectRoot, 'memory');

        // Try to read legacy project_data.json
        try {
            const raw = await fs.readFile(path.join(memoryDir, 'project_data.json'), 'utf-8');
            const legacy = JSON.parse(raw);
            if (legacy.files && Array.isArray(legacy.files)) {
                for (const filePath of legacy.files) {
                    this.data.core.project_state.files[filePath] = {
                        role: this.inferRole(filePath),
                        summary: '',
                        imports: [],
                        assetRefs: [],
                        lastModified: new Date().toISOString()
                    };
                }
            }
            if (legacy.decisions && Array.isArray(legacy.decisions)) {
                for (const d of legacy.decisions) {
                    this.data.core.decisions.push({
                        what: d.choice || '',
                        why: d.context || '',
                        file: null
                    });
                }
            }
        } catch { /* no legacy file */ }

        // Try to read legacy semantic.json
        try {
            const raw = await fs.readFile(path.join(memoryDir, 'semantic.json'), 'utf-8');
            const legacy = JSON.parse(raw);
            if (legacy.styleGuide) {
                if (legacy.styleGuide.primaryColor) {
                    this.data.core.brand_identity.colors = [legacy.styleGuide.primaryColor];
                }
                if (legacy.styleGuide.font) {
                    this.data.core.brand_identity.font = legacy.styleGuide.font;
                }
            }
        } catch { /* no legacy file */ }

        // Scan actual assets on disk
        await this.scanAssets();

        // Scan actual code files and build summaries
        await this.scanProjectFiles();

        // Save the new BRAIN.json
        await this.save();

        console.log('🧠 Migrated from legacy memory to BRAIN.json');
    }

    // ═══════════════════════════════════════════════════════════════
    // 💾 PERSISTENCE
    // ═══════════════════════════════════════════════════════════════

    async save(): Promise<void> {
        this.data.updatedAt = new Date().toISOString();
        const memoryDir = path.join(this.projectRoot, 'memory');
        await fs.mkdir(memoryDir, { recursive: true });
        await fs.writeFile(this.brainPath, JSON.stringify(this.data, null, 2), 'utf-8');
        this.isDirty = false;
    }

    // ═══════════════════════════════════════════════════════════════
    // 📝 CORE MEMORY WRITES (auto-called by AgentCore)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Auto-called after every successful write_file.
     * Parses the code to extract imports, asset refs, and a summary.
     */
    trackFile(filePath: string, content: string): void {
        const imports = this.extractImports(content);
        const assetRefs = this.extractAssetRefs(content);
        const summary = this.generateSummary(filePath, content);
        const role = this.inferRole(filePath);

        this.data.core.project_state.files[filePath] = {
            role,
            summary,
            imports,
            assetRefs,
            lastModified: new Date().toISOString()
        };

        // Update global asset list
        for (const ref of assetRefs) {
            if (ref.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
                const name = ref.split('/').pop()!;
                if (!this.data.core.project_state.assets.images.includes(name)) {
                    this.data.core.project_state.assets.images.push(name);
                }
            } else if (ref.match(/\.(mp3|wav|ogg|m4a)$/i)) {
                const name = ref.split('/').pop()!;
                if (!this.data.core.project_state.assets.audio.includes(name)) {
                    this.data.core.project_state.assets.audio.push(name);
                }
            }
        }

        this.isDirty = true;
    }

    /**
     * Remove a file from tracking (after delete_file).
     */
    untrackFile(filePath: string): void {
        delete this.data.core.project_state.files[filePath];
        this.isDirty = true;
    }

    /**
     * Update composition metadata (after register_composition).
     */
    updateComposition(durationInFrames: number, fps: number = 30, entry: string = 'Main.tsx'): void {
        this.data.core.project_state.totalDuration = durationInFrames;
        this.data.core.project_state.fps = fps;
        this.data.core.project_state.compositionEntry = entry;
        this.isDirty = true;
    }

    /**
     * Record a design decision.
     */
    addDecision(what: string, why: string, file: string | null = null): void {
        this.data.core.decisions.push({ what, why, file });

        // Keep only the most recent decisions
        if (this.data.core.decisions.length > this.MAX_DECISIONS) {
            this.data.core.decisions = this.data.core.decisions.slice(-this.MAX_DECISIONS);
        }

        this.isDirty = true;
    }

    /**
     * Update brand identity.
     */
    updateBrand(updates: Partial<BrandIdentity>): void {
        Object.assign(this.data.core.brand_identity, updates);
        this.isDirty = true;
    }

    // ═══════════════════════════════════════════════════════════════
    // 💬 RECALL MEMORY WRITES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Add a conversation message (persisted to disk).
     */
    addConversation(role: 'user' | 'assistant', content: string): void {
        // Truncate long messages for storage
        const truncated = content.length > 500 ? content.substring(0, 500) + '...' : content;

        this.data.recall.conversation.push({
            role,
            content: truncated,
            ts: new Date().toISOString()
        });

        // Evict old messages (FIFO)
        if (this.data.recall.conversation.length > this.MAX_CONVERSATIONS) {
            this.data.recall.conversation = this.data.recall.conversation.slice(-this.MAX_CONVERSATIONS);
        }

        this.isDirty = true;
    }

    /**
     * Record a tool action (persisted to disk).
     */
    recordAction(tool: string, result: 'success' | 'fail', filePath?: string, error?: string): void {
        const entry: ActionEntry = {
            tool,
            result,
            ts: new Date().toISOString()
        };
        if (filePath) entry.path = filePath;
        if (error) entry.error = error.substring(0, 200);

        this.data.recall.actions.push(entry);

        // Evict old actions (FIFO)
        if (this.data.recall.actions.length > this.MAX_ACTIONS) {
            this.data.recall.actions = this.data.recall.actions.slice(-this.MAX_ACTIONS);
        }

        this.isDirty = true;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🎯 CONTEXT GENERATION (injected into every Gemini prompt)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Generate the full context string to inject into Gemini's prompt.
     * Core Memory = always included.
     * Recall = last N items.
     */
    getContextForPrompt(): string {
        let ctx = '';

        // ── CORE: Project State ──
        ctx += '## 🧠 PROJECT BRAIN\n\n';
        ctx += `**Duration:** ${this.data.core.project_state.totalDuration} frames (${this.data.core.project_state.totalDuration / this.data.core.project_state.fps}s @ ${this.data.core.project_state.fps}fps)\n`;
        ctx += `**Entry:** ${this.data.core.project_state.compositionEntry}\n\n`;

        // File map
        const files = this.data.core.project_state.files;
        const fileKeys = Object.keys(files);
        if (fileKeys.length > 0) {
            ctx += '### 📁 Files\n';
            for (const fp of fileKeys) {
                const f = files[fp];
                ctx += `- **${fp}** [${f.role}]: ${f.summary}`;
                if (f.assetRefs.length > 0) {
                    ctx += ` | Assets: ${f.assetRefs.join(', ')}`;
                }
                if (f.imports.length > 0) {
                    ctx += ` | Imports: ${f.imports.join(', ')}`;
                }
                ctx += '\n';
            }
            ctx += '\n';
        }

        // Assets
        const assets = this.data.core.project_state.assets;
        if (assets.images.length > 0 || assets.audio.length > 0) {
            ctx += '### 📦 Assets\n';
            if (assets.images.length > 0) {
                ctx += `- **Images:** ${assets.images.map(i => `staticFile(\`assets/${this.projectId}/images/${i}\`)`).join(', ')}\n`;
            }
            if (assets.audio.length > 0) {
                ctx += `- **Audio:** ${assets.audio.map(a => `staticFile(\`assets/${this.projectId}/audio/${a}\`)`).join(', ')}\n`;
            }
            ctx += '\n';
        }

        // ── CORE: Brand Identity ──
        const brand = this.data.core.brand_identity;
        if (brand.name || brand.logo || brand.colors.length > 0) {
            ctx += '### 🎨 Brand\n';
            if (brand.name) ctx += `- **Name:** ${brand.name}\n`;
            if (brand.logo) ctx += `- **Logo:** staticFile(\`assets/${this.projectId}/images/${brand.logo}\`)\n`;
            if (brand.colors.length > 0) ctx += `- **Colors:** ${brand.colors.join(', ')}\n`;
            if (brand.style) ctx += `- **Style:** ${brand.style}\n`;
            if (brand.font) ctx += `- **Font:** ${brand.font}\n`;
            ctx += '\n';
        }

        // ── CORE: Decisions ──
        if (this.data.core.decisions.length > 0) {
            ctx += '### ⚖️ Design Decisions\n';
            for (const d of this.data.core.decisions.slice(-10)) {
                ctx += `- ${d.what}`;
                if (d.why) ctx += ` (${d.why})`;
                if (d.file) ctx += ` [${d.file}]`;
                ctx += '\n';
            }
            ctx += '\n';
        }

        // ── RECALL: Recent Conversation ──
        const recentConv = this.data.recall.conversation.slice(-5);
        if (recentConv.length > 0) {
            ctx += '### 💬 Recent Conversation\n';
            for (const msg of recentConv) {
                ctx += `[${msg.role}]: ${msg.content}\n`;
            }
            ctx += '\n';
        }

        // ── RECALL: Recent Actions ──
        const recentActions = this.data.recall.actions.slice(-10);
        if (recentActions.length > 0) {
            ctx += '### 🔧 Recent Actions\n';
            for (const a of recentActions) {
                const icon = a.result === 'success' ? '✅' : '❌';
                ctx += `${icon} ${a.tool}`;
                if (a.path) ctx += ` → ${a.path}`;
                if (a.error) ctx += ` (${a.error})`;
                ctx += '\n';
            }
        }

        return ctx.trim();
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔍 POST-DEPLOY REFLECTION (Subconscious Formation)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Called after deploy_project to refresh file summaries
     * and extract brand info from actual code on disk.
     */
    async postDeployReflection(): Promise<void> {
        await this.scanAssets();
        await this.scanProjectFiles();

        // Extract brand info from code
        await this.extractBrandFromCode();

        await this.save();
        console.log('🧠 Post-deploy reflection complete');
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 CODE ANALYSIS HELPERS
    // ═══════════════════════════════════════════════════════════════

    private extractImports(content: string): string[] {
        const imports: string[] = [];
        const regex = /import\s+.*?from\s+['"]\.\.?\/(.*?)['"]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        return imports;
    }

    private extractAssetRefs(content: string): string[] {
        const refs: string[] = [];
        const regex = /staticFile\s*\(\s*[`'"](.*?)[`'"]\s*\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            // Extract just the filename part after images/ or audio/
            const fullPath = match[1];
            const parts = fullPath.split('/');
            // Get last 2 parts: "images/file.png" or "audio/file.mp3"
            if (parts.length >= 2) {
                refs.push(parts.slice(-2).join('/'));
            } else {
                refs.push(fullPath);
            }
        }
        return refs;
    }

    private generateSummary(filePath: string, content: string): string {
        const lines = content.split('\n');
        const lineCount = lines.length;

        // Extract component/function name
        const componentMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
        const componentName = componentMatch ? componentMatch[1] : null;

        // Count key elements
        const hasSpring = content.includes('spring(');
        const hasInterpolate = content.includes('interpolate(');
        const hasImg = content.includes('<Img') || content.includes('<img');
        const hasAudio = content.includes('<Audio');
        const hasSeries = content.includes('<Series');
        const hasSequence = content.includes('<Sequence');
        const hasAbsoluteFill = content.includes('AbsoluteFill');

        const parts: string[] = [];
        if (componentName) parts.push(componentName);
        parts.push(`${lineCount}L`);
        if (hasSeries) parts.push('Series');
        if (hasSequence) parts.push('Sequence');
        if (hasAudio) parts.push('Audio');
        if (hasImg) parts.push('Img');
        if (hasSpring) parts.push('spring');
        if (hasInterpolate) parts.push('interpolate');

        // Try to extract duration from Series.Sequence
        const durationMatches = content.matchAll(/durationInFrames=\{(\d+)\}/g);
        const durations: string[] = [];
        for (const dm of durationMatches) {
            durations.push(`${dm[1]}f`);
        }
        if (durations.length > 0) {
            parts.push(`durations: ${durations.join('+')}`);
        }

        return parts.join(' | ');
    }

    private inferRole(filePath: string): FileEntry['role'] {
        if (filePath === 'Main.tsx' || filePath === 'main.tsx') return 'entry';
        if (filePath.startsWith('scenes/')) return 'scene';
        if (filePath.startsWith('components/')) return 'component';
        if (filePath === 'PLAN.md' || filePath.endsWith('.json')) return 'config';
        return 'other';
    }

    /**
     * Scan the project's assets folder and update the asset lists.
     */
    private async scanAssets(): Promise<void> {
        const assetsPath = path.join(this.projectRoot, 'assets');

        // Images
        try {
            const imagesPath = path.join(assetsPath, 'images');
            const images = await fs.readdir(imagesPath);
            this.data.core.project_state.assets.images = images.filter(f => !f.startsWith('.'));
        } catch { /* no images folder */ }

        // Audio
        try {
            const audioPath = path.join(assetsPath, 'audio');
            const audio = await fs.readdir(audioPath);
            this.data.core.project_state.assets.audio = audio.filter(f => !f.startsWith('.'));
        } catch { /* no audio folder */ }
    }

    /**
     * Scan all .tsx files in the project and build/refresh summaries.
     */
    private async scanProjectFiles(): Promise<void> {
        const scanDirs = ['', 'scenes', 'components'];

        for (const dir of scanDirs) {
            const fullDir = dir ? path.join(this.projectRoot, dir) : this.projectRoot;
            try {
                const files = await fs.readdir(fullDir);
                for (const file of files) {
                    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
                    if (file.startsWith('.')) continue;

                    const filePath = dir ? `${dir}/${file}` : file;
                    const fullFilePath = path.join(fullDir, file);

                    try {
                        const content = await fs.readFile(fullFilePath, 'utf-8');
                        this.trackFile(filePath, content);
                    } catch { /* skip unreadable files */ }
                }
            } catch { /* directory doesn't exist */ }
        }
    }

    /**
     * Extract brand identity from code (colors, logo refs, etc.)
     */
    private async extractBrandFromCode(): Promise<void> {
        const files = this.data.core.project_state.files;

        for (const [, fileEntry] of Object.entries(files)) {
            // If a file references an image with "logo" in the name, set it as brand logo
            for (const ref of fileEntry.assetRefs) {
                if (ref.toLowerCase().includes('logo')) {
                    const logoFile = ref.split('/').pop();
                    if (logoFile) {
                        this.data.core.brand_identity.logo = ref;
                    }
                }
            }
        }

        // Extract dominant colors from code (backgroundColor patterns)
        const allColors = new Set<string>();
        for (const [fp, ] of Object.entries(files)) {
            try {
                const content = await fs.readFile(path.join(this.projectRoot, fp), 'utf-8');
                const colorMatches = content.matchAll(/(?:backgroundColor|color|background)\s*:\s*['"]?(#[0-9a-fA-F]{3,8})['"]?/g);
                for (const cm of colorMatches) {
                    allColors.add(cm[1]);
                }
            } catch { /* skip */ }
        }

        if (allColors.size > 0) {
            this.data.core.brand_identity.colors = Array.from(allColors).slice(0, 6);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 📊 LEGACY COMPATIBILITY
    // ═══════════════════════════════════════════════════════════════

    /**
     * Legacy: append to director's log (maps to addConversation)
     */
    async appendLog(entry: string): Promise<void> {
        this.addConversation('assistant', entry);
        await this.save();
    }

    /**
     * Legacy: update decision (maps to addDecision)
     */
    async updateDecision(context: string, choice: string): Promise<void> {
        this.addDecision(choice, context);
        await this.save();
    }

    /**
     * Legacy: get files list
     */
    getFiles(): string[] {
        return Object.keys(this.data.core.project_state.files);
    }

    /**
     * Legacy: get context summary (maps to getContextForPrompt)
     */
    async getContextSummary(): Promise<string> {
        return this.getContextForPrompt();
    }

    /**
     * Legacy: track file (simplified)
     */
    async trackFileByPath(filePath: string): Promise<void> {
        if (!this.data.core.project_state.files[filePath]) {
            this.data.core.project_state.files[filePath] = {
                role: this.inferRole(filePath),
                summary: '',
                imports: [],
                assetRefs: [],
                lastModified: new Date().toISOString()
            };
            this.isDirty = true;
            await this.save();
        }
    }

    /**
     * Legacy: reset
     */
    async reset(): Promise<void> {
        this.data = this.createEmpty();
        await this.save();
    }

    /**
     * Save if dirty (called periodically or on shutdown)
     */
    async flush(): Promise<void> {
        if (this.isDirty) {
            await this.save();
        }
    }

    /**
     * Direct access to brain data (for tools like get_memory_stats)
     */
    getData(): BrainData {
        return this.data;
    }
}
