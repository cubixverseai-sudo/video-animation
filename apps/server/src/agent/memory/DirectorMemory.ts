/**
 * 🎬 DIRECTOR MEMORY - Unified Memory System
 * 
 * The complete memory brain of Director Agent 3.0
 * Integrates all specialized memory systems:
 * - MemoryCore: Central storage
 * - SmartContext: Intelligent context management
 * - MotionMemory: Animation pattern learning
 * - AudioMemory: Sound-scene associations
 * - TemplateLibrary: Composition templates
 */

import * as path from 'path';
import { MemoryCore, initializeMemoryCore, MemoryEntry } from './core/MemoryCore';
import { SmartContext, createSmartContext } from './core/SmartContext';
import { MemoryRetrieval, createMemoryRetrieval } from './core/MemoryRetrieval';
import { MotionMemory, createMotionMemory, AnimationPattern, AnimationRecommendation } from './motion/MotionMemory';
import { AudioMemory, createAudioMemory, AudioRecommendation, SFXPattern } from './audio/AudioMemory';
import { TemplateLibrary, createTemplateLibrary, CompositionTemplate, TemplateRecommendation } from './templates/TemplateLibrary';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface DirectorMemoryConfig {
    storageRoot: string;
    enableAutoSave?: boolean;
    enableLearning?: boolean;
}

export interface ContextForAI {
    workingMemory: string;
    relevantKnowledge: string;
    motionSuggestions: string;
    audioSuggestions: string;
    templateSuggestions: string;
    recentHistory: string;
}

export interface LearningEvent {
    type: 'animation_success' | 'audio_success' | 'template_used' | 'user_feedback';
    data: any;
    feedback?: number;
    projectId?: string;
}

// ═══════════════════════════════════════════════════════════════
// 🎬 DIRECTOR MEMORY CLASS
// ═══════════════════════════════════════════════════════════════

export class DirectorMemory {
    private config: DirectorMemoryConfig;
    
    // Core systems
    private memoryCore!: MemoryCore;
    private smartContext!: SmartContext;
    private retrieval!: MemoryRetrieval;
    
    // Specialized memories
    private motionMemory!: MotionMemory;
    private audioMemory!: AudioMemory;
    private templateLibrary!: TemplateLibrary;

    // State
    private currentProjectId: string | null = null;
    private isInitialized: boolean = false;

    constructor(config: DirectorMemoryConfig) {
        this.config = {
            enableAutoSave: true,
            enableLearning: true,
            ...config
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        console.log('🎬 Initializing Director Memory System...');

        // Initialize core
        this.memoryCore = await initializeMemoryCore(this.config.storageRoot);

        // Initialize smart context
        this.smartContext = createSmartContext(this.memoryCore);

        // Initialize retrieval
        this.retrieval = createMemoryRetrieval(this.memoryCore);

        // Initialize specialized memories
        this.motionMemory = createMotionMemory(this.memoryCore);
        await this.motionMemory.initialize();

        this.audioMemory = createAudioMemory(this.memoryCore);
        await this.audioMemory.initialize();

        this.templateLibrary = createTemplateLibrary(this.memoryCore);
        await this.templateLibrary.initialize();

        this.isInitialized = true;
        console.log('🎬 Director Memory System initialized');
    }

    async setProjectContext(projectId: string, projectRoot: string): Promise<void> {
        this.currentProjectId = projectId;
        await this.memoryCore.setProjectContext(projectId, projectRoot);
        
        // Record project start
        this.memoryCore.recordAction(`Started project: ${projectId}`, 'success');
    }

    async shutdown(): Promise<void> {
        await this.memoryCore.shutdown();
    }

    // ═══════════════════════════════════════════════════════════════
    // 🧠 CONTEXT GENERATION FOR AI
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get optimized context for AI prompt
     */
    async getContextForAI(currentPrompt: string): Promise<string> {
        const context = await this.buildFullContext(currentPrompt);
        return this.formatContextForAI(context);
    }

    /**
     * Build comprehensive context
     */
    private async buildFullContext(prompt: string): Promise<ContextForAI> {
        // Get working memory
        const workingMemory = this.memoryCore.getWorkingMemorySummary();

        // Get relevant knowledge based on prompt
        const relevantResults = this.retrieval.semanticSearch(
            { text: prompt },
            { maxResults: 5 }
        );
        const relevantKnowledge = relevantResults
            .map(r => `[${r.memory.category}] ${this.summarize(r.memory.content)}`)
            .join('\n');

        // Detect if prompt is about animation
        const isAnimationRelated = this.isAnimationPrompt(prompt);
        let motionSuggestions = '';
        if (isAnimationRelated) {
            const motionRecs = await this.motionMemory.recommend({
                animationType: this.detectAnimationType(prompt)
            });
            motionSuggestions = this.formatMotionSuggestions(motionRecs);
        }

        // Detect if prompt is about audio
        const isAudioRelated = this.isAudioPrompt(prompt);
        let audioSuggestions = '';
        if (isAudioRelated) {
            const audioRecs = await this.audioMemory.recommendAudio(
                this.detectSceneType(prompt),
                this.detectMood(prompt)
            );
            audioSuggestions = this.formatAudioSuggestions(audioRecs);
        }

        // Get template suggestions
        const templateRecs = await this.templateLibrary.recommend({
            videoType: this.detectVideoType(prompt),
            keywords: this.extractKeywords(prompt)
        });
        const templateSuggestions = templateRecs.length > 0
            ? this.formatTemplateSuggestions(templateRecs)
            : '';

        // Get recent history
        const recentHistory = await this.smartContext.getFormattedContext(prompt);

        return {
            workingMemory,
            relevantKnowledge,
            motionSuggestions,
            audioSuggestions,
            templateSuggestions,
            recentHistory
        };
    }

    /**
     * Format context for AI consumption
     */
    private formatContextForAI(context: ContextForAI): string {
        let formatted = '';

        // Working memory (always include)
        formatted += context.workingMemory + '\n\n';

        // Motion suggestions (if relevant)
        if (context.motionSuggestions) {
            formatted += '## 🎬 MOTION SUGGESTIONS FROM MEMORY\n\n';
            formatted += context.motionSuggestions + '\n\n';
        }

        // Audio suggestions (if relevant)
        if (context.audioSuggestions) {
            formatted += '## 🔊 AUDIO RECOMMENDATIONS FROM MEMORY\n\n';
            formatted += context.audioSuggestions + '\n\n';
        }

        // Template suggestions (if available)
        if (context.templateSuggestions) {
            formatted += '## 📚 TEMPLATE RECOMMENDATIONS\n\n';
            formatted += context.templateSuggestions + '\n\n';
        }

        // Relevant knowledge
        if (context.relevantKnowledge) {
            formatted += '## 💡 RELEVANT PAST KNOWLEDGE\n\n';
            formatted += context.relevantKnowledge + '\n\n';
        }

        return formatted.trim();
    }

    // ═══════════════════════════════════════════════════════════════
    // 📚 LEARNING INTERFACE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Record a learning event
     */
    async learn(event: LearningEvent): Promise<void> {
        if (!this.config.enableLearning) return;

        switch (event.type) {
            case 'animation_success':
                await this.motionMemory.learnFromSuccess(
                    event.data,
                    {
                        sceneType: event.data.sceneType || 'content',
                        projectId: event.projectId,
                        feedback: event.feedback
                    }
                );
                break;

            case 'audio_success':
                await this.audioMemory.learnFromSuccess(event.data, event.feedback);
                break;

            case 'template_used':
                await this.templateLibrary.recordUsage(event.data.templateId, event.feedback);
                break;

            case 'user_feedback':
                // Store general feedback
                await this.memoryCore.store('episodic', 'feedback', event.data, {
                    importance: 'high',
                    tags: ['feedback', 'user']
                });
                break;
        }
    }

    /**
     * Record a successful action
     */
    recordAction(action: string, success: boolean): void {
        this.memoryCore.recordAction(action, success ? 'success' : 'failure');
    }

    /**
     * Add to conversation history
     */
    addToHistory(role: 'user' | 'assistant', content: string): void {
        this.smartContext.addToHistory(role, content);
    }

    // ═══════════════════════════════════════════════════════════════
    // 🎯 QUICK ACCESS METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get animation recommendations
     */
    async getAnimationRecommendations(
        type: 'entrance' | 'exit' | 'transition' | 'emphasis'
    ): Promise<AnimationRecommendation[]> {
        return this.motionMemory.recommend({ animationType: type });
    }

    /**
     * Get audio recommendations
     */
    async getAudioRecommendations(
        sceneType: string,
        mood?: string
    ): Promise<AudioRecommendation[]> {
        return this.audioMemory.recommendAudio(sceneType as any, mood as any);
    }

    /**
     * Get SFX recommendations
     */
    async getSFXRecommendations(triggerType: string): Promise<SFXPattern[]> {
        return this.audioMemory.recommendSFX(triggerType as any);
    }

    /**
     * Get template recommendations
     */
    async getTemplateRecommendations(
        videoType?: string,
        keywords?: string[]
    ): Promise<TemplateRecommendation[]> {
        return this.templateLibrary.recommend({
            videoType: videoType as any,
            keywords
        });
    }

    /**
     * Get top animation patterns
     */
    async getTopAnimationPatterns(): Promise<AnimationPattern[]> {
        return this.motionMemory.getTopPatterns(5);
    }

    /**
     * Get top templates
     */
    async getTopTemplates(): Promise<CompositionTemplate[]> {
        return this.templateLibrary.getTopTemplates(5);
    }

    /**
     * Search memories
     */
    search(query: string, limit: number = 10): MemoryEntry[] {
        return this.memoryCore.search(this.extractKeywords(query), limit);
    }

    /**
     * Store a new memory directly
     */
    async store(category: string, content: any, tags: string[] = []): Promise<string> {
        return this.memoryCore.store('semantic', category, content, {
            importance: 'medium',
            tags
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 📊 STATS & MAINTENANCE
    // ═══════════════════════════════════════════════════════════════

    async getStats(): Promise<any> {
        const coreStats = this.memoryCore.getStats();
        const motionStats = await this.motionMemory.getStats();

        return {
            core: coreStats,
            motion: motionStats,
            projectId: this.currentProjectId
        };
    }

    async cleanup(): Promise<void> {
        await this.memoryCore.cleanup();
        await this.memoryCore.consolidate();
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    private summarize(content: any): string {
        const str = typeof content === 'string' ? content : JSON.stringify(content);
        return str.length > 100 ? str.substring(0, 100) + '...' : str;
    }

    private extractKeywords(text: string): string[] {
        const words = text.toLowerCase().match(/\b[\w\u0600-\u06FF]+\b/g) || [];
        const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'of', 'in', 'for', 'و', 'في', 'من']);
        return words.filter(w => w.length > 2 && !stopWords.has(w)).slice(0, 10);
    }

    private isAnimationPrompt(prompt: string): boolean {
        const keywords = ['animation', 'animate', 'motion', 'move', 'entrance', 'exit', 'transition', 'حركة', 'انيميشن'];
        return keywords.some(kw => prompt.toLowerCase().includes(kw));
    }

    private isAudioPrompt(prompt: string): boolean {
        const keywords = ['audio', 'sound', 'music', 'sfx', 'bgm', 'صوت', 'موسيقى'];
        return keywords.some(kw => prompt.toLowerCase().includes(kw));
    }

    private detectAnimationType(prompt: string): any {
        const promptLower = prompt.toLowerCase();
        if (promptLower.includes('entrance') || promptLower.includes('appear') || promptLower.includes('in')) return 'entrance';
        if (promptLower.includes('exit') || promptLower.includes('disappear') || promptLower.includes('out')) return 'exit';
        if (promptLower.includes('transition')) return 'transition';
        if (promptLower.includes('emphasis') || promptLower.includes('attention')) return 'emphasis';
        return 'entrance';
    }

    private detectSceneType(prompt: string): any {
        const promptLower = prompt.toLowerCase();
        if (promptLower.includes('intro')) return 'intro';
        if (promptLower.includes('outro')) return 'outro';
        if (promptLower.includes('logo')) return 'logo';
        if (promptLower.includes('transition')) return 'transition';
        if (promptLower.includes('climax')) return 'climax';
        return 'content';
    }

    private detectMood(prompt: string): any {
        const promptLower = prompt.toLowerCase();
        if (promptLower.includes('epic') || promptLower.includes('dramatic')) return 'epic';
        if (promptLower.includes('calm') || promptLower.includes('peaceful')) return 'calm';
        if (promptLower.includes('tech') || promptLower.includes('digital')) return 'tech';
        if (promptLower.includes('playful') || promptLower.includes('fun')) return 'playful';
        if (promptLower.includes('corporate') || promptLower.includes('business')) return 'corporate';
        return undefined;
    }

    private detectVideoType(prompt: string): any {
        const promptLower = prompt.toLowerCase();
        if (promptLower.includes('ad') || promptLower.includes('advertisement')) return 'ad';
        if (promptLower.includes('explainer')) return 'explainer';
        if (promptLower.includes('brand')) return 'brand';
        if (promptLower.includes('promo')) return 'promo';
        if (promptLower.includes('social')) return 'social';
        if (promptLower.includes('logo')) return 'logo';
        if (promptLower.includes('intro')) return 'intro';
        return undefined;
    }

    private formatMotionSuggestions(recs: AnimationRecommendation[]): string {
        if (recs.length === 0) return '';
        
        return recs.slice(0, 3).map(r => 
            `• **${r.pattern.name}** (${Math.round(r.confidence * 100)}% confidence)\n  ${r.reason}`
        ).join('\n');
    }

    private formatAudioSuggestions(recs: AudioRecommendation[]): string {
        if (recs.length === 0) return '';
        
        return recs.slice(0, 3).map(r =>
            `• **${r.mapping.sceneType} ${r.mapping.audioType}** - Mood: ${r.mapping.mood}\n  Keywords: ${r.searchKeywords.join(', ')}`
        ).join('\n');
    }

    private formatTemplateSuggestions(recs: TemplateRecommendation[]): string {
        if (recs.length === 0) return '';
        
        return recs.slice(0, 2).map(r =>
            `• **${r.template.name}** (${r.template.videoType}, ${r.template.complexity})\n  ${r.template.description}`
        ).join('\n');
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 FACTORY & SINGLETON
// ═══════════════════════════════════════════════════════════════

let directorMemoryInstance: DirectorMemory | null = null;

export async function initializeDirectorMemory(
    storageRoot: string
): Promise<DirectorMemory> {
    if (!directorMemoryInstance) {
        directorMemoryInstance = new DirectorMemory({ storageRoot });
        await directorMemoryInstance.initialize();
    }
    return directorMemoryInstance;
}

export function getDirectorMemory(): DirectorMemory {
    if (!directorMemoryInstance) {
        throw new Error('DirectorMemory not initialized. Call initializeDirectorMemory first.');
    }
    return directorMemoryInstance;
}
