import { GoogleGenerativeAI } from '@google/generative-ai';
import { SocketManager } from '../socket/SocketManager';
import { SYSTEM_PROMPT } from './systemPrompt';
import { TOOLS } from './tools/registry';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as ts from 'typescript';

const execAsync = promisify(exec);

// Unified Project Brain Memory System
import { ProjectBrain } from './memory/ProjectBrain';

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
    private brain: ProjectBrain | null = null;
    
    // Define workspace roots
    // REMOTION_ROOT: packages/remotion-core (for component library and Root.tsx)
    // PROJECTS_ROOT: root /projects folder (single source of truth for all projects)
    private REMOTION_ROOT = path.resolve(__dirname, '../../../../packages/remotion-core');
    private PROJECTS_ROOT = path.resolve(process.cwd(), '../../projects');

    private currentProjectId: string | null = null;
    private projectRoot: string | null = null;
    private initPromise: Promise<void> | null = null;
    
    // Pending preview info - stored during register_composition, applied on agent:complete
    private pendingPreview: {
        actualExportName: string;
        actualImportPath: string;
        durationInFrames: number;
    } | null = null;

    constructor(socketManager: SocketManager) {
        this.socketManager = socketManager;

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
            // Single source of truth: root /projects/{id}/ folder
            this.projectRoot = path.join(this.PROJECTS_ROOT, projectId);

            // 1.5. Initialize project folder structure if it doesn't exist
            await this.initializeProjectStructure();

            // 2. Initialize ProjectBrain (unified memory system)
            this.brain = new ProjectBrain(this.projectRoot, projectId);
            await this.brain.initialize();
            this.socketManager.emitAgentLog('info', `🧠 ProjectBrain initialized`);

            // 4. Reset AI Session with new context
            // Note: No sync needed - projects folder IS the source of truth
            await this.startNewSession();

            // 5. AUTO-RESUME: If project already has Main.tsx, load preview immediately
            await this.tryResumeExistingProject();

            this.socketManager.emitAgentLog('info', `📂 Switched context to project: ${projectId}`);
        })();

        return this.initPromise;
    }

    /**
     * Initializes the project folder structure for new projects.
     * New simplified structure: projects/{id}/ contains everything
     */
    private async initializeProjectStructure() {
        if (!this.projectRoot) return;

        try {
            // Create folder structure (simplified - single source of truth)
            await fs.mkdir(path.join(this.projectRoot, 'scenes'), { recursive: true });
            await fs.mkdir(path.join(this.projectRoot, 'components'), { recursive: true });
            await fs.mkdir(path.join(this.projectRoot, 'assets', 'images'), { recursive: true });
            await fs.mkdir(path.join(this.projectRoot, 'assets', 'audio'), { recursive: true });
            await fs.mkdir(path.join(this.projectRoot, 'memory'), { recursive: true });

            console.log(`📁 Created initial project structure for ${this.currentProjectId}`);
        } catch (error) {
            console.error('Failed to initialize project structure:', error);
        }
    }

    /**
     * AUTO-RESUME: If the project already has Main.tsx from a previous session,
     * update PreviewEntry.tsx and emit preview:ready so the UI shows the video immediately.
     */
    private async tryResumeExistingProject() {
        if (!this.projectRoot || !this.currentProjectId) return;

        try {
            const mainPath = path.join(this.projectRoot, 'Main.tsx');
            await fs.access(mainPath);

            // Main.tsx exists — this is a previously completed project
            const mainContent = await fs.readFile(mainPath, 'utf-8');
            const exportMatch = mainContent.match(/export\s+const\s+(\w+)\s*[=:]/);
            const componentName = exportMatch ? exportMatch[1] : 'Main';
            const importPath = `@projects/${this.currentProjectId}/Main`;
            const aliasName = `${componentName}_${this.currentProjectId.split('-')[0]}`;

            // Calculate total duration from Main.tsx
            const durationMatches = mainContent.match(/durationInFrames[=:]\s*\{?(\d+)\}?/g) || [];
            let totalDuration = 0;
            for (const match of durationMatches) {
                const num = match.match(/(\d+)/);
                if (num) totalDuration += parseInt(num[1]);
            }
            if (totalDuration === 0) totalDuration = 300;

            // Update Root.tsx (must include registerRoot for Remotion bundler)
            const rootPath = path.join(this.REMOTION_ROOT, 'src/Root.tsx');
            const rootContent = `import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CurrentComposition } from './index';
import { ${componentName} as ${aliasName} } from '${importPath}';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Default"
                component={CurrentComposition}
                durationInFrames={${totalDuration}}
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="${this.currentProjectId}-${componentName}"
                component={${aliasName}}
                durationInFrames={${totalDuration}}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};

registerRoot(RemotionRoot);
`;
            await fs.writeFile(rootPath, rootContent, 'utf-8');

            // Update PreviewEntry.tsx
            const previewPath = path.join(this.REMOTION_ROOT, 'src/PreviewEntry.tsx');
            const previewContent = `import { ${componentName} as CurrentComp } from '${importPath}';\n\nexport const CurrentComposition = CurrentComp;\nexport const currentProps = {};\nexport const currentDuration = ${totalDuration}; // Resumed from existing project\n`;
            await fs.writeFile(previewPath, previewContent, 'utf-8');

            // Emit preview:ready so frontend unlocks the player
            this.socketManager.emit('preview:ready', {
                componentName,
                importPath,
                resumed: true,
                timestamp: Date.now()
            });

            console.log(`✅ [RESUME] Project ${this.currentProjectId} has existing Main.tsx — preview loaded`);
            this.socketManager.emitAgentLog('success', `🎬 Existing project loaded — preview ready`);

        } catch {
            // Main.tsx doesn't exist — this is a new project, nothing to resume
            console.log(`📋 [RESUME] No Main.tsx found — fresh project`);
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
                // Force tool usage - AUTO means Gemini decides, but we hint strongly
                toolConfig: {
                    functionCallingConfig: {
                        mode: "AUTO" as any
                    }
                }
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
        const files = this.brain ? this.brain.getFiles() : [];
        if (files.length > 0) {
            context += `### Existing Files:\n`;
            files.forEach((f: string) => context += `- ${f}\n`);
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
            if (this.brain) await this.brain.reset();
            await this.startNewSession();
            this.socketManager.emitAgentLog('info', '♻️ Project Session Reset.');
        }
    }

    public async processPrompt(prompt: string, duration: number = 10, assets: Array<{ buffer: Buffer, mimetype: string }> = []) {
        if (this.initPromise) {
            await this.initPromise;
        }

        if (!this.chatSession) {
            this.socketManager.emitAgentLog('error', 'No active session. Please select a project first.');
            return;
        }

        this.socketManager.emitAgentThinking(`Processing Project ${this.currentProjectId || 'Global'}...`);

        try {
            // Inject FRESH Memory Context from ProjectBrain
            let memoryContext = '';
            if (this.brain) {
                memoryContext = this.brain.getContextForPrompt();
                this.brain.addConversation('user', prompt);
            }
            
            // Add duration requirement to prompt
            const durationFrames = duration * 30; // 30fps
            const durationInstruction = `\n\n⏱️ **REQUIRED VIDEO DURATION: ${duration} seconds (${durationFrames} frames at 30fps)**\nYou MUST create a video that is exactly ${duration} seconds long. Plan your scenes accordingly to fill this duration.`;
            const fullPrompt = `${prompt}${durationInstruction}\n\n${memoryContext}`;

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

            console.log('🚀 [DEBUG] Sending prompt to Gemini...');
            let result = await this.chatSession.sendMessage(messageParts);
            let response = result.response;
            let text = response.text();

            // If there's text, emit it and record in memory
            if (text) {
                console.log('💬 [DEBUG] Gemini response:', text.substring(0, 300));
                this.socketManager.emitAgentLog('info', text);
                // Record assistant response in brain
                if (this.brain) {
                    this.brain.addConversation('assistant', text);
                }
            }

            // Handle Function Calls (Multi-turn loop)
            let functionCalls = response.functionCalls();
            console.log(`🔧 [DEBUG] Initial function calls: ${functionCalls?.length || 0}`);

            let loopCount = 0;
            while (functionCalls && functionCalls.length > 0) {
                loopCount++;
                console.log(`🔄 [DEBUG] Function call loop #${loopCount}, calls: ${functionCalls.map((c: any) => c.name).join(', ')}`);
                const functionResponses = [];

                for (const call of functionCalls) {
                    let { name, args } = call;

                    // --- FIX GEMINI TOOL NAME TYPOS ---
                    // Gemini sometimes doubles underscores or letters in tool names
                    const originalName = name;
                    name = name.replace(/__+/g, '_');  // fetch__audio → fetch_audio
                    name = name.replace(/([a-z])\1{2,}/g, '$1$1'); // fetchhh → fetchh (safety)
                    if (name !== originalName) {
                        console.log(`🔧 Fixed tool name typo: ${originalName} → ${name}`);
                    }

                    // --- FIX GEMINI TOOL ARGUMENT KEY TYPOS ---
                    // Gemini doubles characters in parameter keys (packkages, componenttName, etc.)
                    args = this.fixGeminiArgKeys(args);

                    console.log(`⚙️ [DEBUG] Executing tool: ${name}`, JSON.stringify(args).substring(0, 200));

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
                        
                        // Record failed action in brain
                        if (this.brain) {
                            this.brain.recordAction(name, 'fail', args.path, err.message);
                        }
                        
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
                
                // 🔍 DEBUG: Log if agent stopped requesting tools
                if (!functionCalls || functionCalls.length === 0) {
                    console.log('⚠️ [DEBUG] Agent stopped requesting function calls');
                    console.log('⚠️ [DEBUG] Last response text:', text?.substring(0, 200));
                    
                    // Check if essential files exist
                    if (this.projectRoot) {
                        const scenesPath = path.join(this.projectRoot, 'scenes');
                        const mainPath = path.join(this.projectRoot, 'Main.tsx');
                        
                        try {
                            const sceneFiles = await fs.readdir(scenesPath);
                            const mainExists = await fs.access(mainPath).then(() => true).catch(() => false);
                            
                            console.log(`📁 [DEBUG] Scenes folder has ${sceneFiles.length} files:`, sceneFiles);
                            console.log(`📁 [DEBUG] Main.tsx exists: ${mainExists}`);
                            
                            // 🔧 AUTO-RETRY: If Main.tsx is missing, nudge the agent to continue
                            // Note: We don't enforce a minimum scene count - the agent decides based on the prompt
                            if (!mainExists && loopCount < 50) {
                                console.log('🔄 [RETRY] Main.tsx missing - nudging agent to continue...');
                                this.socketManager.emitAgentLog('info', '🔄 Continuing file creation...');
                                
                                // Send a nudge message to continue
                                const nudgeResult = await this.chatSession.sendMessage([{
                                    text: `⚠️ You stopped but Main.tsx is NOT created yet!

Current state:
- Scene files: ${sceneFiles.length} in scenes/
- Main.tsx: MISSING

You MUST continue NOW:
1. If you haven't created scenes yet, create them in scenes/ folder
2. Create Main.tsx to compose everything
3. Call validate_syntax
4. Call register_composition
5. Call deploy_project

Continue with the next write_file call NOW.`
                                }]);
                                
                                response = nudgeResult.response;
                                text = response.text();
                                functionCalls = response.functionCalls();
                                
                                if (functionCalls && functionCalls.length > 0) {
                                    console.log('✅ [RETRY] Agent resumed with', functionCalls.length, 'function calls');
                                    continue; // Continue the loop
                                }
                            } else if (!mainExists) {
                                console.error('🔴 [ERROR] Agent stopped but Main.tsx is missing!');
                                this.socketManager.emitAgentLog('error', '❌ Main.tsx was not created! The agent stopped too early.');
                            }
                        } catch (e) {
                            console.log('📁 [DEBUG] Could not check project files:', e);
                        }
                    }
                }
            }

            // Finalize preview before completing - this writes PreviewEntry.tsx
            const previewFinalized = await this.finalizePreview();
            
            // 🔍 DEBUG: Final check before completion
            console.log('✅ [DEBUG] Agent completing. Checking final state...');
            if (this.projectRoot && this.currentProjectId) {
                try {
                    const scenesPath = path.join(this.projectRoot, 'scenes');
                    const mainPath = path.join(this.projectRoot, 'Main.tsx');
                    const sceneFiles = await fs.readdir(scenesPath);
                    const mainExists = await fs.access(mainPath).then(() => true).catch(() => false);
                    
                    console.log(`📊 [FINAL] Project: ${this.currentProjectId}`);
                    console.log(`📊 [FINAL] Scene files: ${sceneFiles.length} (${sceneFiles.join(', ')})`);
                    console.log(`📊 [FINAL] Main.tsx: ${mainExists ? '✅' : '❌'}`);
                    console.log(`📊 [FINAL] previewFinalized: ${previewFinalized ? '✅' : '❌'}`);
                    
                    if (!mainExists) {
                        this.socketManager.emitAgentLog('error', '❌ Main.tsx was not created! The agent stopped too early.');
                    } else if (sceneFiles.length === 0) {
                        this.socketManager.emitAgentLog('warning', '⚠️ No scene files in scenes/ folder - agent may have used a different structure.');
                    }
                    
                    // 🔧 FALLBACK: Only if Main.tsx exists AND finalizePreview didn't already handle it
                    if (mainExists && !previewFinalized) {
                        console.log('🔧 [FALLBACK] Main.tsx exists but no preview registered. Auto-registering...');
                        this.socketManager.emitAgentLog('info', '🔧 Auto-registering preview...');
                        
                        try {
                            const mainContent = await fs.readFile(mainPath, 'utf-8');
                            const exportMatch = mainContent.match(/export\s+const\s+(\w+)\s*[=:]/);
                            const componentName = exportMatch ? exportMatch[1] : 'Main';
                            const importPath = `@projects/${this.currentProjectId}/Main`;
                            const aliasName = `${componentName}_${this.currentProjectId.split('-')[0]}`;
                            
                            // Calculate total duration from Main.tsx durationInFrames
                            const durationMatches = mainContent.match(/durationInFrames[=:]\s*\{?(\d+)\}?/g) || [];
                            let totalDuration = 0;
                            for (const match of durationMatches) {
                                const num = match.match(/(\d+)/);
                                if (num) totalDuration += parseInt(num[1]);
                            }
                            // Fallback to 300 (10s) if no duration found
                            if (totalDuration === 0) totalDuration = 300;
                            console.log(`📊 [FALLBACK] Calculated duration: ${totalDuration} frames`);
                            
                            // Update Root.tsx (must include registerRoot for Remotion bundler)
                            const rootPath = path.join(this.REMOTION_ROOT, 'src/Root.tsx');
                            const rootContent = `import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CurrentComposition } from './index';
import { ${componentName} as ${aliasName} } from '${importPath}';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Default"
                component={CurrentComposition}
                durationInFrames={${totalDuration}}
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="${this.currentProjectId}-${componentName}"
                component={${aliasName}}
                durationInFrames={${totalDuration}}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};

registerRoot(RemotionRoot);
`;
                            await fs.writeFile(rootPath, rootContent, 'utf-8');
                            
                            // Update PreviewEntry.tsx
                            const previewPath = path.join(this.REMOTION_ROOT, 'src/PreviewEntry.tsx');
                            const previewContent = `import { ${componentName} as CurrentComp } from '${importPath}';\n\nexport const CurrentComposition = CurrentComp;\nexport const currentProps = {};\nexport const currentDuration = ${totalDuration}; // Calculated from Main.tsx\n`;
                            await fs.writeFile(previewPath, previewContent, 'utf-8');
                            
                            this.socketManager.emitAgentLog('success', '🎬 Preview activated!');
                            this.socketManager.emit('preview:ready', {
                                componentName,
                                importPath,
                                timestamp: Date.now()
                            });
                            
                            console.log('✅ [FALLBACK] Preview registered successfully');
                        } catch (fallbackError: any) {
                            console.error('❌ [FALLBACK] Failed to auto-register preview:', fallbackError.message);
                            this.socketManager.emitAgentLog('warning', `⚠️ Could not auto-register preview: ${fallbackError.message}`);
                        }
                    }
                } catch (e) {
                    console.error('[FINAL] Error checking project state:', e);
                }
            }
            
            this.socketManager.emitAgentLog('success', 'Task completed.');
            this.socketManager.emit('agent:complete', { success: true });

        } catch (error: any) {
            console.error("Gemini Error:", error);
            this.socketManager.emitAgentLog('error', `AI Error: ${error.message}`);
            this.socketManager.emit('agent:complete', { success: false, error: error.message });
        }
    }
    
    /**
     * Finalizes the preview by writing PreviewEntry.tsx with the pending composition.
     * Called only when the agent completes successfully.
     */
    private async finalizePreview(): Promise<boolean> {
        if (!this.pendingPreview) {
            this.socketManager.emitAgentLog('info', '📋 No pending preview to finalize');
            return false;
        }
        
        const { actualExportName, actualImportPath, durationInFrames } = this.pendingPreview;
        
        try {
            const previewPath = path.join(this.REMOTION_ROOT, 'src/PreviewEntry.tsx');
            const previewContent = `import { ${actualExportName} as CurrentComp } from '${actualImportPath}';\n\nexport const CurrentComposition = CurrentComp;\nexport const currentProps = {};\nexport const currentDuration = ${durationInFrames}; // Updated by agent\n`;
            await fs.writeFile(previewPath, previewContent, 'utf-8');
            
            this.socketManager.emitAgentLog('success', '🎬 Preview activated!');
            
            // Emit preview:ready event so frontend knows it's safe to display
            this.socketManager.emit('preview:ready', {
                componentName: actualExportName,
                importPath: actualImportPath,
                timestamp: Date.now()
            });
            
            // Clear pending preview
            this.pendingPreview = null;
            return true;
        } catch (error: any) {
            this.socketManager.emitAgentLog('error', `Failed to finalize preview: ${error.message}`);
            return false;
        }
    }

    // Helper to check similarity between two UUIDs (for fixing Gemini typos)
    private checkIdSimilarity(corrupted: string, correct: string): number {
        let matches = 0;
        const minLen = Math.min(corrupted.length, correct.length);
        for (let i = 0; i < minLen; i++) {
            if (corrupted[i] === correct[i]) matches++;
        }
        return matches / correct.length;
    }

    // All known tool parameter names (used for arg key typo correction)
    private static readonly KNOWN_ARG_KEYS = new Set([
        'path', 'content', 'edits', 'startLine', 'endLine', 'newContent',
        'command', 'packages', 'reason', 'componentName', 'importPath',
        'durationInFrames', 'fps', 'width', 'height', 'entry', 'context',
        'choice', 'message', 'query', 'limit', 'type', 'per_page', 'url',
        'filename', 'assetType', 'soundId', 'prompt', 'scenes', 'totalFrames',
        'mood', 'category', 'keywords', 'timing', 'duration', 'audioPlan',
        'animationType', 'sceneType', 'animation', 'feedback', 'audio',
        'videoType', 'durationSeconds', 'keyMessage', 'style', 'name',
        'fileName', 'startFrame', 'endFrame', 'description', 'needed',
        'frame', 'scene', 'section', 'data', 'plugin', 'topic', 'imagePath',
        'bgmDecision', 'sfxPlan', 'hasText', 'per_page',
    ]);

    /**
     * Fixes Gemini's doubled characters in tool argument keys.
     * e.g. "packkages" → "packages", "componenttName" → "componentName"
     * Recursively tries removing one doubled char at a time until a known key is found.
     */
    private fixGeminiArgKeys(args: any): any {
        if (!args || typeof args !== 'object' || Array.isArray(args)) return args;

        const fixed: any = {};
        for (const [key, value] of Object.entries(args)) {
            if (AgentCore.KNOWN_ARG_KEYS.has(key)) {
                // Key is valid — recursively fix nested objects
                fixed[key] = (value && typeof value === 'object' && !Array.isArray(value))
                    ? this.fixGeminiArgKeys(value) : value;
            } else {
                // Try removing each doubled character to find a known key
                const corrected = this.tryFixArgKey(key, 0);
                if (corrected && corrected !== key) {
                    console.log(`🔧 Fixed arg key typo: ${key} → ${corrected}`);
                    fixed[corrected] = (value && typeof value === 'object' && !Array.isArray(value))
                        ? this.fixGeminiArgKeys(value) : value;
                } else {
                    // Unknown key — keep as-is
                    fixed[key] = value;
                }
            }
        }
        return fixed;
    }

    private tryFixArgKey(key: string, depth: number): string | null {
        if (depth > 5) return null; // prevent infinite recursion
        if (AgentCore.KNOWN_ARG_KEYS.has(key)) return key;

        for (let i = 0; i < key.length - 1; i++) {
            if (key[i] === key[i + 1]) {
                const candidate = key.slice(0, i) + key.slice(i + 1);
                const result = this.tryFixArgKey(candidate, depth + 1);
                if (result) return result;
            }
        }
        return null;
    }

    // TypeScript AST validation for TSX/JSX files
    /**
     * Fixes common Gemini character-doubling typos in code content.
     * Shared by write_file, atomic_edit, and any other tool that writes code.
     */
    private fixGeminiTypos(content: string): string {
        // Pre-pass: fix \nnimport (Gemini adds extra 'n' before import on new lines)
        content = content.replace(/\nnimport\s/g, '\nimport ');
        // Pre-pass: fix \nniimport, \nnfrom etc
        content = content.replace(/\nnfrom\s/g, '\nfrom ');
        content = content.replace(/\nnexport\s/g, '\nexport ');
        content = content.replace(/\nnconst\s/g, '\nconst ');

        const typoFixes: [RegExp, string][] = [
            // === IMPORT/EXPORT/CONST KEYWORDS ===
            [/immport/g, 'import'],
            [/imporrt/g, 'import'],
            [/impport/g, 'import'],
            [/iimport/g, 'import'],
            [/importt\s/g, 'import '],
            [/frrom/g, 'from'],
            [/ffrom/g, 'from'],
            [/fromm\s/g, 'from '],
            [/constt\s/g, 'const '],
            [/cconst\s/g, 'const '],
            [/exporrt/g, 'export'],
            [/eexport/g, 'export'],
            [/rreturn/g, 'return'],
            // === REACT MODULE NAME ===
            [/Reacct/g, 'React'],
            [/Reeact/g, 'React'],
            [/Reactt\b/g, 'React'],
            // === REACT HOOKS (doubled 'u' AND doubled internal letters) ===
            [/uuseRef/g, 'useRef'],
            [/uuseMemo/g, 'useMemo'],
            [/uuseEffect/g, 'useEffect'],
            [/uuseState/g, 'useState'],
            [/uuseCallback/g, 'useCallback'],
            [/uuseContext/g, 'useContext'],
            [/usseRef/g, 'useRef'],
            [/usseMemo/g, 'useMemo'],
            [/usseEffect/g, 'useEffect'],
            [/usseState/g, 'useState'],
            [/usseCallback/g, 'useCallback'],
            [/useRRef/g, 'useRef'],
            [/useReff\b/g, 'useRef'],
            [/useMemoo\b/g, 'useMemo'],
            [/useEffectt\b/g, 'useEffect'],
            [/useStatee\b/g, 'useState'],
            // === REMOTION HOOKS ===
            [/useCuurrentFrame/g, 'useCurrentFrame'],
            [/useCurrrentFrame/g, 'useCurrentFrame'],
            [/useCurrentFrrame/g, 'useCurrentFrame'],
            [/useCurrentFramee\b/g, 'useCurrentFrame'],
            [/useCurrentFramme/g, 'useCurrentFrame'],
            [/uuseCurrentFrame/g, 'useCurrentFrame'],
            [/useVideoConfigg\b/g, 'useVideoConfig'],
            [/useVideooConfig/g, 'useVideoConfig'],
            [/uuseVideoConfig/g, 'useVideoConfig'],
            // === REMOTION COMPONENTS ===
            [/AbsoluteFilll/g, 'AbsoluteFill'],
            [/AbsoluteFil(?!l)/g, 'AbsoluteFill'],
            [/AAbsoluteFill/g, 'AbsoluteFill'],
            [/Sequeence/g, 'Sequence'],
            [/Sequencce/g, 'Sequence'],
            [/SSequence/g, 'Sequence'],
            [/Compositionn/g, 'Composition'],
            [/CComposition/g, 'Composition'],
            // === REMOTION FUNCTIONS ===
            [/staticFille/g, 'staticFile'],
            [/sttaticFile/g, 'staticFile'],
            [/staticFFile/g, 'staticFile'],
            [/interpolatte/g, 'interpolate'],
            [/iinterpolate/g, 'interpolate'],
            [/interpolatee\b/g, 'interpolate'],
            [/springg\b/g, 'spring'],
            [/sspring/g, 'spring'],
            [/Easingg\b/g, 'Easing'],
            [/EEasing/g, 'Easing'],
            // === AUDIO ===
            [/Auudio/g, 'Audio'],
            [/Audioo\b/g, 'Audio'],
            [/Audiio/g, 'Audio'],
            [/AAudio/g, 'Audio'],
            // === GSAP SPECIFIC ===
            [/CustomBouunce/g, 'CustomBounce'],
            [/CustomBouncce/g, 'CustomBounce'],
            [/CCustomBounce/g, 'CustomBounce'],
            [/CustomEasse/g, 'CustomEase'],
            [/CCustomEase/g, 'CustomEase'],
            [/DrawSVGPluginn/g, 'DrawSVGPlugin'],
            [/SplitTextt\b/g, 'SplitText'],
            [/SSplitText/g, 'SplitText'],
            [/ScrambleTextPluginn/g, 'ScrambleTextPlugin'],
            [/registerPluginn/g, 'registerPlugin'],
            // === THREE.JS / R3F SPECIFIC ===
            [/ThreeCanvass\b/g, 'ThreeCanvas'],
            [/TThreeCanvas/g, 'ThreeCanvas'],
            [/ThreeCanvaas/g, 'ThreeCanvas'],
            [/ambientLightt\b/g, 'ambientLight'],
            [/pointLightt\b/g, 'pointLight'],
            [/directionalLightt\b/g, 'directionalLight'],
            [/meshStandardMateriall\b/g, 'meshStandardMaterial'],
            [/meshBasicMateriall\b/g, 'meshBasicMaterial'],
            [/boxGeometryy\b/g, 'boxGeometry'],
            [/sphereGeometryy\b/g, 'sphereGeometry'],
            [/instancedMeshh\b/g, 'instancedMesh'],
            [/MeshDistortMateriall\b/g, 'MeshDistortMaterial'],
            [/MeshWobbleMateriall\b/g, 'MeshWobbleMaterial'],
            // === MODULE NAME TYPOS (in string literals) ===
            [/@remotion\/threee/g, '@remotion/three'],
            [/@remotion\/tthree/g, '@remotion/three'],
            [/@react-three\/fiberr/g, '@react-three/fiber'],
            [/@react-three\/fibeer/g, '@react-three/fiber'],
            [/@react-three\/fiiber/g, '@react-three/fiber'],
            [/@react-three\/dreii/g, '@react-three/drei'],
            [/@react-three\/ddrei/g, '@react-three/drei'],
            [/'rreact'/g, "'react'"],
            [/"rreact"/g, '"react"'],
            [/'reemotoin'/g, "'remotion'"],
            [/'remotionn'/g, "'remotion'"],
            [/'remotiion'/g, "'remotion'"],
            // === REACT IMPORT QUOTE TYPOS ===
            [/from 'react'';/g, "from 'react';"],
            [/from ''react'/g, "from 'react'"],
            [/from "react"";/g, 'from "react";'],
            [/from ""react"/g, 'from "react"'],
            [/fromm 'react'/g, "from 'react'"],
            [/fromm "react"/g, 'from "react"'],
            [/Reaact/g, 'React'],
            [/RReact/g, 'React'],
            // === PARAMETER TYPOS ===
            [/durationInFraames/g, 'durationInFrames'],
            [/durationInFramess/g, 'durationInFrames'],
            [/ddurationInFrames/g, 'durationInFrames'],
            [/importPathh/g, 'importPath'],
            [/imporrtPath/g, 'importPath'],
            [/iimportPath/g, 'importPath'],
            [/componenntName/g, 'componentName'],
            [/componentNamee/g, 'componentName'],
            [/extrapolateeLeft/g, 'extrapolateLeft'],
            [/extrapolateRightt/g, 'extrapolateRight'],
            // === CSS PROPERTY TYPOS ===
            [/zInndex/g, 'zIndex'],
            [/zIndexx/g, 'zIndex'],
            [/borderRadiuss/g, 'borderRadius'],
            [/backgroundd/g, 'background'],
            [/backgroundColorr/g, 'backgroundColor'],
            [/fontSizee/g, 'fontSize'],
            [/fontWeightt/g, 'fontWeight'],
            [/fontFamilyy/g, 'fontFamily'],
            [/textAlignn/g, 'textAlign'],
            [/textShadoww/g, 'textShadow'],
            [/overfloww/g, 'overflow'],
            // === SERIES/SEQUENCE/IMG ===
            [/Seriees/g, 'Series'],
            [/Seriess/g, 'Series'],
            [/Seriies/g, 'Series'],
            [/SSeries/g, 'Series'],
            [/Imgg\b/g, 'Img'],
            [/IImg/g, 'Img'],
            // === REMOTION API ===
            [/rrandom\b/g, 'random'],
            [/ranndom/g, 'random'],
            // === STRUCTURAL FIXES ===
            [/,\s*,/g, ','],
            [/;;\s*$/gm, ';'],
            [/  +/g, ' '],
        ];

        let fixCount = 0;
        for (const [pattern, replacement] of typoFixes) {
            const before = content;
            content = content.replace(pattern, replacement);
            if (before !== content) fixCount++;
        }

        // === DOUBLE COMMA FIX (common Gemini artifact) ===
        content = content.replace(/,,\s*/g, ', ');

        // === JSX AUTO-BALANCE: remove extra closing tags (Gemini's most common structural error) ===
        for (const tag of ['AbsoluteFill', 'div', 'span', 'Sequence', 'Series', 'g', 'svg']) {
            const escapedTag = tag.replace('.', '\\.');
            let opens = (content.match(new RegExp(`<${escapedTag}(?:\\s|>)`, 'g')) || []).length;
            let closes = (content.match(new RegExp(`<\\/${escapedTag}>`, 'g')) || []).length;
            while (closes > opens) {
                const lastIdx = content.lastIndexOf(`</${tag}>`);
                if (lastIdx < 0) break;
                content = content.substring(0, lastIdx) + content.substring(lastIdx + `</${tag}>`.length);
                closes--;
                fixCount++;
            }
        }

        if (fixCount > 0) {
            this.socketManager.emitAgentLog('info', `🔧 Fixed ${fixCount} Gemini typos`);
        }

        return content;
    }

    private validateTypeScriptSyntax(code: string, fileName: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Create a source file from the code
        const sourceFile = ts.createSourceFile(
            fileName,
            code,
            ts.ScriptTarget.Latest,
            true,
            fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
        );

        // Check for parse errors using diagnostics
        const compilerOptions: ts.CompilerOptions = {
            jsx: ts.JsxEmit.React,
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.ESNext,
            strict: false,
            noEmit: true,
            skipLibCheck: true,
        };

        // Create a simple program to check syntax
        const host = ts.createCompilerHost(compilerOptions);
        const originalGetSourceFile = host.getSourceFile;
        host.getSourceFile = (name, languageVersion) => {
            if (name === fileName) return sourceFile;
            return originalGetSourceFile(name, languageVersion);
        };

        const program = ts.createProgram([fileName], compilerOptions, host);
        const syntacticDiagnostics = program.getSyntacticDiagnostics(sourceFile);

        for (const diagnostic of syntacticDiagnostics) {
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            const line = diagnostic.file ? 
                ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start || 0).line + 1 : 0;
            errors.push(`Line ${line}: ${message}`);
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Validates JSX/TSX content for syntax errors.
     * Shared by write_file, atomic_edit, validate_syntax, and deploy_project.
     * Returns list of errors (empty = valid).
     */
    private validateJSXContent(content: string, filePath: string): string[] {
        const syntaxErrors: string[] = [];

        if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return [];

        // 1. React import check
        if (!content.includes("from 'react'") && !content.includes('from "react"')) {
            syntaxErrors.push("Missing React import");
        }

        // 2. COMPREHENSIVE JSX TAG BALANCE CHECK
        // Tags that are ALWAYS self-closing (never have children) — skip balance check
        const alwaysSelfClosing = new Set([
            'Audio', 'Video', 'Img',
            // R3F geometry & material (intrinsic elements, always self-closing)
            'boxGeometry', 'sphereGeometry', 'planeGeometry', 'cylinderGeometry',
            'meshStandardMaterial', 'meshBasicMaterial', 'meshPhongMaterial',
            'ambientLight', 'pointLight', 'directionalLight', 'spotLight',
            // SVG self-closing
            'stop', 'feGaussianBlur',
        ]);

        const jsxTags = [
            'AbsoluteFill', 'Sequence', 'Series', 'Series.Sequence',
            'Audio', 'Video', 'Img', 'div', 'span', 'svg', 'path',
            'g', 'rect', 'circle', 'text', 'defs', 'linearGradient',
            'radialGradient', 'stop', 'filter', 'feGaussianBlur',
            // Three.js / R3F elements
            'ThreeCanvas', 'mesh', 'group', 'instancedMesh',
        ];

        for (const tag of jsxTags) {
            if (alwaysSelfClosing.has(tag)) continue;

            const escapedTag = tag.replace('.', '\\.');
            // Count ALL openings (including self-closing like <Tag ... />)
            const allOpenings = (content.match(new RegExp(`<${escapedTag}(?:\\s|>|$)`, 'gm')) || []).length;
            const closings = (content.match(new RegExp(`<\\/${escapedTag}>`, 'g')) || []).length;

            // Only error if MORE closing tags than opening tags (definite structural bug)
            // Self-closing tags are included in allOpenings count, so this is safe
            if (closings > allOpenings) {
                syntaxErrors.push(`<${tag}>: ${allOpenings} opening (incl. self-closing), ${closings} closing — remove ${closings - allOpenings} extra </${tag}>`);
            }
        }

        // 3. Bracket balance checks (±1 tolerance for template literals & interpolate options)
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        if (Math.abs(openBraces - closeBraces) > 1) {
            syntaxErrors.push(`Braces: { = ${openBraces}, } = ${closeBraces}`);
        }

        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        if (Math.abs(openParens - closeParens) > 1) {
            syntaxErrors.push(`Parentheses: ( = ${openParens}, ) = ${closeParens}`);
        }

        const openBrackets = (content.match(/\[/g) || []).length;
        const closeBrackets = (content.match(/\]/g) || []).length;
        if (Math.abs(openBrackets - closeBrackets) > 1) {
            syntaxErrors.push(`Brackets: [ = ${openBrackets}, ] = ${closeBrackets}`);
        }

        // 4. Check for common Gemini mistakes
        if (content.includes('< /') || content.includes('< >')) {
            syntaxErrors.push("Invalid JSX: space after <");
        }
        if (content.match(/=\s*\{\s*\{[^{]/g) && !content.includes('style={{')) {
            const doubleBraceCount = (content.match(/=\s*\{\s*\{/g) || []).length;
            const styleCount = (content.match(/style\s*=\s*\{\{/g) || []).length;
            if (doubleBraceCount > styleCount + 2) {
                syntaxErrors.push("Suspicious double braces {{ outside style objects");
            }
        }

        // 5. Check for ORPHANED ATTRIBUTES (src={...} without a tag)
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (/^(src|onClick|onMouseEnter|onMouseLeave|href|alt|className|id|key|ref)\s*=\s*[\{'"]/
                .test(line)) {
                let prevLine = '';
                for (let j = i - 1; j >= 0; j--) {
                    if (lines[j].trim()) {
                        prevLine = lines[j].trim();
                        break;
                    }
                }
                const isValidJSXContext = !prevLine ||
                    prevLine.endsWith(',') ||
                    prevLine.endsWith('{') ||
                    prevLine.endsWith('>') ||
                    prevLine.endsWith('(') ||
                    /^<\w/.test(prevLine) ||
                    prevLine.endsWith('}') ||
                    prevLine.endsWith('}}') ||
                    prevLine.endsWith('"') ||
                    prevLine.endsWith("'") ||
                    prevLine.endsWith('/>') ||
                    /^\w[\w.]*\s*=/.test(prevLine);

                const isOrphaned = !isValidJSXContext && (
                    prevLine.endsWith(';') ||
                    prevLine.endsWith('*/') ||
                    /^(const|let|var)\s/.test(prevLine) ||
                    /^\)/.test(prevLine)
                );

                if (isOrphaned) {
                    syntaxErrors.push(`Orphaned attribute at line ${i + 1}: "${line.substring(0, 40)}..."`);
                }
            }
        }

        // 6. Export check
        if (!content.includes('export const') && !content.includes('export default') && !content.includes('export function')) {
            syntaxErrors.push("Missing export statement");
        }

        // 7. TypeScript AST check — ALWAYS run as authoritative validator
        // The TS compiler correctly handles braces in template literals, strings, and comments
        const tsValidation = this.validateTypeScriptSyntax(content, filePath);
        if (!tsValidation.valid) {
            syntaxErrors.push(...tsValidation.errors);
        }

        return syntaxErrors;
    }

    private async executeTool(name: string, args: any): Promise<any> {
        // --- STRICT PROJECT ISOLATION ---
        // All project files are stored in projects/{id}/ (single source of truth)
        // Agent can ONLY write to its own project folder

        const getSecurePath = (p: string) => {
            // Clean up the path - remove any leading ./ or path prefixes
            let clean = p.replace(/^\.\//, '').replace(/^src\//, '');

            // All files go into the project folder
            if (this.projectRoot) {
                return path.join(this.projectRoot, clean);
            }
            
            // Fallback to remotion-core (should not happen during normal operation)
            return path.join(this.REMOTION_ROOT, clean);
        };

        switch (name) {
            case 'write_file': {
                const filePath = getSecurePath(args.path);
                let content = args.content as string;

                // --- AUTO-DETECT & INSTALL EXTERNAL PACKAGES ---
                if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
                    // Known built-in packages that don't need installation
                    const builtInPackages = new Set([
                        'react', 'react-dom', 'remotion', 
                        '@remotion/cli', '@remotion/bundler', '@remotion/renderer',
                        '@remotion/player', '@remotion/lambda', '@remotion/gif',
                        '@remotion/media-utils', '@remotion/paths', '@remotion/shapes',
                        '@remotion/noise', '@remotion/transitions', '@remotion/google-fonts',
                        '@remotion/media', '@remotion/three',
                        // Already installed at root level (package.json)
                        'gsap', 'three', '@react-three/fiber', '@react-three/drei',
                        '@types/three', 'zustand',
                        // Node built-ins
                        'path', 'fs', 'util', 'crypto', 'os', 'stream', 'events', 'buffer'
                    ]);

                    // Extract all imports from the content
                    const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"./][^'"]*)['"]/g;
                    const externalPackages = new Set<string>();
                    let match;
                    
                    while ((match = importRegex.exec(content)) !== null) {
                        const pkg = match[1];
                        // Get the base package name (for scoped packages like @emotion/styled)
                        const basePkg = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
                        
                        if (!builtInPackages.has(basePkg) && !builtInPackages.has(pkg)) {
                            externalPackages.add(basePkg);
                        }
                    }

                    // Auto-install detected packages
                    if (externalPackages.size > 0) {
                        const packagesToInstall = Array.from(externalPackages);
                        this.socketManager.emitAgentLog('info', `📦 Auto-detected external packages: ${packagesToInstall.join(', ')}`);
                        
                        try {
                            const rootDir = path.resolve(this.PROJECTS_ROOT, '..');
                            const packageList = packagesToInstall.join(' ');
                            
                            this.socketManager.emitAgentLog('info', `📦 Auto-installing: ${packageList}...`);
                            
                            await execAsync(`pnpm add -w ${packageList}`, {
                                cwd: rootDir,
                                timeout: 120000
                            });
                            
                            this.socketManager.emitAgentLog('success', `✅ Auto-installed: ${packageList}`);
                        } catch (installError: any) {
                            this.socketManager.emitAgentLog('warning', `⚠️ Auto-install failed: ${installError.message}. Continuing anyway...`);
                        }
                    }
                }

                // --- FIX GEMINI TYPOS & NORMALIZE CODE ---
                if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
                    // Normalize line endings
                    content = content.replace(/\r\n/g, '\n');
                    
                    // FIX COMMON GEMINI TYPOS using shared method
                    content = this.fixGeminiTypos(content);
                    
                    // Remove leading empty lines, ensure trailing newline
                    content = content.replace(/^\n+/, '').trimEnd() + '\n';

                    // --- FIX CORRUPTED PROJECT IDs IN ASSET PATHS ---
                    // Gemini sometimes corrupts UUIDs in staticFile() paths:
                    // - Drops characters (7a9029cb -> 7a902cb)
                    // - Changes characters (8920 -> 8D20)
                    if (this.currentProjectId && content.includes('staticFile(')) {
                        const correctId = this.currentProjectId;
                        // Find all asset paths - include uppercase letters since Gemini sometimes adds them
                        const assetPathRegex = /assets\/([a-fA-F0-9-]{30,40})\/(?:audio|images)\//gi;
                        let pathMatch;
                        let pathFixCount = 0;
                        const fixedIds = new Set<string>();
                        
                        while ((pathMatch = assetPathRegex.exec(content)) !== null) {
                            const foundId = pathMatch[1];
                            // If the found ID is different from correct ID
                            if (foundId !== correctId && !fixedIds.has(foundId)) {
                                // Check if it's a corrupted version (similar structure)
                                const similarity = this.checkIdSimilarity(foundId.toLowerCase(), correctId.toLowerCase());
                                if (similarity > 0.7) {
                                    content = content.replace(
                                        new RegExp(`assets/${foundId}/`, 'g'),
                                        `assets/${correctId}/`
                                    );
                                    fixedIds.add(foundId);
                                    pathFixCount++;
                                    this.socketManager.emitAgentLog('warning', `🔧 Fixed corrupted project ID: ${foundId} → ${correctId}`);
                                }
                            }
                        }
                        
                        if (pathFixCount > 0) {
                            this.socketManager.emitAgentLog('info', `🔧 Fixed ${pathFixCount} corrupted asset paths`);
                        }
                    }
                }

                // --- FIX EMPTY Series.Sequence (Remotion crashes on these) ---
                // Gemini sometimes puts only comments inside Series.Sequence, which Remotion treats as empty
                content = content.replace(
                    /<Series\.Sequence([^>]*)>\s*\{\/\*[^*]*\*\/\}\s*<\/Series\.Sequence>/g,
                    '<Series.Sequence$1><div /></Series.Sequence>'
                );

                // --- JSX + TypeScript SYNTAX VALIDATION (shared method) ---
                if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
                    const syntaxErrors = this.validateJSXContent(content, args.path);
                    if (syntaxErrors.length > 0) {
                        const errorMsg = `❌ SYNTAX VALIDATION FAILED:\n${syntaxErrors.map(e => `  • ${e}`).join('\n')}`;
                        this.socketManager.emitAgentLog('error', errorMsg);
                        throw new Error(errorMsg);
                    }
                    this.socketManager.emitAgentLog('info', `✅ Syntax validation passed for ${args.path}`);
                }

                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, content, 'utf-8');

                // Auto-update ProjectBrain with file analysis
                if (this.brain) {
                    this.brain.trackFile(args.path, content);
                    this.brain.recordAction('write_file', 'success', args.path);
                    await this.brain.flush();
                }

                this.socketManager.emit('project:update', {
                    type: 'file_change',
                    path: args.path,
                    timestamp: Date.now()
                });

                return `✅ File written: ${args.path}`;
            }

            case 'read_file': {
                const filePath = getSecurePath(args.path);
                
                // Check if file exists first
                try {
                    await fs.access(filePath);
                } catch {
                    return `📄 File does not exist: ${args.path}\n\nThis is a new project. You need to CREATE this file first using write_file.`;
                }
                
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
                
                // Check if directory exists first
                try {
                    await fs.access(dirPath);
                } catch {
                    return `📂 Directory does not exist: ${args.path || '.'}\n\nThis is the project root. Files are stored directly here (no src/ folder needed).`;
                }
                
                const entries = await fs.readdir(dirPath, { withFileTypes: true });

                const formatted = entries.map(entry => {
                    const icon = entry.isDirectory() ? '📁' : '📄';
                    return `${icon} ${entry.name}${entry.isDirectory() ? '/' : ''}`;
                }).join('\n');

                return `📂 Directory: ${args.path || '.'}\n${'─'.repeat(30)}\n${formatted}`;
            }

            case 'delete_file': {
                const filePath = getSecurePath(args.path);
                
                // 🛡️ PROTECTED FOLDERS - Cannot be deleted
                const protectedPaths = ['scenes', 'assets', 'memory', 'PLAN.md'];
                const basename = path.basename(filePath);
                const dirname = path.basename(path.dirname(filePath));
                
                if (protectedPaths.includes(basename) || protectedPaths.includes(dirname)) {
                    return `❌ PROTECTED: Cannot delete "${args.path}" - this is a core project folder/file. Use write_file to modify content instead.`;
                }
                
                // Check if path exists and determine type
                try {
                    const stats = await fs.stat(filePath);
                    
                    if (stats.isDirectory()) {
                        // For directories, use rm with recursive
                        await fs.rm(filePath, { recursive: true, force: true });
                    } else {
                        // For files, use unlink
                        await fs.unlink(filePath);
                    }
                } catch (error: any) {
                    if (error.code === 'ENOENT') {
                        return `⚠️ File not found: ${args.path}`;
                    }
                    throw error;
                }

                this.socketManager.emit('project:update', {
                    type: 'file_delete',
                    path: args.path,
                    timestamp: Date.now()
                });

                return `🗑️ Deleted: ${args.path}`;
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

                    // Validate and clamp line numbers (resilient to file length changes from LLM line-break fix)
                    if (startLine < 1) {
                        throw new Error(`Invalid start line: ${startLine} (must be >= 1)`);
                    }
                    
                    // Clamp endLine to actual file length instead of throwing
                    const actualEndLine = Math.min(endLine, lines.length);
                    if (actualEndLine !== endLine) {
                        this.socketManager.emitAgentLog('warning', 
                            `⚠️ Clamped edit range from ${startLine}-${endLine} to ${startLine}-${actualEndLine} (file has ${lines.length} lines)`);
                    }
                    
                    if (startLine > actualEndLine) {
                        this.socketManager.emitAgentLog('warning', 
                            `⚠️ Skipping edit: start line ${startLine} > end line ${actualEndLine}`);
                        continue;
                    }

                    // Replace lines (1-indexed to 0-indexed)
                    const newLines = newContent.split('\n');
                    lines.splice(startLine - 1, actualEndLine - startLine + 1, ...newLines);
                }

                // --- VALIDATE RESULT BEFORE SAVING (prevent broken code) ---
                let editedContent = lines.join('\n');
                const writePath = getSecurePath(args.path);

                // Apply the same Gemini typo fixer as write_file
                if (args.path.endsWith('.tsx') || args.path.endsWith('.ts') || args.path.endsWith('.jsx') || args.path.endsWith('.js')) {
                    editedContent = this.fixGeminiTypos(editedContent);
                }

                if (args.path.endsWith('.tsx') || args.path.endsWith('.jsx')) {
                    const syntaxErrors = this.validateJSXContent(editedContent, args.path);
                    if (syntaxErrors.length > 0) {
                        // ROLLBACK: Do NOT save the file — return error to Gemini
                        const errorMsg = `❌ ATOMIC_EDIT REJECTED (file NOT saved):\n${syntaxErrors.map(e => `  • ${e}`).join('\n')}\n\n⚠️ The original file is unchanged. Fix the edit and try again.`;
                        this.socketManager.emitAgentLog('error', errorMsg);
                        if (this.brain) {
                            this.brain.recordAction('atomic_edit', 'fail', args.path, syntaxErrors[0]);
                        }
                        throw new Error(errorMsg);
                    }
                    this.socketManager.emitAgentLog('info', `✅ Syntax validation passed for edited ${args.path}`);
                }

                // IMPORTANT: Save edits to Project Storage (single source of truth)
                await fs.mkdir(path.dirname(writePath), { recursive: true });
                await fs.writeFile(writePath, editedContent, 'utf-8');

                if (this.brain) {
                    this.brain.trackFile(args.path, editedContent);
                    this.brain.recordAction('atomic_edit', 'success', args.path);
                    await this.brain.flush();
                }

                this.socketManager.emit('project:update', {
                    type: 'file_change',
                    path: args.path,
                    timestamp: Date.now()
                });

                return `✏️ Edited ${args.path}`;
            }

            // ═══════════════════════════════════════════════════════════════
            // 🔧 BUILD & VERIFICATION
            // ═══════════════════════════════════════════════════════════════
            case 'run_build_check': {
                try {
                    // Run TypeScript check on remotion-core
                    const { stdout, stderr } = await execAsync('npx tsc --noEmit', {
                        cwd: this.REMOTION_ROOT,
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
                        cwd: this.projectRoot || this.REMOTION_ROOT,
                        timeout: 60000 // 60 second timeout
                    });
                    return stdout || stderr || '✅ Command completed (no output)';
                } catch (error: any) {
                    return `❌ Command failed: ${error.message}`;
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // 📦 PACKAGE INSTALLATION
            // ═══════════════════════════════════════════════════════════════
            case 'install_package': {
                const { packages, reason } = args;
                
                if (!packages || packages.length === 0) {
                    return "❌ No packages specified. Provide an array of package names.";
                }

                // Fix common Gemini typos in package names
                const pkgNameFixes: Record<string, string> = {
                    '@remotion/threee': '@remotion/three',
                    '@remotion/tthree': '@remotion/three',
                    '@react-three/fiberr': '@react-three/fiber',
                    '@react-three/fibeer': '@react-three/fiber',
                    '@react-three/fiiber': '@react-three/fiber',
                    '@react-three/dreii': '@react-three/drei',
                    '@react-three/ddrei': '@react-three/drei',
                    'threee': 'three',
                    'tthree': 'three',
                    'gsapp': 'gsap',
                    'ggsap': 'gsap',
                    '@types/threee': '@types/three',
                };
                const fixedPackages = packages.map((pkg: string) => {
                    const fixed = pkgNameFixes[pkg] || pkg;
                    if (fixed !== pkg) {
                        this.socketManager.emitAgentLog('warning', `🔧 Fixed package name typo: ${pkg} → ${fixed}`);
                    }
                    return fixed;
                });
                // Deduplicate after fixing
                const uniquePackages = [...new Set(fixedPackages)] as string[];

                // Validate package names (security)
                const validPackageRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(@[^@]+)?$/i;
                const invalidPackages = uniquePackages.filter((pkg: string) => !validPackageRegex.test(pkg));
                if (invalidPackages.length > 0) {
                    return `❌ Invalid package names: ${invalidPackages.join(', ')}`;
                }

                const packageList = uniquePackages.join(' ');
                this.socketManager.emitAgentLog('info', `📦 Installing packages: ${packageList}`);
                this.socketManager.emitAgentLog('info', `💡 Reason: ${reason}`);

                try {
                    // Install at root level of monorepo for shared access
                    const rootDir = path.resolve(this.PROJECTS_ROOT, '..');
                    
                    const { stdout, stderr } = await execAsync(`pnpm add -w ${packageList}`, {
                        cwd: rootDir,
                        timeout: 120000 // 2 minute timeout for installation
                    });

                    this.socketManager.emitAgentLog('success', `✅ Packages installed: ${packageList}`);
                    
                    return JSON.stringify({
                        success: true,
                        message: `✅ Successfully installed: ${packageList}`,
                        packages: packages,
                        reason: reason,
                        output: stdout || stderr || 'Installation completed',
                        nextStep: "You can now import these packages in your components!"
                    }, null, 2);
                } catch (error: any) {
                    this.socketManager.emitAgentLog('error', `❌ Installation failed: ${error.message}`);
                    return `❌ Failed to install packages: ${error.message}`;
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // 🎬 COMPOSITION REGISTRATION
            // ═══════════════════════════════════════════════════════════════
            case 'register_composition': {
                // Fix common Gemini typos in tool parameters
                const durationInFrames = args.durationInFrames || args.duraationInFrames || args.durationInFraames || 300;
                const componentName = args.componentName || args.componenntName || 'Main';
                const importPath = args.importPath || args.importPathh || args.imporrtPath || 'Main';
                const fps = args.fps || 30;
                const width = args.width || args.widthh || 1920;
                const height = args.height || args.heightt || 1080;

                // ═══════════════════════════════════════════════════════════════
                // 🛡️ MANDATORY VALIDATION GATE - Block registration if code has errors
                // ═══════════════════════════════════════════════════════════════
                this.socketManager.emitAgentLog('info', '🔍 Running mandatory validation before registration...');
                const validationResult = await this.executeTool('validate_syntax', {});
                
                if (validationResult.includes('❌') || validationResult.includes('VALIDATION ERRORS')) {
                    const errorMsg = `❌ REGISTRATION BLOCKED: Code validation failed. Fix these errors first:\n\n${validationResult}\n\n⚠️ Call validate_syntax, fix the errors, then try register_composition again.`;
                    this.socketManager.emitAgentLog('error', errorMsg);
                    return errorMsg;
                }
                this.socketManager.emitAgentLog('success', '✅ Validation passed - proceeding with registration');

                // Clean up the import path - remove ./, src/, and .tsx extension
                // Agent may pass "src/Main" or "./src/Main" but files are directly in project folder
                let cleanImportPath = importPath
                    .replace(/^\.\//, '')
                    .replace(/^src\//, '')
                    .replace(/\.tsx$/, '');

                let actualExportName = componentName; // Will be overwritten with detected name

                // --- FILE EXISTENCE & EXPORT VALIDATION ---
                if (this.projectRoot) {
                    // Files are directly in the project folder (no src/ subfolder)
                    const primaryPath = path.join(this.projectRoot, cleanImportPath + '.tsx');

                    let resolvedPath = primaryPath;
                    try {
                        await fs.access(primaryPath);
                    } catch {
                        const errorMsg = `❌ SAFETY REJECTION: The file "${cleanImportPath}.tsx" does not exist. Create it with write_file FIRST.`;
                        this.socketManager.emitAgentLog('error', errorMsg);
                        return errorMsg;
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

                // Build the import path using @projects alias (single source of truth)
                const actualImportPath = this.currentProjectId
                    ? `@projects/${this.currentProjectId}/${cleanImportPath}`
                    : cleanImportPath;

                const aliasName = this.currentProjectId
                    ? `${actualExportName}_${this.currentProjectId.split('-')[0]}`
                    : actualExportName;

                const compositionId = this.currentProjectId ? `${this.currentProjectId}-${actualExportName}` : actualExportName;

                // 1. Update Root.tsx - CLEAN APPROACH: Only keep current project, remove old ones
                // This prevents accumulation of broken old projects that block compilation
                // Must include registerRoot() for Remotion bundler/renderer
                const rootPath = path.join(this.REMOTION_ROOT, 'src/Root.tsx');
                const cleanRootContent = `import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CurrentComposition } from './index';
import { ${actualExportName} as ${aliasName} } from '${actualImportPath}';

/**
 * Root component for Remotion.
 * The Director Agent dynamically updates this file using register_composition tool.
 * Only the CURRENT project is imported to prevent old broken projects from blocking compilation.
 */
export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Default placeholder composition - shows current preview */}
            <Composition
                id="Default"
                component={CurrentComposition}
                durationInFrames={${durationInFrames}}
                fps={${fps}}
                width={1920}
                height={1080}
            />
            {/* Current project composition */}
            <Composition
                id="${compositionId}"
                component={${aliasName}}
                durationInFrames={${durationInFrames}}
                fps={${fps}}
                width={${width}}
                height={${height}}
            />
        </>
    );
};

registerRoot(RemotionRoot);
`;

                await fs.writeFile(rootPath, cleanRootContent, 'utf-8');

                // 3. DELAY PreviewEntry.tsx update - store for later when agent completes
                // This prevents broken previews during generation
                this.pendingPreview = {
                    actualExportName,
                    actualImportPath,
                    durationInFrames
                };
                this.socketManager.emitAgentLog('info', '📋 Preview queued - will be activated when generation completes');

                // Note: No sync needed - projects folder IS the source of truth
                // Note: We do NOT emit composition_registered here anymore - preview:ready will be emitted on completion

                return `🎬 Successfully registered: ${actualExportName} (Aliased as ${aliasName})\n- Path: ${actualImportPath}\n- Preview will be available when generation completes.`;
            }

            case 'validate_syntax': {
                // FULL VALIDATION: Same checks as write_file and atomic_edit
                const files = this.brain ? this.brain.getFiles() : [];
                if (files.length === 0) return "✅ No files to validate yet. Continue with file creation.";

                this.socketManager.emitAgentLog('info', `🔍 Validating ${files.length} files...`);

                const errors: string[] = [];

                for (const file of files) {
                    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;

                    const filePath = path.join(this.projectRoot!, file);
                    try {
                        const content = await fs.readFile(filePath, 'utf-8');
                        const fileErrors = this.validateJSXContent(content, file);
                        for (const err of fileErrors) {
                            errors.push(`[${file}] ${err}`);
                        }
                    } catch (e) {
                        errors.push(`[${file}] File not found`);
                    }
                }

                if (errors.length > 0) {
                    const errorReport = errors.slice(0, 10).join('\n');
                    this.socketManager.emitAgentLog('warning', `⚠️ Issues found:\n${errorReport}`);
                    return `⚠️ VALIDATION ERRORS:\n${errorReport}\n\nFix these and try again.`;
                }

                this.socketManager.emitAgentLog('success', `✅ All ${files.length} files look good!`);
                return "✅ Validation passed. Files are ready. You can now call register_composition.";
            }

            case 'deploy_project': {
                const { message } = args;
                this.socketManager.emitAgentLog('info', `🚀 Pre-deploy validation...`);

                // --- PRE-DEPLOY VALIDATION GATE ---
                if (this.projectRoot && this.brain) {
                    const deployErrors: string[] = [];
                    const trackedFiles = this.brain.getFiles();
                    
                    for (const file of trackedFiles) {
                        if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) continue;
                        try {
                            const filePath = path.join(this.projectRoot, file);
                            const content = await fs.readFile(filePath, 'utf-8');
                            const fileErrors = this.validateJSXContent(content, file);
                            for (const err of fileErrors) {
                                deployErrors.push(`[${file}] ${err}`);
                            }
                        } catch { /* skip missing files */ }
                    }

                    if (deployErrors.length > 0) {
                        const errorReport = deployErrors.slice(0, 10).join('\n');
                        const errorMsg = `❌ DEPLOY BLOCKED — broken code detected:\n${errorReport}\n\n⚠️ Fix these errors first, then call deploy_project again.`;
                        this.socketManager.emitAgentLog('error', errorMsg);
                        this.brain.recordAction('deploy_project', 'fail', undefined, deployErrors[0]);
                        throw new Error(errorMsg);
                    }
                    this.socketManager.emitAgentLog('success', `✅ Pre-deploy validation passed`);
                }

                this.socketManager.emitAgentLog('info', `🚀 Deploying project: ${message}`);

                // No sync needed - projects folder IS the source of truth
                if (this.brain) {
                    await this.brain.appendLog(`🚀 DEPLOYED: ${message}`);
                    this.brain.recordAction('deploy_project', 'success');
                    // Post-deploy reflection: refresh file summaries & extract brand
                    await this.brain.postDeployReflection();
                }

                return `🎉 Project deployed! ${message}`;
            }

            case 'update_log': {
                if (this.brain) await this.brain.appendLog(args.entry);
                this.socketManager.emitAgentLog('info', `📝 Log Updated: ${args.entry.slice(0, 50)}...`);
                return `✅ Log updated successfully.`;
            }

            case 'record_decision': {
                if (this.brain) await this.brain.updateDecision(args.context, args.choice);
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

                    // No sync needed - assets served directly from /projects folder
                    this.socketManager.emitAgentLog('success', `🎵 Sound added: ${filename}`);
                    return `✅ Success! Sound saved to: assets/${this.currentProjectId}/assets/audio/${filename}`;
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

                    // No sync needed - assets served directly from /projects folder
                    this.socketManager.emitAgentLog('success', `✅ Asset downloaded: ${filename}`);
                    return `✅ Success! Asset saved to: assets/${this.currentProjectId}/assets/${subDir}/${filename}\nUse this path in your code.`;

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
                // Simplified: return project brain context instead of old pattern library
                return JSON.stringify({
                    message: `Use spring physics and cinematic easing for ${args.animationType || 'animations'}. Check project brain for current style.`,
                    tip: 'Use spring({ fps, frame, config: { damping: 12, mass: 0.5 } }) for natural motion.'
                }, null, 2);
            }

            case 'get_audio_recommendations': {
                return JSON.stringify({
                    message: `For ${args.sceneType || 'scenes'}, use fetch_audio tool to get appropriate audio.`,
                    tip: 'Match audio mood to scene type: intro→cinematic, content→ambient, outro→uplifting'
                }, null, 2);
            }

            case 'get_template_recommendations': {
                return JSON.stringify({
                    message: `Template guidance available in project brain context.`,
                    tip: 'Structure: Series(Scene1 → Scene2 → ...) with Audio tracks.'
                }, null, 2);
            }

            case 'learn_animation_success': {
                // Record as a decision in ProjectBrain
                if (this.brain) {
                    const { animation, sceneType } = args;
                    this.brain.addDecision(
                        `Animation: ${animation?.name || sceneType || 'pattern'}`,
                        args.feedback || 'Successful animation',
                        null
                    );
                    await this.brain.flush();
                }
                return "✅ Animation pattern recorded in project brain";
            }

            case 'learn_audio_success': {
                if (this.brain) {
                    const { audio } = args;
                    this.brain.addDecision(
                        `Audio: ${audio?.type || 'track'}`,
                        args.feedback || 'Successful audio choice',
                        null
                    );
                    await this.brain.flush();
                }
                return "✅ Audio choice recorded in project brain";
            }

            case 'search_memory': {
                if (!this.brain) return "❌ No project brain available";
                
                const brainData = this.brain.getData();
                return JSON.stringify({
                    message: `Project Brain contents`,
                    files: Object.keys(brainData.core.project_state.files),
                    decisions: brainData.core.decisions,
                    brand: brainData.core.brand_identity,
                    recentActions: brainData.recall.actions.slice(-5)
                }, null, 2);
            }

            case 'get_memory_stats': {
                if (!this.brain) return "❌ No project brain available";
                
                const brainData = this.brain.getData();
                return JSON.stringify({
                    message: "ProjectBrain Statistics",
                    stats: {
                        trackedFiles: Object.keys(brainData.core.project_state.files).length,
                        decisions: brainData.core.decisions.length,
                        conversations: brainData.recall.conversation.length,
                        actions: brainData.recall.actions.length,
                        imageAssets: brainData.core.project_state.assets.images.length,
                        audioAssets: brainData.core.project_state.assets.audio.length,
                        brandName: brainData.core.brand_identity.name,
                        lastUpdated: brainData.updatedAt
                    }
                }, null, 2);
            }

            // ═══════════════════════════════════════════════════════════════
            // 📋 PROJECT PLAN SYSTEM (PLAN.md)
            // ═══════════════════════════════════════════════════════════════
            case 'create_project_plan': {
                if (!this.projectRoot || !this.currentProjectId) return "❌ No project active.";
                
                const { scenes, bgmDecision, sfxPlan, duration, fps = 30 } = args;
                
                this.socketManager.emitAgentLog('info', `📋 Creating project plan...`);
                
                // Create scenes/ folder
                const scenesDir = path.join(this.projectRoot, 'scenes');
                await fs.mkdir(scenesDir, { recursive: true });
                
                // Calculate total duration
                const totalFrames = duration || (scenes.length > 0 ? scenes[scenes.length - 1].endFrame : 300);
                const totalSeconds = Math.round(totalFrames / fps);
                
                // Build PLAN.md content
                const timestamp = new Date().toISOString();
                let planContent = `# 🎬 Video Plan

## Project Info
- **ID**: ${this.currentProjectId}
- **Created**: ${timestamp}
- **Duration**: ${totalSeconds}s (${totalFrames} frames @ ${fps}fps)

## 📁 File Structure
| File | Purpose | Status |
|------|---------|--------|
| Main.tsx | Entry point (imports scenes) | ⏳ |
${scenes.map((s: any) => `| ${s.fileName} | ${s.name} | ⏳ |`).join('\n')}

## 🎬 Scenes Timeline
| # | Scene | File | Frames | Duration | Description |
|---|-------|------|--------|----------|-------------|
${scenes.map((s: any, i: number) => `| ${i + 1} | ${s.name} | ${s.fileName} | ${s.startFrame}-${s.endFrame} | ${Math.round((s.endFrame - s.startFrame) / fps)}s | ${s.description || ''} |`).join('\n')}

## 🎵 Audio Plan
### BGM (Background Music) - ${bgmDecision?.needed ? 'YES' : 'OPTIONAL'}
- **Decision**: ${bgmDecision?.needed ? 'Yes' : 'No'}
- **Reason**: ${bgmDecision?.reason || 'Agent decides based on video type'}
${bgmDecision?.needed && bgmDecision?.mood ? `- **Mood**: ${bgmDecision.mood}` : ''}
- **File**: ⏳ pending

### SFX (Sound Effects) - MANDATORY
| Frame | Type | Scene | File |
|-------|------|-------|------|
${sfxPlan.map((s: any) => `| ${s.frame} | ${s.type} | ${s.scene} | ⏳ pending |`).join('\n')}

## ✅ Progress
- [x] Phase 1: Create Plan
- [ ] Phase 2: Fetch Audio
- [ ] Phase 3: Write Scenes
${scenes.map((s: any) => `  - [ ] ${s.fileName}`).join('\n')}
- [ ] Phase 4: Write Main.tsx (imports scenes)
- [ ] Phase 5: Validate All
- [ ] Phase 6: Register & Deploy

## 📝 Log
- ${timestamp}: Project plan created with ${scenes.length} scenes

`;
                
                // Write PLAN.md
                const planPath = path.join(this.projectRoot, 'PLAN.md');
                await fs.writeFile(planPath, planContent, 'utf-8');
                
                // Track in brain
                if (this.brain) {
                    this.brain.trackFile('PLAN.md', planContent);
                    await this.brain.appendLog(`📋 Created project plan with ${scenes.length} scenes`);
                }
                
                this.socketManager.emitAgentLog('success', `✅ Project plan created! Scenes folder ready.`);
                
                // Load animation cookbooks for reference
                let gsapReference = '';
                let threeReference = '';
                try {
                    const gsapCookbookPath = path.resolve(__dirname, '../../../../refernce/gsap/GSAP_COOKBOOK.md');
                    gsapReference = await fs.readFile(gsapCookbookPath, 'utf-8');
                } catch (e) {
                    console.warn('⚠️ Could not load GSAP cookbook:', e);
                }
                try {
                    const threeCookbookPath = path.resolve(__dirname, '../../../../refernce/three/THREE_COOKBOOK.md');
                    threeReference = await fs.readFile(threeCookbookPath, 'utf-8');
                } catch (e) {
                    console.warn('⚠️ Could not load THREE cookbook:', e);
                }

                return JSON.stringify({
                    success: true,
                    message: `Project plan created with ${scenes.length} scenes`,
                    planPath: 'PLAN.md',
                    scenesFolder: 'scenes/',
                    nextStep: "Now fetch audio using 'fetch_audio' for BGM and SFX, then write each scene file.",
                    gsapReference: gsapReference ? gsapReference : undefined,
                    threeReference: threeReference ? threeReference : undefined,
                }, null, 2);
            }

            case 'update_project_plan': {
                if (!this.projectRoot) return "❌ No project active.";
                
                const { section, data } = args;
                const planPath = path.join(this.projectRoot, 'PLAN.md');
                
                try {
                    let planContent = await fs.readFile(planPath, 'utf-8');
                    const timestamp = new Date().toISOString();
                    
                    switch (section) {
                        case 'progress':
                            // Update checkbox: data = { step: string, completed: boolean }
                            if (data.step && data.completed !== undefined) {
                                const checkbox = data.completed ? '[x]' : '[ ]';
                                const pattern = new RegExp(`- \\[[ x]\\] ${data.step.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
                                planContent = planContent.replace(pattern, `- ${checkbox} ${data.step}`);
                            }
                            break;
                            
                        case 'files':
                            // Update file status: data = { fileName: string, status: '✅' | '⏳' | '❌' }
                            if (data.fileName && data.status) {
                                const pattern = new RegExp(`\\| ${data.fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\|([^|]+)\\| [⏳✅❌] \\|`, 'g');
                                planContent = planContent.replace(pattern, `| ${data.fileName} |$1| ${data.status} |`);
                            }
                            break;
                            
                        case 'audio':
                            // Update audio file path: data = { type: 'bgm' | 'sfx', frame?: number, filePath: string }
                            if (data.type === 'bgm' && data.filePath) {
                                planContent = planContent.replace(/- \*\*File\*\*: ⏳ pending/, `- **File**: ${data.filePath}`);
                            } else if (data.type === 'sfx' && data.frame !== undefined && data.filePath) {
                                const pattern = new RegExp(`\\| ${data.frame} \\|([^|]+)\\|([^|]+)\\| ⏳ pending \\|`, 'g');
                                planContent = planContent.replace(pattern, `| ${data.frame} |$1|$2| ${data.filePath} |`);
                            }
                            break;
                            
                        case 'log':
                            // Add log entry: data = { message: string }
                            if (data.message) {
                                planContent = planContent.replace(
                                    /## 📝 Log\n/,
                                    `## 📝 Log\n- ${timestamp}: ${data.message}\n`
                                );
                            }
                            break;
                    }
                    
                    await fs.writeFile(planPath, planContent, 'utf-8');
                    
                    this.socketManager.emitAgentLog('info', `📋 Plan updated: ${section}`);
                    return `✅ Plan updated: ${section}`;
                    
                } catch (error: any) {
                    return `❌ Failed to update plan: ${error.message}`;
                }
            }

            case 'read_project_plan': {
                if (!this.projectRoot) return "❌ No project active.";
                
                const planPath = path.join(this.projectRoot, 'PLAN.md');
                
                try {
                    const planContent = await fs.readFile(planPath, 'utf-8');
                    return planContent;
                } catch (error: any) {
                    return `❌ No plan found. Call 'create_project_plan' first.`;
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // 🎭 GSAP REFERENCE SYSTEM
            // ═══════════════════════════════════════════════════════════════
            case 'get_gsap_reference': {
                const { plugin } = args;
                const gsapRefDir = path.resolve(__dirname, '../../../../refernce/gsap');
                
                try {
                    // Load the cookbook
                    const cookbookPath = path.join(gsapRefDir, 'GSAP_COOKBOOK.md');
                    const cookbook = await fs.readFile(cookbookPath, 'utf-8');
                    
                    if (plugin === 'all') {
                        this.socketManager.emitAgentLog('info', `🎭 GSAP: Full cookbook loaded`);
                        return cookbook;
                    }
                    
                    // Extract the relevant section from cookbook
                    // Sections are delimited by "## N. PluginName" or "## PluginName"
                    const pluginLower = plugin.toLowerCase();
                    const sections = cookbook.split(/(?=^## )/m);
                    const matchedSection = sections.find(s => s.toLowerCase().includes(pluginLower));
                    
                    if (matchedSection) {
                        this.socketManager.emitAgentLog('info', `🎭 GSAP: ${plugin} reference loaded`);
                        // Also include the Golden Rule section for context
                        const goldenRule = sections.find(s => s.includes('Golden Rule'));
                        return (goldenRule ? goldenRule + '\n---\n\n' : '') + matchedSection;
                    }
                    
                    // Fallback: try to read raw source file
                    const srcPath = path.join(gsapRefDir, 'src', `${plugin}.js`);
                    try {
                        const srcContent = await fs.readFile(srcPath, 'utf-8');
                        this.socketManager.emitAgentLog('info', `🎭 GSAP: ${plugin} raw source loaded`);
                        return `// GSAP ${plugin} Source (use Timeline + Seek pattern for Remotion)\n\n${srcContent}`;
                    } catch {
                        return `❌ Plugin "${plugin}" not found in cookbook or source files. Available: SplitText, DrawSVGPlugin, ScrambleTextPlugin, TextPlugin, CustomEase, CustomBounce, CustomWiggle, Physics2DPlugin, MotionPathPlugin, MorphSVGPlugin, EasePack. Use 'all' for the full cookbook.`;
                    }
                } catch (error: any) {
                    return `❌ Failed to load GSAP reference: ${error.message}`;
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // 🎲 3D REFERENCE SYSTEM (React Three Fiber)
            // ═══════════════════════════════════════════════════════════════
            case 'get_three_reference': {
                const { topic } = args;
                const threeRefDir = path.resolve(__dirname, '../../../../refernce/three');
                
                try {
                    const cookbookPath = path.join(threeRefDir, 'THREE_COOKBOOK.md');
                    const cookbook = await fs.readFile(cookbookPath, 'utf-8');
                    
                    if (topic === 'all') {
                        this.socketManager.emitAgentLog('info', `🎲 Three.js: Full cookbook loaded`);
                        return cookbook;
                    }
                    
                    const topicLower = topic.toLowerCase();
                    const sections = cookbook.split(/(?=^## )/m);
                    const matchedSection = sections.find(s => s.toLowerCase().includes(topicLower));
                    
                    if (matchedSection) {
                        this.socketManager.emitAgentLog('info', `🎲 Three.js: ${topic} reference loaded`);
                        const goldenRule = sections.find(s => s.includes('Golden Rule'));
                        return (goldenRule ? goldenRule + '\n---\n\n' : '') + matchedSection;
                    }
                    
                    return `❌ Topic "${topic}" not found in Three.js cookbook. Available: Text3D, particles, stars, materials, camera, hybrid, sparkles, environment, base. Use 'all' for the full cookbook.`;
                } catch (error: any) {
                    return `❌ Failed to load Three.js reference: ${error.message}`;
                }
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
