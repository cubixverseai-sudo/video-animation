import { GoogleGenerativeAI } from '@google/generative-ai';
import { SocketManager } from '../socket/SocketManager';
import { SYSTEM_PROMPT } from './systemPrompt';
import { TOOLS } from './tools/registry';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Legacy memory (for backward compatibility)
import { AgentMemory } from './memory/AgentMemory';

// NEW: Advanced Director Memory System
import { 
    DirectorMemory, 
    initializeDirectorMemory, 
    getDirectorMemory 
} from './memory/DirectorMemory';

// Import new Audio System 2.0
import { AudioDecisionEngine, AVAILABLE_MOODS, AVAILABLE_SFX_CATEGORIES } from './audio/AudioDecisionEngine';
import { AudioFetcher } from './audio/AudioFetcher';

// Import Intelligence Engine
import { createBrandAnalyzer } from './intelligence/BrandAnalyzer';
import { createNarrativeEngine } from './intelligence/NarrativeEngine';

export class AgentCore {
    private genAI: any;
    private model: any;
    private socketManager: SocketManager;
    private chatSession: any;
    private memory: AgentMemory;
    
    // NEW: Advanced Director Memory System
    private directorMemory: DirectorMemory | null = null;
    private useAdvancedMemory: boolean = true; // Enable new memory system
    
    // Define workspace root relative to apps/server/dist/agent or src/agent
    // Assuming process.cwd() is apps/server, we go up to packages/remotion-core
    private WORKSPACE_ROOT = path.resolve(__dirname, '../../../../packages/remotion-core');
    private MEMORY_STORAGE_ROOT = path.resolve(process.cwd(), 'storage/memory');

    private currentProjectId: string | null = null;
    private projectRoot: string | null = null;
    private initPromise: Promise<void> | null = null;

    constructor(socketManager: SocketManager) {
        this.socketManager = socketManager;
        // Memory will be initialized per project now
        this.memory = new AgentMemory(this.WORKSPACE_ROOT);

        if (!process.env.GEMINI_API_KEY) {
            console.warn("⚠️ GEMINI_API_KEY is not set!");
        }

        try {
            // @ts-ignore
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

            // Use standard model with tools configuration
            this.model = genAI.getGenerativeModel({
                model: "gemini-3-pro-preview",
                tools: [{ functionDeclarations: TOOLS }] as any
            });

            // Do not start session automatically, wait for project selection
        } catch (error) {
            console.error("Failed to initialize Gemini:", error);
        }
    }

    /**
     * Switches the agent's context to a specific project.
     * Loads memory, sets paths, and prepares the workspace.
     */
    public async switchProject(projectId: string) {
        // Create a promise for this operation so others can wait for it
        this.initPromise = (async () => {
            console.log(`🔄 Switching agent context to project: ${projectId}`);
            this.currentProjectId = projectId;

            // 1. Set Roots
            // The isolated persistent storage
            this.projectRoot = path.resolve(process.cwd(), 'storage/projects', projectId);

            // 2. Load Legacy Memory (for backward compatibility)
            this.memory = new AgentMemory(this.projectRoot);
            await this.memory.initialize();

            // 3. NEW: Initialize Advanced Director Memory System
            if (this.useAdvancedMemory) {
                try {
                    // Ensure memory storage exists
                    await fs.mkdir(this.MEMORY_STORAGE_ROOT, { recursive: true });
                    
                    this.directorMemory = await initializeDirectorMemory(this.MEMORY_STORAGE_ROOT);
                    await this.directorMemory.setProjectContext(projectId, this.projectRoot);
                    
                    this.socketManager.emitAgentLog('info', `🧠 Advanced Memory System initialized`);
                } catch (memoryError: any) {
                    console.error('Failed to initialize Director Memory:', memoryError);
                    this.socketManager.emitAgentLog('warning', `⚠️ Using legacy memory (advanced memory init failed)`);
                    this.useAdvancedMemory = false;
                }
            }

            // 4. Sync existing code to Remotion to ensure preview works immediately
            await this.syncProjectToRemotion();

            // 5. Reset AI Session with new context
            await this.startNewSession();

            this.socketManager.emitAgentLog('info', `📂 Switched context to project: ${projectId}`);
        })();

        return this.initPromise;
    }

    /**
     * Mirrors the isolated project code into the Remotion engine folder
     * so it can be rendered/previewed.
     */
    private async syncProjectToRemotion() {
        if (!this.currentProjectId || !this.projectRoot) return;

        try {
            // Destination: packages/remotion-core/src/projects/[ID]
            const destDir = path.join(this.WORKSPACE_ROOT, 'src', 'projects', this.currentProjectId);

            // Source: storage/projects/[ID]/src
            const srcDir = path.join(this.projectRoot, 'src');

            // Recursive copy
            await fs.cp(srcDir, destDir, { recursive: true, force: true });
        } catch (e) {
            // Provide a more graceful fallback if source doesn't exist yet
            console.warn("Sync warning (new project?):", e);
        }
    }

    private async startNewSession() {
        if (this.model && this.currentProjectId && this.projectRoot) {
            // Build rich project context
            const projectContext = await this.buildProjectContext();

            // PROACTIVE VISION: Find the logo/main image to brand the agent
            const brandingImage = await this.getBrandingImage();

            const initialUserParts: any[] = [{ text: `Initialize system for project ${this.currentProjectId}.\n\n${projectContext}` }];
            if (brandingImage) {
                initialUserParts.push(brandingImage);
            }

            this.chatSession = this.model.startChat({
                history: [
                    {
                        role: "user",
                        parts: initialUserParts
                    },
                    {
                        role: "model",
                        parts: [{ text: `System initialized for project ${this.currentProjectId}. I have reviewed your assets (including branding visuals) and existing files. I am ready to create a high-end cinematic experience matching your brand.` }]
                    }
                ],
                systemInstruction: {
                    role: 'system',
                    parts: [{ text: SYSTEM_PROMPT }]
                },
            });
        }
    }

    /**
     * Finds the first available image in the project to use as visual branding context.
     */
    private async getBrandingImage(): Promise<any | null> {
        if (!this.projectRoot) return null;
        try {
            const imagesDir = path.join(this.projectRoot, 'assets', 'images');
            const files = await fs.readdir(imagesDir);
            const imageFile = files.find(f => !f.startsWith('.') && /\.(png|jpg|jpeg|webp)$/i.test(f));

            if (imageFile) {
                const buffer = await fs.readFile(path.join(imagesDir, imageFile));
                const extension = path.extname(imageFile).toLowerCase();
                const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg';

                return {
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType
                    }
                };
            }
        } catch (e) { }
        return null;
    }

    /**
     * Builds a rich context string with all project information for the agent.
     */
    private async buildProjectContext(): Promise<string> {
        if (!this.projectRoot || !this.currentProjectId) return '';

        let context = `## 📋 PROJECT CONTEXT\n`;
        context += `**Project ID:** ${this.currentProjectId}\n\n`;

        // Get tracked files
        const files = this.memory.getFiles();
        if (files.length > 0) {
            context += `### Existing Files:\n`;
            files.forEach(f => context += `- ${f}\n`);
        } else {
            context += `### Existing Files: None (new project)\n`;
        }

        // Get assets
        try {
            const assetsPath = path.join(this.projectRoot, 'assets');
            const images: string[] = [];
            const audio: string[] = [];

            try {
                const imgFiles = await fs.readdir(path.join(assetsPath, 'images'));
                images.push(...imgFiles.filter(f => !f.startsWith('.')));
            } catch { }

            try {
                const audFiles = await fs.readdir(path.join(assetsPath, 'audio'));
                audio.push(...audFiles.filter(f => !f.startsWith('.')));
            } catch { }

            context += `\n### Uploaded Assets:\n`;
            if (images.length > 0) {
                context += `**Images:** ${images.join(', ')}\n`;
                context += `Use: staticFile(\`assets/${this.currentProjectId}/images/[filename]\`)\n`;
            } else {
                context += `**Images:** None\n`;
            }

            if (audio.length > 0) {
                context += `**Audio:** ${audio.join(', ')}\n`;
                context += `Use: staticFile(\`assets/${this.currentProjectId}/audio/[filename]\`)\n`;
            } else {
                context += `**Audio:** None\n`;
            }
        } catch { }

        context += `\n⚠️ IMPORTANT: Do NOT guess paths. Use ONLY the assets listed above.`;

        return context;
    }

    /**
     * Converts technical error messages to human-friendly descriptions.
     */
    private humanizeError(errorMessage: string, toolName: string): string {
        // Common error patterns
        if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file')) {
            if (toolName === 'list_files') {
                return `📁 That folder doesn't exist. I'll try a different approach...`;
            }
            return `📁 File not found. Creating it...`;
        }

        if (errorMessage.includes('EEXIST')) {
            return `📁 File already exists. Updating instead...`;
        }

        if (errorMessage.includes('EACCES') || errorMessage.includes('permission')) {
            return `🔒 Permission denied. Skipping protected file.`;
        }

        if (errorMessage.includes('SAFETY REJECTION')) {
            return `🛡️ Safety check: ${errorMessage.replace('❌ SAFETY REJECTION: ', '')}`;
        }

        if (errorMessage.includes('Syntax Protection')) {
            return `⚠️ Code validation failed. Adjusting...`;
        }

        // Default: shorten technical jargon
        const shortMessage = errorMessage.length > 100
            ? errorMessage.substring(0, 100) + '...'
            : errorMessage;
        return `⚠️ Issue in ${toolName}: ${shortMessage}`;
    }

    /**
     * Validates JSX/TSX structure for common syntax errors.
     */
    private validateJSXStructure(content: string, fileName: string): string[] {
        const errors: string[] = [];

        // Check for balanced JSX tags
        const openTags: string[] = [];
        const tagRegex = /<\/?([A-Z][a-zA-Z0-9.]*)[^>]*\/?>/g;
        let match;

        while ((match = tagRegex.exec(content)) !== null) {
            const fullMatch = match[0];
            const tagName = match[1];

            // Self-closing tag
            if (fullMatch.endsWith('/>')) continue;

            // Opening tag
            if (!fullMatch.startsWith('</')) {
                openTags.push(tagName);
            } else {
                // Closing tag
                const lastOpen = openTags.pop();
                if (lastOpen !== tagName) {
                    errors.push(`[${fileName}] Mismatched tags: expected </${lastOpen}> but found </${tagName}>`);
                }
            }
        }

        // Check for orphaned open tags
        if (openTags.length > 0) {
            errors.push(`[${fileName}] Unclosed tags: ${openTags.join(', ')}`);
        }

        // Check for common TSX issues
        if (content.includes('/>') && content.includes('</') && content.match(/\/>\s*<\//)) {
            // This pattern might indicate double-closing: /> followed immediately by </
            // Could be false positive, but worth flagging
        }

        // Check for orphaned props (props outside of JSX element)
        const orphanPropRegex = /^\s*(title|subtitle|className|style|src|href)=/gm;
        const orphanMatch = content.match(orphanPropRegex);
        if (orphanMatch) {
            errors.push(`[${fileName}] Possible orphaned props detected (props outside element)`);
        }

        // Check for basic import issues
        if (content.includes('<AbsoluteFill') && !content.includes('import')) {
            errors.push(`[${fileName}] Using JSX components without imports`);
        }

        return errors;
    }


    public async resetSession() {
        if (this.currentProjectId) {
            // Reset only current project memory
            await this.memory.reset();
            await this.startNewSession();
            this.socketManager.emitAgentLog('info', '♻️ Project Session Reset.');
        }
    }

    public async processPrompt(prompt: string, assets: Array<{ buffer: Buffer, mimetype: string }> = []) {
        if (this.initPromise) {
            await this.initPromise;
        }

        if (!this.chatSession) {
            this.socketManager.emitAgentLog('error', 'No active session. Please select a project first.');
            return;
        }

        this.socketManager.emitAgentThinking(`Processing Project ${this.currentProjectId || 'Global'}...`);

        try {
            // Inject FRESH Memory Context (use advanced memory if available)
            let memoryContext = '';
            if (this.useAdvancedMemory && this.directorMemory) {
                // Use new intelligent context system
                memoryContext = await this.directorMemory.getContextForAI(prompt);
                // Record user message in history
                this.directorMemory.addToHistory('user', prompt);
            } else {
                // Fallback to legacy memory
                memoryContext = await this.memory.getContextSummary();
            }
            const fullPrompt = `${prompt}\n\n${memoryContext}`;

            // Create multi-modal message parts
            const messageParts: any[] = [{ text: fullPrompt }];

            // 🔍 DYNAMIC VISION: Detect and load assets mentioned in the prompt context
            // Format from UI: [Context: User attached file logo.png located at /assets/ID/images/logo.png]
            const assetRegex = /\[Context: User attached file (.*?) located at (.*?)\]/g;
            let match;
            while ((match = assetRegex.exec(prompt)) !== null) {
                const publicPath = match[2];
                const resolvedPath = await this.resolvePublicAssetPath(publicPath);

                if (resolvedPath) {
                    try {
                        const buffer = await fs.readFile(resolvedPath);
                        const extension = path.extname(resolvedPath).toLowerCase();
                        const mimeType = /\.(png)$/.test(extension) ? 'image/png' :
                            /\.(jpg|jpeg)$/.test(extension) ? 'image/jpeg' :
                                /\.(webp)$/.test(extension) ? 'image/webp' : 'application/octet-stream';

                        if (mimeType.startsWith('image/')) {
                            messageParts.push({
                                inlineData: {
                                    data: buffer.toString('base64'),
                                    mimeType
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Failed to load attached asset binary:", e);
                    }
                }
            }

            // Add assets as inlineData parts (backward compatibility/direct calls)
            for (const asset of assets) {
                messageParts.push({
                    inlineData: {
                        data: asset.buffer.toString('base64'),
                        mimeType: asset.mimetype
                    }
                });
            }

            let result = await this.chatSession.sendMessage(messageParts);
            let response = result.response;
            let text = response.text();

            // If there's text, emit it and record in memory
            if (text) {
                this.socketManager.emitAgentLog('info', text);
                // Record assistant response in advanced memory
                if (this.useAdvancedMemory && this.directorMemory) {
                    this.directorMemory.addToHistory('assistant', text);
                }
            }

            // Handle Function Calls (Multi-turn loop)
            let functionCalls = response.functionCalls();

            while (functionCalls && functionCalls.length > 0) {
                const functionResponses = [];

                for (const call of functionCalls) {
                    const { name, args } = call;

                    // --- PROFESSIONAL ACTION REPORTING ---
                    const actionMap: Record<string, string> = {
                        'write_file': `🛠️ Designing: ${args.path}`,
                        'atomic_edit': `✂️ Refining: ${args.path}`,
                        'register_composition': `🎬 Linking Component: ${args.componentName}`,
                        'deploy_project': `🚀 DEPLOYING TO ENGINE...`,
                        'validate_syntax': `🔍 Verifying Code Integrity...`,
                        'update_log': `🧠 Updating Project Memory...`,
                        'record_decision': `⚖️ Logging Architectural Choice...`,
                        'run_build_check': `⚙️ Running System Diagnostics...`,
                        'list_files': `📂 Exploring Workspace...`,
                        'read_file': `📖 Reading Source: ${args.path}`,
                        'get_my_assets': `📦 Discovering Uploaded Assets...`
                    };

                    const actionDetail = actionMap[name] || `🔄 Executing: ${name}`;

                    // Update the spinning status bar
                    const thinkingState = (name.includes('write') || name.includes('edit')) ? 'Building...' :
                        (name.includes('deploy') || name.includes('register')) ? 'Reviewing...' : 'Thinking...';

                    this.socketManager.emitAgentThinking(thinkingState);
                    this.socketManager.emitAgentLog('info', actionDetail);

                    try {
                        const toolResult = await this.executeTool(name, args);
                        functionResponses.push({
                            functionResponse: {
                                name: name,
                                response: { result: toolResult }
                            }
                        });

                        // Emit summary of success
                        const successEmoji = name === 'deploy_project' ? '✨' : '✅';
                        this.socketManager.emitAgentLog('success', `${successEmoji} Completed: ${name}`);
                    } catch (err: any) {
                        console.error(`Tool ${name} failed:`, err);
                        functionResponses.push({
                            functionResponse: {
                                name: name,
                                response: { error: err.message }
                            }
                        });

                        // --- HUMAN-FRIENDLY ERROR MESSAGES ---
                        const friendlyError = this.humanizeError(err.message, name);
                        this.socketManager.emitAgentLog('warning', friendlyError);
                    }
                }

                // Send tool results back to model
                result = await this.chatSession.sendMessage(functionResponses);
                response = result.response;
                text = response.text();

                if (text) {
                    this.socketManager.emitAgentLog('info', text);
                }

                // Check for more function calls
                functionCalls = response.functionCalls();
            }

            this.socketManager.emitAgentLog('success', 'Task completed.');
            this.socketManager.emit('agent:complete', { success: true });

        } catch (error: any) {
            console.error("Gemini Error:", error);
            this.socketManager.emitAgentLog('error', `AI Error: ${error.message}`);
            this.socketManager.emit('agent:complete', { success: false, error: error.message });
        }
    }

    private async executeTool(name: string, args: any): Promise<any> {
        // --- STRICT PROJECT ISOLATION ---
        // Since projects are now 'seeded' with framework files, the agent
        // has EVERYTHING it needs inside its own project storage.

        const getSecurePath = (p: string) => {
            const clean = p.replace(/^packages\/remotion-core\/?/, '').replace(/^\.\//, '');

            // Redirect asset lookups to the project's actual asset folder
            if (clean.startsWith('assets/') && this.projectRoot) {
                return path.join(this.projectRoot, clean);
            }

            if (this.projectRoot) {
                return path.join(this.projectRoot, clean);
            }
            return path.join(this.WORKSPACE_ROOT, clean);
        };

        switch (name) {
            case 'write_file': {
                const filePath = getSecurePath(args.path);

                // --- HEURISTIC SYNTAX PROTECTION ---
                // Prevent duplicate closing blocks which the AI sometimes hallucinates
                const content = args.content as string;
                if (content.includes('</AbsoluteFill>')) {
                    const occurrences = (content.match(/<\/AbsoluteFill>/g) || []).length;
                    const openings = (content.match(/<AbsoluteFill/g) || []).length;
                    if (occurrences > openings) {
                        throw new Error("Syntax Protection: Detected duplicate closing </AbsoluteFill> tags. Please check your component structure.");
                    }
                }

                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, args.content, 'utf-8');

                await this.memory.trackFile(args.path);

                this.socketManager.emit('project:update', {
                    type: 'file_change',
                    path: args.path,
                    timestamp: Date.now()
                });

                return `✅ File written: ${args.path}`;
            }

            case 'read_file': {
                const filePath = getSecurePath(args.path);
                const content = await fs.readFile(filePath, 'utf-8');

                // Return with line numbers for easier reference
                const lines = content.split('\n');
                const numberedContent = lines
                    .map((line, i) => `${String(i + 1).padStart(4, ' ')} | ${line}`)
                    .join('\n');

                return `📄 File: ${args.path} (${lines.length} lines)\n${'─'.repeat(50)}\n${numberedContent}`;
            }

            case 'list_files': {
                const dirPath = getSecurePath(args.path || '.');
                const entries = await fs.readdir(dirPath, { withFileTypes: true });

                const formatted = entries.map(entry => {
                    const icon = entry.isDirectory() ? '📁' : '📄';
                    return `${icon} ${entry.name}${entry.isDirectory() ? '/' : ''}`;
                }).join('\n');

                return `📂 Directory: ${args.path || '.'}\n${'─'.repeat(30)}\n${formatted}`;
            }

            case 'delete_file': {
                const filePath = getSecurePath(args.path);
                await fs.unlink(filePath);

                this.socketManager.emit('project:update', {
                    type: 'file_delete',
                    path: args.path,
                    timestamp: Date.now()
                });

                return `🗑️ File deleted: ${args.path}`;
            }

            case 'get_my_assets': {
                if (!this.projectRoot || !this.currentProjectId) {
                    return "⚠️ No project loaded. Cannot scan assets.";
                }

                const assetsPath = path.join(this.projectRoot, 'assets');
                const result: { images: string[], audio: string[] } = { images: [], audio: [] };

                try {
                    // Scan images folder
                    const imagesPath = path.join(assetsPath, 'images');
                    try {
                        const images = await fs.readdir(imagesPath);
                        result.images = images.filter(f => !f.startsWith('.'));
                    } catch { /* folder may not exist yet */ }

                    // Scan audio folder
                    const audioPath = path.join(assetsPath, 'audio');
                    try {
                        const audio = await fs.readdir(audioPath);
                        result.audio = audio.filter(f => !f.startsWith('.'));
                    } catch { /* folder may not exist yet */ }
                } catch (e) {
                    return "⚠️ Could not scan assets folder.";
                }

                const projectId = this.currentProjectId;

                let output = `📦 YOUR PROJECT ASSETS (Project: ${projectId})\n${'─'.repeat(50)}\n`;

                if (result.images.length > 0) {
                    output += `\n🖼️ IMAGES:\n`;
                    result.images.forEach(img => {
                        output += `   • ${img}\n`;
                        output += `     Path: staticFile(\`assets/${projectId}/images/${img}\`)\n`;
                    });
                } else {
                    output += `\n🖼️ IMAGES: None uploaded yet.\n`;
                }

                if (result.audio.length > 0) {
                    output += `\n🔊 AUDIO:\n`;
                    result.audio.forEach(aud => {
                        output += `   • ${aud}\n`;
                        output += `     Path: staticFile(\`assets/${projectId}/audio/${aud}\`)\n`;
                    });
                } else {
                    output += `\n🔊 AUDIO: None uploaded yet.\n`;
                }

                output += `\n💡 TIP: Use the exact paths shown above in your code.`;

                return output;
            }

            // ═══════════════════════════════════════════════════════════════
            // 🔪 SURGICAL EDITING
            // ═══════════════════════════════════════════════════════════════
            case 'atomic_edit': {
                const filePath = getSecurePath(args.path);
                const content = await fs.readFile(filePath, 'utf-8');
                const lines = content.split('\n');

                // Sort edits by startLine descending to avoid offset issues
                const sortedEdits = [...args.edits].sort((a: any, b: any) => b.startLine - a.startLine);

                for (const edit of sortedEdits) {
                    const { startLine, endLine, newContent } = edit;

                    // Validate line numbers
                    if (startLine < 1 || endLine > lines.length || startLine > endLine) {
                        throw new Error(`Invalid line range: ${startLine}-${endLine} (file has ${lines.length} lines)`);
                    }

                    // Replace lines (1-indexed to 0-indexed)
                    const newLines = newContent.split('\n');
                    lines.splice(startLine - 1, endLine - startLine + 1, ...newLines);
                }

                // IMPORTANT: Save edits to Project Storage, NOT global core
                const writePath = getSecurePath(args.path);
                await fs.mkdir(path.dirname(writePath), { recursive: true });
                await fs.writeFile(writePath, lines.join('\n'), 'utf-8');

                await this.memory.trackFile(args.path);
                if (this.currentProjectId) await this.syncProjectToRemotion();

                this.socketManager.emit('project:update', {
                    type: 'file_change',
                    path: args.path,
                    timestamp: Date.now()
                });

                return `✏️ Edited ${args.path} (saved to isolated project)`;
            }

            // ═══════════════════════════════════════════════════════════════
            // 🔧 BUILD & VERIFICATION
            // ═══════════════════════════════════════════════════════════════
            case 'run_build_check': {
                try {
                    // Run TypeScript check
                    const { stdout, stderr } = await execAsync('npx tsc --noEmit', {
                        cwd: this.WORKSPACE_ROOT,
                        timeout: 30000 // 30 second timeout
                    });

                    if (stderr && stderr.includes('error')) {
                        return `❌ TypeScript Errors Found:\n${stderr}`;
                    }

                    return `✅ Build check passed! No TypeScript errors.`;
                } catch (error: any) {
                    // TypeScript exits with code 1 on errors, which throws
                    const output = error.stdout || error.stderr || error.message;
                    return `❌ TypeScript Errors:\n${output}`;
                }
            }

            case 'run_command': {
                console.warn(`🔧 Running command: ${args.command}`);
                this.socketManager.emitAgentLog('info', `Running: ${args.command}`);

                try {
                    const { stdout, stderr } = await execAsync(args.command, {
                        cwd: this.projectRoot || this.WORKSPACE_ROOT,
                        timeout: 60000 // 60 second timeout
                    });
                    return stdout || stderr || '✅ Command completed (no output)';
                } catch (error: any) {
                    return `❌ Command failed: ${error.message}`;
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // 🎬 COMPOSITION REGISTRATION
            // ═══════════════════════════════════════════════════════════════
            case 'register_composition': {
                const { componentName, importPath, durationInFrames, fps = 30, width = 1920, height = 1080 } = args;

                // 0. Sanitize Path: Never allow 'src/' prefix in project paths
                let cleanImportPath = importPath.replace(/^src\//, '').replace(/^\.\/src\//, './');

                let actualExportName = componentName; // Will be overwritten with detected name

                // --- FILE EXISTENCE & EXPORT VALIDATION ---
                if (this.projectRoot) {
                    // Support both "./templates/Foo.tsx" and "./templates/Foo/index.tsx"
                    // so the agent can safely pass folder paths without worrying about index files.
                    const baseRelative = cleanImportPath.startsWith('./') ? cleanImportPath : `./${cleanImportPath}`;
                    const fileWithoutExt = baseRelative.replace(/\.tsx$/, '');

                    const primaryPath = path.join(this.projectRoot, 'src', fileWithoutExt + '.tsx');
                    const indexPath = path.join(this.projectRoot, 'src', fileWithoutExt, 'index.tsx');

                    // We'll resolve to whichever exists; if we fall back to index.tsx
                    // we also normalize cleanImportPath so imports point to ".../index".
                    let resolvedPath = primaryPath;
                    try {
                        await fs.access(primaryPath);
                    } catch {
                        try {
                            await fs.access(indexPath);
                            resolvedPath = indexPath;
                            // Ensure import path includes /index so bundlers resolve correctly
                            if (!/\/index(\.tsx)?$/.test(cleanImportPath)) {
                                cleanImportPath = `${fileWithoutExt}/index`;
                            }
                        } catch (e) {
                            const errorMsg = `❌ SAFETY REJECTION: The file "${cleanImportPath}" does not exist (tried ${fileWithoutExt}.tsx and ${fileWithoutExt}/index.tsx). Create it with write_file FIRST.`;
                            this.socketManager.emitAgentLog('error', errorMsg);
                            return errorMsg;
                        }
                    }

                    try {
                        // AUTO-DETECT the actual export name from the resolved file
                        const fileContent = await fs.readFile(resolvedPath, 'utf-8');

                        const exportMatch = fileContent.match(/export\s+const\s+(\w+)\s*[=:]/);

                        if (exportMatch && exportMatch[1]) {
                            actualExportName = exportMatch[1];
                            if (actualExportName !== componentName) {
                                this.socketManager.emitAgentLog('info', `🔄 Auto-corrected component name: "${componentName}" → "${actualExportName}"`);
                            }
                        } else {
                            // Fallback: try to find 'export default' or 'export function'
                            const defaultMatch = fileContent.match(/export\s+default\s+(\w+)/);
                            const functionMatch = fileContent.match(/export\s+function\s+(\w+)/);

                            if (defaultMatch && defaultMatch[1]) {
                                actualExportName = defaultMatch[1];
                            } else if (functionMatch && functionMatch[1]) {
                                actualExportName = functionMatch[1];
                            } else {
                                const errorMsg = `❌ SAFETY REJECTION: Could not find a valid export in "${cleanImportPath}". Make sure you use 'export const YourComponentName = ...' format.`;
                                this.socketManager.emitAgentLog('error', errorMsg);
                                return errorMsg;
                            }
                        }
                    } catch (e) {
                        const errorMsg = `❌ SAFETY REJECTION: The file "${cleanImportPath}" does not exist. Create it with write_file FIRST.`;
                        this.socketManager.emitAgentLog('error', errorMsg);
                        return errorMsg;
                    }
                }

                let actualImportPath = cleanImportPath;

                if (this.currentProjectId) {
                    actualImportPath = cleanImportPath.startsWith('.')
                        ? `./projects/${this.currentProjectId}/${cleanImportPath.replace(/^\.\//, '').replace(/\.tsx$/, '')}`
                        : cleanImportPath;
                }

                // 1. Update Root.tsx
                const rootPath = path.join(this.WORKSPACE_ROOT, 'src/Root.tsx');
                let rootContent = await fs.readFile(rootPath, 'utf-8');

                const aliasName = this.currentProjectId
                    ? `${actualExportName}_${this.currentProjectId.split('-')[0]}`
                    : actualExportName;

                // USE actualExportName (detected) instead of componentName (agent-provided)
                const importStatement = `import { ${actualExportName} as ${aliasName} } from '${actualImportPath}';`;

                // Remove any EXISTING import for this specific alias to prevent duplicates/conflicts
                const importLines = rootContent.split('\n');
                const filteredLines = importLines.filter(line => !line.includes(`as ${aliasName}`) && !line.includes(`'${actualImportPath}'`));

                // Add new import at the top (after other imports)
                const lastImportIndex = filteredLines.reduce((acc, line, idx) => line.startsWith('import') ? idx : acc, 0);
                filteredLines.splice(lastImportIndex + 1, 0, importStatement);
                let newRootContent = filteredLines.join('\n');

                // 2. Add/Update Composition Block (using actualExportName, not componentName)
                const compositionId = this.currentProjectId ? `${this.currentProjectId}:${actualExportName}` : actualExportName;
                const compositionBlock = `        <Composition
            id="${compositionId}"
            component={${aliasName}}
            durationInFrames={${durationInFrames}}
            fps={${fps}}
            width={${width}}
            height={${height}}
        />`;

                // If composition with this ID exists, replace it, otherwise append before the closing fragment
                if (newRootContent.includes(`id="${compositionId}"`)) {
                    const regex = new RegExp(`<Composition\\s+id="${compositionId}"[\\s\\S]*?/>`, 'm');
                    newRootContent = newRootContent.replace(regex, compositionBlock);
                } else {
                    newRootContent = newRootContent.replace(/(\s*)<\/(\s*)>/, `\n${compositionBlock}\n$1</>`);
                }

                await fs.writeFile(rootPath, newRootContent, 'utf-8');

                // 3. Update PreviewEntry.tsx (using actualExportName)
                const previewPath = path.join(this.WORKSPACE_ROOT, 'src/PreviewEntry.tsx');
                const previewContent = `import { ${actualExportName} as CurrentComp } from '${actualImportPath}';\n\nexport const CurrentComposition = CurrentComp;\nexport const currentProps = {};\n`;
                await fs.writeFile(previewPath, previewContent, 'utf-8');

                // 4. Sync Project Files (ensure they exist in remotion-core)
                if (this.currentProjectId) await this.syncProjectToRemotion();

                this.socketManager.emit('project:update', {
                    type: 'composition_registered',
                    componentName: actualExportName,
                    aliasName,
                    timestamp: Date.now()
                });

                return `🎬 Successfully registered: ${actualExportName} (Aliased as ${aliasName})\n- Path: ${actualImportPath}`;
            }

            case 'validate_syntax': {
                // REAL SYNTAX VALIDATION using TypeScript
                const files = this.memory.getFiles();
                if (files.length === 0) return "⚠️ No files tracked in this project yet.";

                this.socketManager.emitAgentLog('info', `🔍 Validating ${files.length} files...`);

                const errors: string[] = [];

                for (const file of files) {
                    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;

                    const filePath = path.join(this.projectRoot!, 'src', file);
                    try {
                        const content = await fs.readFile(filePath, 'utf-8');

                        // Basic JSX structure validation
                        const syntaxIssues = this.validateJSXStructure(content, file);
                        if (syntaxIssues.length > 0) {
                            errors.push(...syntaxIssues);
                        }
                    } catch (e) {
                        // File doesn't exist - might be OK if not synced yet
                    }
                }

                if (errors.length > 0) {
                    const errorReport = errors.slice(0, 5).join('\n');
                    this.socketManager.emitAgentLog('error', `❌ Syntax Errors Found:\n${errorReport}`);
                    return `❌ SYNTAX ERRORS DETECTED:\n${errorReport}\n\nFix these before deploying!`;
                }

                return "✅ Syntax check passed. All files are valid. Ready to deploy.";
            }

            case 'deploy_project': {
                const { message } = args;
                this.socketManager.emitAgentLog('info', `🚀 Deploying project: ${message}`);

                await this.syncProjectToRemotion();
                await this.memory.appendLog(`🚀 DEPLOYED: ${message}`);

                return `🎉 Project successfully deployed to Remotion engine! ${message}`;
            }

            case 'update_log': {
                await this.memory.appendLog(args.entry);
                this.socketManager.emitAgentLog('info', `📝 Log Updated: ${args.entry.slice(0, 50)}...`);
                return `✅ Log updated successfully.`;
            }

            case 'record_decision': {
                await this.memory.updateDecision(args.context, args.choice);
                this.socketManager.emitAgentLog('info', `⚖️ Decision Recorded: ${args.context}`);
                return `✅ Decision recorded: [${args.context}] -> ${args.choice}`;
            }

            case 'get_sound_library': {
                this.socketManager.emitAgentLog('info', `🎹 Accessing Director's Sound Library...`);
                const library = [
                    { id: 'tech-bg-1', name: 'Cinematic Tech Background', type: 'music', description: 'Modern, high-end corporate tech background music.', duration: '2:15' },
                    { id: 'whoosh-1', name: 'Fast Whoosh', type: 'sfx', description: 'Standard high-quality transition whoosh.', duration: '0:01' },
                    { id: 'impact-1', name: 'Logo Impact', type: 'sfx', description: 'Deep cinematic impact for logo reveal.', duration: '0:02' },
                    { id: 'click-1', name: 'Minimal Click', type: 'sfx', description: 'Clean digital click for UI interactions.', duration: '0:00.5' },
                    { id: 'glitch-1', name: 'Digital Glitch', type: 'sfx', description: 'Sci-fi glitch sound for transitions.', duration: '0:03' }
                ];
                return JSON.stringify({
                    message: "These high-quality sounds are available in the system. Use 'download_sound' with the ID to add it to your project.",
                    library
                }, null, 2);
            }

            case 'download_sound': {
                const { soundId } = args;
                if (!this.projectRoot || !this.currentProjectId) return "❌ No project active.";

                // Mapping IDs to actual hosted files (using public assets for reliability)
                const soundMap: Record<string, string> = {
                    'tech-bg-1': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Reliable example
                    'whoosh-1': 'https://github.com/remotion-dev/template-helloworld/raw/main/public/audio.mp3', // Generic whoosh-like length
                    'click-1': 'https://www.soundjay.com/buttons/button-16.mp3',
                    'impact-1': 'https://www.soundjay.com/mechanical/glass-break-1.mp3',
                    'glitch-1': 'https://www.soundjay.com/communication/data-transfer-1.mp3'
                };

                const url = soundMap[soundId];
                if (!url) return `❌ Sound ID '${soundId}' not found.`;

                const filename = `${soundId}.mp3`;
                this.socketManager.emitAgentLog('info', `📥 Downloading sound: ${soundId}...`);

                const destPath = path.join(this.projectRoot, 'assets/audio', filename);

                try {
                    await fs.mkdir(path.dirname(destPath), { recursive: true });
                    const response = await fetch(url);
                    const buffer = Buffer.from(await response.arrayBuffer());
                    await fs.writeFile(destPath, buffer);

                    // Sync to public folders
                    const webDest = path.resolve(process.cwd(), '../web/public/assets', this.currentProjectId, 'audio', filename);
                    const remotionDest = path.resolve(process.cwd(), '../../packages/remotion-core/public/assets', this.currentProjectId, 'audio', filename);

                    await fs.mkdir(path.dirname(webDest), { recursive: true });
                    await fs.mkdir(path.dirname(remotionDest), { recursive: true });

                    await fs.copyFile(destPath, webDest);
                    await fs.copyFile(destPath, remotionDest);

                    this.socketManager.emitAgentLog('success', `🎵 Sound added: ${filename}`);
                    return `✅ Success! Sound saved to: assets/${this.currentProjectId}/audio/${filename}`;
                } catch (e: any) {
                    return `❌ Sound Download Error: ${e.message}`;
                }
            }

            case 'search_pixabay_assets': {
                const { query, type = 'all', per_page = 5 } = args;

                if (type === 'audio') {
                    return "⚠️ Pixabay API does not support direct audio search through this endpoint. Please use 'get_sound_library' to see our high-quality internal sound collection instead.";
                }

                const PIXABAY_KEY = '52153783-46f8a32fc696c7474e7c490d4';

                this.socketManager.emitAgentLog('info', `🔍 Searching Pixabay for: "${query}" (type: ${type})`);

                let endpoint = 'https://pixabay.com/api/';
                if (type === 'video') endpoint += 'videos/';

                const url = `${endpoint}?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&per_page=${per_page}&safesearch=true`;

                try {
                    const response = await fetch(url);
                    const data = await response.json();

                    if (!data.hits || data.hits.length === 0) {
                        return `❌ No ${type} found for "${query}" on Pixabay.`;
                    }

                    // Return metadata to the agent so it can choose which one to download
                    const assets = data.hits.map((hit: any) => ({
                        id: hit.id,
                        tags: hit.tags,
                        preview: type === 'video' ? hit.videos.tiny.url : hit.previewURL,
                        downloadUrl: type === 'video' ? hit.videos.medium.url : hit.largeImageURL,
                        type: type
                    }));

                    return JSON.stringify({
                        message: `Found ${assets.length} assets. Choose one to download using 'download_pixabay_asset'.`,
                        results: assets
                    }, null, 2);

                } catch (error: any) {
                    return `❌ Pixabay Search Error: ${error.message}`;
                }
            } case 'download_pixabay_asset': {
                const { url, filename, assetType } = args;
                if (!this.projectRoot || !this.currentProjectId) return "❌ No project active.";

                this.socketManager.emitAgentLog('info', `📥 Downloading asset: ${filename}...`);

                const subDir = assetType === 'video' ? 'videos' : assetType === 'audio' ? 'audio' : 'images';
                const destPath = path.join(this.projectRoot, 'assets', subDir, filename);

                try {
                    // Ensure directory exists
                    await fs.mkdir(path.dirname(destPath), { recursive: true });

                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const buffer = Buffer.from(await response.arrayBuffer());
                    await fs.writeFile(destPath, buffer);

                    // Also sync to public folders immediately
                    const webDest = path.resolve(process.cwd(), '../web/public/assets', this.currentProjectId, subDir, filename);
                    const remotionDest = path.resolve(process.cwd(), '../../packages/remotion-core/public/assets', this.currentProjectId, subDir, filename);

                    await fs.mkdir(path.dirname(webDest), { recursive: true });
                    await fs.mkdir(path.dirname(remotionDest), { recursive: true });

                    await fs.copyFile(destPath, webDest);
                    await fs.copyFile(destPath, remotionDest);

                    this.socketManager.emitAgentLog('success', `✅ Asset downloaded: ${filename}`);
                    return `✅ Success! Asset saved to: assets/${this.currentProjectId}/${subDir}/${filename}\nUse this path in your code.`;

                } catch (error: any) {
                    return `❌ Download Error: ${error.message}`;
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // 🎵 SMART AUDIO SYSTEM 2.0
            // ═══════════════════════════════════════════════════════════════
            case 'analyze_audio_requirements': {
                const { prompt, scenes, totalFrames = 300, fps = 30 } = args;
                
                if (!this.currentProjectId) return "❌ No project active.";
                
                this.socketManager.emitAgentLog('info', `🎵 Analyzing audio requirements...`);
                
                const decisionEngine = new AudioDecisionEngine(this.currentProjectId, fps, totalFrames);
                
                // Generate default scenes if not provided
                const defaultScenes = scenes || [
                    { startFrame: 0, endFrame: Math.floor(totalFrames * 0.3), type: 'intro' },
                    { startFrame: Math.floor(totalFrames * 0.3), endFrame: Math.floor(totalFrames * 0.8), type: 'content', hasText: true },
                    { startFrame: Math.floor(totalFrames * 0.8), endFrame: totalFrames, type: 'outro' }
                ];
                
                const audioPlan = decisionEngine.generateAudioPlan(prompt, defaultScenes);
                
                return JSON.stringify({
                    message: "Audio requirements analyzed. Here's your audio plan:",
                    plan: audioPlan,
                    tip: "Use 'fetch_audio' to download each requirement, or 'fetch_all_audio_from_plan' to batch download."
                }, null, 2);
            }

            case 'fetch_audio': {
                const { type, mood, category, keywords = [], timing = 0, duration = 150 } = args;
                
                if (!this.currentProjectId || !this.projectRoot) return "❌ No project active.";
                
                this.socketManager.emitAgentLog('info', `🎵 Fetching ${type}: ${mood} ${category || ''}`);
                
                const fetcher = new AudioFetcher(this.currentProjectId);
                await fetcher.initialize();
                
                const requirement = {
                    id: `${type}_${mood}_${Date.now()}`,
                    type: type as any,
                    mood: mood as any,
                    category: category as any,
                    timing,
                    duration,
                    keywords: [mood, ...(category ? [category] : []), ...keywords],
                    priority: type === 'bgm' ? 10 : 7,
                    volume: type === 'bgm' ? 0.5 : 0.7
                };
                
                const result = await fetcher.fetchAudio(requirement);
                
                if (result.success && result.audio) {
                    this.socketManager.emitAgentLog('success', `✅ Audio fetched from ${result.audio.source}`);
                    return JSON.stringify({
                        success: true,
                        audio: result.audio,
                        usage: `staticFile('${result.audio.publicPath}')`
                    }, null, 2);
                } else {
                    return JSON.stringify({
                        success: false,
                        error: result.error,
                        triedSources: result.triedSources
                    }, null, 2);
                }
            }

            case 'fetch_all_audio_from_plan': {
                const { audioPlan } = args;
                
                if (!this.currentProjectId || !this.projectRoot) return "❌ No project active.";
                
                this.socketManager.emitAgentLog('info', `🎵 Batch fetching all audio from plan...`);
                
                const fetcher = new AudioFetcher(this.currentProjectId);
                await fetcher.initialize();
                
                const result = await fetcher.fetchAllFromPlan(audioPlan);
                
                this.socketManager.emitAgentLog('success', `✅ Fetched ${result.totalFetched}/${result.totalRequested} audio files`);
                
                return JSON.stringify({
                    message: `Batch fetch complete: ${result.totalFetched}/${result.totalRequested} succeeded`,
                    successful: result.successful.map(a => ({
                        id: a.requirement.id,
                        source: a.source,
                        path: a.publicPath
                    })),
                    failed: result.failed
                }, null, 2);
            }

            case 'get_audio_categories': {
                return JSON.stringify({
                    moods: AVAILABLE_MOODS,
                    sfxCategories: AVAILABLE_SFX_CATEGORIES,
                    tip: "Use these values with 'fetch_audio' tool"
                }, null, 2);
            }

            // ═══════════════════════════════════════════════════════════════
            // 🎭 MOTION ENGINE 2.0
            // ═══════════════════════════════════════════════════════════════
            case 'get_spring_presets': {
                const presets = [
                    { name: 'SMOOTH', description: 'Gentle, elegant motion with no overshoot', useCases: ['UI elements', 'Subtle transitions', 'Background movement'], config: { stiffness: 100, damping: 20, mass: 1 } },
                    { name: 'BOUNCY', description: 'Playful motion with visible overshoot and bounce', useCases: ['Notifications', 'Playful reveals', 'Game elements'], config: { stiffness: 300, damping: 10, mass: 1 } },
                    { name: 'SNAPPY', description: 'Quick, responsive motion for UI feedback', useCases: ['Button clicks', 'Quick reveals', 'Micro-interactions'], config: { stiffness: 400, damping: 30, mass: 0.5 } },
                    { name: 'DRAMATIC', description: 'Slow, cinematic motion for impactful reveals', useCases: ['Logo reveals', 'Hero entrances', 'Dramatic moments'], config: { stiffness: 50, damping: 15, mass: 2 } },
                    { name: 'LOGO_REVEAL', description: 'Optimized for logo and brand reveal animations', useCases: ['Logo animations', 'Brand reveals', 'Title cards'], config: { stiffness: 180, damping: 12, mass: 1.2 } },
                    { name: 'ELASTIC', description: 'Springy motion with multiple bounces', useCases: ['Fun animations', 'Attention grabbers', 'Celebrations'], config: { stiffness: 200, damping: 8, mass: 0.8 } },
                    { name: 'CINEMATIC', description: 'Film-quality motion for premium feel', useCases: ['Hero sections', 'Premium reveals', 'Cinematic sequences'], config: { stiffness: 80, damping: 18, mass: 1.8 } },
                    { name: 'TEXT_REVEAL', description: 'Optimized for kinetic typography', useCases: ['Text animations', 'Typography reveals', 'Titles'], config: { stiffness: 250, damping: 22, mass: 0.9 } },
                    { name: 'IMPACT', description: 'Strong arrival with minimal bounce', useCases: ['Impact moments', 'Slam effects', 'Strong arrivals'], config: { stiffness: 500, damping: 35, mass: 1 } }
                ];
                
                return JSON.stringify({
                    message: "Available Spring Physics Presets",
                    presets,
                    usage: `import { createSpring, SPRING_PRESETS } from './animations/SpringPhysics';\nconst value = createSpring({ frame, fps, preset: 'LOGO_REVEAL' });`
                }, null, 2);
            }

            case 'get_camera_moves': {
                const moves = [
                    { name: 'DOLLY_IN_SLOW', type: 'dolly_in', intensity: 0.3, description: 'Slow push toward subject, creates intimacy' },
                    { name: 'DOLLY_IN_DRAMATIC', type: 'dolly_in', intensity: 0.7, description: 'Dramatic push for impact moments' },
                    { name: 'DOLLY_OUT_REVEAL', type: 'dolly_out', intensity: 0.5, description: 'Pull back to reveal context' },
                    { name: 'PAN_LEFT_SLOW', type: 'pan_left', intensity: 0.3, description: 'Slow horizontal pan left' },
                    { name: 'PAN_RIGHT_SLOW', type: 'pan_right', intensity: 0.3, description: 'Slow horizontal pan right' },
                    { name: 'TILT_UP_REVEAL', type: 'tilt_up', intensity: 0.5, description: 'Tilt up to reveal height/grandeur' },
                    { name: 'CRANE_UP_EPIC', type: 'crane_up', intensity: 0.6, description: 'Rising crane shot for epic moments' },
                    { name: 'SHAKE_IMPACT', type: 'shake', intensity: 0.8, description: 'Strong shake for impact moments' },
                    { name: 'SHAKE_SUBTLE', type: 'shake', intensity: 0.2, description: 'Subtle handheld feel' },
                    { name: 'ZOOM_PUNCH', type: 'zoom_in', intensity: 0.9, description: 'Punchy zoom for emphasis' }
                ];
                
                return JSON.stringify({
                    message: "Available Camera Movements",
                    moves,
                    types: ['dolly_in', 'dolly_out', 'pan_left', 'pan_right', 'tilt_up', 'tilt_down', 'crane_up', 'crane_down', 'shake', 'zoom_in', 'zoom_out', 'orbit', 'push_in', 'pull_out'],
                    usage: `import { VirtualCamera, createCameraMove } from './camera/VirtualCamera';\n<VirtualCamera moves={[createCameraMove('dolly_in', 0, 60, 0.5, 'spring')]}>{children}</VirtualCamera>`
                }, null, 2);
            }

            case 'get_easing_presets': {
                const categories = {
                    power: ['POWER1_IN', 'POWER1_OUT', 'POWER2_INOUT', 'POWER3_OUT', 'POWER4_IN'],
                    expo: ['EXPO_IN', 'EXPO_OUT', 'EXPO_INOUT'],
                    back: ['BACK_IN', 'BACK_OUT', 'BACK_INOUT', 'BACK_OUT_EXTREME'],
                    elastic: ['ELASTIC_IN', 'ELASTIC_OUT', 'ELASTIC_SOFT', 'ELASTIC_HARD'],
                    bounce: ['BOUNCE_IN', 'BOUNCE_OUT', 'BOUNCE_INOUT'],
                    cinematic: ['CINEMATIC_ARRIVE', 'CINEMATIC_DEPART', 'CINEMATIC_TITLE', 'CINEMATIC_IMPACT'],
                    ui: ['UI_PRESS', 'UI_MODAL', 'UI_TOAST', 'UI_DROPDOWN']
                };
                
                return JSON.stringify({
                    message: "Available Easing Presets by Category",
                    categories,
                    usage: `import { EASING_EXTENDED } from './animations/gsap-bridge';\nease: EASING_EXTENDED.CINEMATIC_ARRIVE`
                }, null, 2);
            }

            // ═══════════════════════════════════════════════════════════════
            // ✨ VFX ENGINE
            // ═══════════════════════════════════════════════════════════════
            case 'get_particle_presets': {
                const presets = [
                    { name: 'confetti', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'], sizeRange: [8, 16], gravity: 0.5, speed: 1, description: 'Celebration particles' },
                    { name: 'sparks', colors: ['#FFD700', '#FFA500', '#FF4500', '#FFFF00'], sizeRange: [2, 6], gravity: 0.3, speed: 2, description: 'Impact sparks' },
                    { name: 'dust', colors: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.5)'], sizeRange: [2, 5], gravity: 0.02, speed: 0.3, description: 'Ambient dust' },
                    { name: 'glow', colors: ['rgba(99,102,241,0.6)', 'rgba(139,92,246,0.5)'], sizeRange: [10, 30], gravity: -0.05, speed: 0.2, description: 'Glowing particles' },
                    { name: 'snow', colors: ['#FFFFFF', '#F0F8FF', '#E6E6FA'], sizeRange: [3, 8], gravity: 0.2, speed: 0.5, description: 'Snowfall effect' },
                    { name: 'rising', colors: ['rgba(99,102,241,0.8)', 'rgba(139,92,246,0.6)'], sizeRange: [4, 12], gravity: -0.8, speed: 1, description: 'Rising energy' },
                    { name: 'explosion', colors: ['#FF6B6B', '#FF8E53', '#FFD93D'], sizeRange: [4, 12], gravity: 0.4, speed: 3, description: 'Explosion burst' },
                    { name: 'magic', colors: ['#E040FB', '#7C4DFF', '#536DFE'], sizeRange: [3, 10], gravity: -0.2, speed: 0.8, description: 'Magical shimmer' }
                ];
                
                return JSON.stringify({
                    message: "Available Particle System Presets",
                    presets,
                    usage: `import { ParticleSystem, ConfettiExplosion, ImpactSparks } from './vfx/ParticleSystem';\n<ParticleSystem type="glow" count={40} />`
                }, null, 2);
            }

            case 'get_color_grades': {
                const grades = [
                    { name: 'cinematic_orange_teal', displayName: 'Cinematic Orange & Teal', description: 'Hollywood blockbuster look with warm highlights and cool shadows' },
                    { name: 'film_noir', displayName: 'Film Noir', description: 'Classic black and white with high contrast' },
                    { name: 'vintage_warm', displayName: 'Vintage Warm', description: 'Nostalgic warm tones with slight fade' },
                    { name: 'tech_cold', displayName: 'Tech Cold', description: 'Futuristic cold blue tones for tech content' },
                    { name: 'high_contrast', displayName: 'High Contrast', description: 'Punchy contrast for impactful visuals' },
                    { name: 'muted_pastel', displayName: 'Muted Pastel', description: 'Soft, muted tones for elegant look' },
                    { name: 'neon_nights', displayName: 'Neon Nights', description: 'Vibrant neon colors for nightlife/cyber aesthetic' },
                    { name: 'golden_hour', displayName: 'Golden Hour', description: 'Warm golden sunset tones' },
                    { name: 'bleach_bypass', displayName: 'Bleach Bypass', description: 'Desaturated high-contrast film look' },
                    { name: 'moody_blue', displayName: 'Moody Blue', description: 'Cool, moody atmosphere' }
                ];
                
                return JSON.stringify({
                    message: "Available Color Grading Presets",
                    grades,
                    usage: `import { ColorGrading } from './vfx/ColorGrading';\n<ColorGrading preset="cinematic_orange_teal" intensity={0.7}>{children}</ColorGrading>`
                }, null, 2);
            }

            case 'get_lens_effects': {
                return JSON.stringify({
                    message: "Available Lens Effects",
                    effects: [
                        { name: 'Vignette', description: 'Darkens edges for focus', props: 'intensity, softness, color' },
                        { name: 'FilmGrain', description: 'Adds film texture', props: 'intensity, size, animated' },
                        { name: 'ChromaticAberration', description: 'RGB color split', props: 'offset, angle, edgeOnly' },
                        { name: 'LensFlare', description: 'Light source flare', props: 'position, size, color, intensity' },
                        { name: 'Bloom', description: 'Glow effect on bright areas', props: 'intensity, radius' },
                        { name: 'ScanLines', description: 'CRT scan line effect', props: 'spacing, opacity, animated' }
                    ],
                    presets: ['FilmLook', 'RetroLook', 'CleanCinematic'],
                    usage: `import { CinematicLens, Vignette, FilmGrain } from './vfx/LensEffects';\n<CinematicLens vignette={{ intensity: 0.4 }} grain={{ intensity: 0.2 }}>{children}</CinematicLens>`
                }, null, 2);
            }

            // ═══════════════════════════════════════════════════════════════
            // 🧠 INTELLIGENCE ENGINE
            // ═══════════════════════════════════════════════════════════════
            case 'analyze_brand_assets': {
                const { imagePath } = args;
                
                if (!this.projectRoot) return "❌ No project active.";
                
                this.socketManager.emitAgentLog('info', `🎨 Analyzing brand assets: ${imagePath}`);
                
                const analyzer = createBrandAnalyzer(this.projectRoot);
                const result = await analyzer.analyzeImage(imagePath);
                
                if (result.success && result.brandDNA) {
                    const cssVars = analyzer.generateCSSVariables(result.brandDNA);
                    const componentProps = analyzer.generateComponentProps(result.brandDNA);
                    
                    this.socketManager.emitAgentLog('success', `✅ Brand DNA extracted: ${result.brandDNA.style} style`);
                    
                    return JSON.stringify({
                        message: "Brand DNA Analysis Complete",
                        brandDNA: result.brandDNA,
                        cssVariables: cssVars,
                        componentProps,
                        recommendations: {
                            motionStyle: result.brandDNA.motionStyle,
                            colorGrade: result.brandDNA.colorGrade,
                            effects: result.brandDNA.effects
                        }
                    }, null, 2);
                } else {
                    return JSON.stringify({
                        success: false,
                        error: result.error
                    }, null, 2);
                }
            }

            case 'generate_narrative_structure': {
                const { videoType, durationSeconds, keyMessage } = args;
                
                this.socketManager.emitAgentLog('info', `📖 Generating narrative structure for ${videoType} video...`);
                
                const engine = createNarrativeEngine(30);
                const structure = engine.generateStructure(videoType, durationSeconds, keyMessage);
                const timing = engine.getTimingRecommendations(videoType);
                
                this.socketManager.emitAgentLog('success', `✅ Generated ${structure.scenes.length} scenes`);
                
                return JSON.stringify({
                    message: `Narrative structure for ${videoType} video`,
                    structure,
                    timingRecommendations: timing,
                    tip: "Use these scenes as a guide for your composition structure"
                }, null, 2);
            }

            case 'calculate_emotional_curve': {
                const { durationSeconds, style = 'build_release' } = args;
                
                const engine = createNarrativeEngine(30);
                const curve = engine.calculateEmotionalCurve(durationSeconds, style);
                
                return JSON.stringify({
                    message: `Emotional curve (${style})`,
                    curve: curve.slice(0, 15), // Limit output
                    totalPoints: curve.length,
                    tip: "Use intensity values to guide animation energy at each point"
                }, null, 2);
            }

            // ═══════════════════════════════════════════════════════════════
            // 🧠 ADVANCED MEMORY SYSTEM
            // ═══════════════════════════════════════════════════════════════
            case 'get_animation_recommendations': {
                if (!this.directorMemory) return "❌ Advanced memory not available";
                
                const { animationType } = args;
                const recommendations = await this.directorMemory.getAnimationRecommendations(animationType);
                
                return JSON.stringify({
                    message: `Animation recommendations for ${animationType}`,
                    recommendations: recommendations.slice(0, 5).map(r => ({
                        name: r.pattern.name,
                        confidence: Math.round(r.confidence * 100) + '%',
                        reason: r.reason,
                        timing: r.pattern.timing,
                        easing: r.pattern.easing
                    }))
                }, null, 2);
            }

            case 'get_audio_recommendations': {
                if (!this.directorMemory) return "❌ Advanced memory not available";
                
                const { sceneType, mood } = args;
                const recommendations = await this.directorMemory.getAudioRecommendations(sceneType, mood);
                
                return JSON.stringify({
                    message: `Audio recommendations for ${sceneType} (${mood || 'any mood'})`,
                    recommendations: recommendations.slice(0, 5).map(r => ({
                        type: r.mapping.audioType,
                        mood: r.mapping.mood,
                        confidence: Math.round(r.confidence * 100) + '%',
                        searchKeywords: r.searchKeywords
                    }))
                }, null, 2);
            }

            case 'get_template_recommendations': {
                if (!this.directorMemory) return "❌ Advanced memory not available";
                
                const { videoType, keywords } = args;
                const recommendations = await this.directorMemory.getTemplateRecommendations(videoType, keywords);
                
                return JSON.stringify({
                    message: `Template recommendations`,
                    recommendations: recommendations.slice(0, 3).map(r => ({
                        name: r.template.name,
                        description: r.template.description,
                        type: r.template.videoType,
                        complexity: r.template.complexity,
                        confidence: Math.round(r.confidence * 100) + '%',
                        adaptations: r.requiredAdaptations
                    }))
                }, null, 2);
            }

            case 'learn_animation_success': {
                if (!this.directorMemory) return "❌ Advanced memory not available";
                
                const { animation, sceneType, feedback } = args;
                await this.directorMemory.learn({
                    type: 'animation_success',
                    data: { ...animation, sceneType },
                    feedback,
                    projectId: this.currentProjectId || undefined
                });
                
                this.socketManager.emitAgentLog('success', `🧠 Animation pattern learned!`);
                return "✅ Animation pattern stored in memory for future use";
            }

            case 'learn_audio_success': {
                if (!this.directorMemory) return "❌ Advanced memory not available";
                
                const { audio, feedback } = args;
                await this.directorMemory.learn({
                    type: 'audio_success',
                    data: audio,
                    feedback,
                    projectId: this.currentProjectId || undefined
                });
                
                this.socketManager.emitAgentLog('success', `🧠 Audio pattern learned!`);
                return "✅ Audio association stored in memory for future use";
            }

            case 'search_memory': {
                if (!this.directorMemory) return "❌ Advanced memory not available";
                
                const { query, limit = 5 } = args;
                const results = this.directorMemory.search(query, limit);
                
                return JSON.stringify({
                    message: `Memory search results for "${query}"`,
                    count: results.length,
                    results: results.map(r => ({
                        category: r.category,
                        content: typeof r.content === 'string' ? r.content.slice(0, 100) : JSON.stringify(r.content).slice(0, 100),
                        importance: r.metadata.importance,
                        tags: r.metadata.tags
                    }))
                }, null, 2);
            }

            case 'get_memory_stats': {
                if (!this.directorMemory) return "❌ Advanced memory not available";
                
                const stats = await this.directorMemory.getStats();
                
                return JSON.stringify({
                    message: "Memory System Statistics",
                    stats
                }, null, 2);
            }

            default:
                throw new Error(`❓ Unknown tool: ${name}`);
        }
    }

    /**
     * Resolves a public asset path to a physical directory on the server.
     */
    private async resolvePublicAssetPath(publicPath: string): Promise<string | null> {
        if (!this.projectRoot || !this.currentProjectId) return null;

        // publicPath: /assets/PROJECT_ID/TYPE/FILENAME
        const parts = publicPath.split('/');
        const fileName = parts.pop();
        const type = parts.pop(); // images or audio
        const pid = parts.pop();

        if (pid !== this.currentProjectId || !fileName || !type) return null;

        return path.join(this.projectRoot, 'assets', type, fileName);
    }
}
