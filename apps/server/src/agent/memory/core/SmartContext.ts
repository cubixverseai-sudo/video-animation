/**
 * 🎯 SMART CONTEXT - Intelligent Context Management
 * 
 * Manages AI context window efficiently:
 * - Compresses long conversations
 * - Prioritizes relevant information
 * - Maintains continuity across sessions
 * - Adapts context to current task
 */

import { MemoryCore, MemoryEntry, MemoryType } from './MemoryCore';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface ContextSegment {
    id: string;
    type: 'instruction' | 'history' | 'knowledge' | 'task' | 'feedback';
    content: string;
    priority: number;  // 1-10
    tokenEstimate: number;
    timestamp: number;
    source: string;
}

export interface ContextBudget {
    maxTokens: number;
    instructionBudget: number;  // % for system instructions
    historyBudget: number;      // % for conversation history
    knowledgeBudget: number;    // % for relevant knowledge
    taskBudget: number;         // % for current task context
}

export interface CompressedContext {
    segments: ContextSegment[];
    totalTokens: number;
    compressionRatio: number;
    includedMemories: string[];
    summary: string;
}

export interface TaskContext {
    taskType: 'create' | 'edit' | 'fix' | 'improve' | 'explain';
    domain: 'animation' | 'audio' | 'visual' | 'structure' | 'general';
    complexity: 'simple' | 'medium' | 'complex';
    keywords: string[];
}

// ═══════════════════════════════════════════════════════════════
// 🎯 SMART CONTEXT CLASS
// ═══════════════════════════════════════════════════════════════

export class SmartContext {
    private memoryCore: MemoryCore;
    private segments: ContextSegment[] = [];
    private conversationHistory: Array<{ role: string; content: string; timestamp: number }> = [];
    
    private readonly DEFAULT_BUDGET: ContextBudget = {
        maxTokens: 8000,          // Conservative limit for context
        instructionBudget: 0.20,  // 20% for instructions
        historyBudget: 0.30,      // 30% for history
        knowledgeBudget: 0.35,    // 35% for relevant knowledge
        taskBudget: 0.15          // 15% for task context
    };

    constructor(memoryCore: MemoryCore) {
        this.memoryCore = memoryCore;
    }

    // ═══════════════════════════════════════════════════════════════
    // 📝 CONTEXT BUILDING
    // ═══════════════════════════════════════════════════════════════

    /**
     * Build optimized context for AI based on current task
     */
    async buildContext(
        currentPrompt: string,
        budget: Partial<ContextBudget> = {}
    ): Promise<CompressedContext> {
        const fullBudget = { ...this.DEFAULT_BUDGET, ...budget };
        const taskContext = this.analyzeTask(currentPrompt);
        
        const segments: ContextSegment[] = [];
        const includedMemories: string[] = [];

        // 1. Add system instructions (always first)
        const instructions = this.getSystemInstructions(taskContext);
        segments.push({
            id: 'sys_instructions',
            type: 'instruction',
            content: instructions,
            priority: 10,
            tokenEstimate: this.estimateTokens(instructions),
            timestamp: Date.now(),
            source: 'system'
        });

        // 2. Add compressed conversation history
        const historyTokens = Math.floor(fullBudget.maxTokens * fullBudget.historyBudget);
        const compressedHistory = this.compressHistory(historyTokens);
        if (compressedHistory) {
            segments.push({
                id: 'conv_history',
                type: 'history',
                content: compressedHistory,
                priority: 8,
                tokenEstimate: this.estimateTokens(compressedHistory),
                timestamp: Date.now(),
                source: 'conversation'
            });
        }

        // 3. Add relevant knowledge from memory
        const knowledgeTokens = Math.floor(fullBudget.maxTokens * fullBudget.knowledgeBudget);
        const relevantKnowledge = await this.getRelevantKnowledge(taskContext, knowledgeTokens);
        for (const knowledge of relevantKnowledge) {
            segments.push(knowledge);
            if (knowledge.id.startsWith('mem_')) {
                includedMemories.push(knowledge.id);
            }
        }

        // 4. Add task-specific context
        const taskTokens = Math.floor(fullBudget.maxTokens * fullBudget.taskBudget);
        const taskSegments = await this.getTaskContext(taskContext, taskTokens);
        segments.push(...taskSegments);

        // 5. Optimize and trim to budget
        const optimized = this.optimizeSegments(segments, fullBudget.maxTokens);

        // Calculate compression ratio
        const originalTokens = segments.reduce((sum, s) => sum + s.tokenEstimate, 0);
        const finalTokens = optimized.reduce((sum, s) => sum + s.tokenEstimate, 0);

        return {
            segments: optimized,
            totalTokens: finalTokens,
            compressionRatio: originalTokens > 0 ? finalTokens / originalTokens : 1,
            includedMemories,
            summary: this.generateContextSummary(optimized)
        };
    }

    /**
     * Get formatted context string for AI
     */
    async getFormattedContext(currentPrompt: string): Promise<string> {
        const context = await this.buildContext(currentPrompt);
        
        let formatted = '';
        
        // Group by type and format
        const byType = new Map<string, ContextSegment[]>();
        for (const segment of context.segments) {
            if (!byType.has(segment.type)) {
                byType.set(segment.type, []);
            }
            byType.get(segment.type)!.push(segment);
        }

        // Instructions first
        if (byType.has('instruction')) {
            for (const seg of byType.get('instruction')!) {
                formatted += seg.content + '\n\n';
            }
        }

        // Then knowledge
        if (byType.has('knowledge')) {
            formatted += '## 📚 RELEVANT KNOWLEDGE\n\n';
            for (const seg of byType.get('knowledge')!) {
                formatted += seg.content + '\n';
            }
            formatted += '\n';
        }

        // Then history
        if (byType.has('history')) {
            formatted += '## 📜 RECENT CONTEXT\n\n';
            for (const seg of byType.get('history')!) {
                formatted += seg.content + '\n';
            }
            formatted += '\n';
        }

        // Then task context
        if (byType.has('task')) {
            formatted += '## 🎯 TASK CONTEXT\n\n';
            for (const seg of byType.get('task')!) {
                formatted += seg.content + '\n';
            }
        }

        return formatted.trim();
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔄 CONVERSATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Add message to conversation history
     */
    addToHistory(role: 'user' | 'assistant' | 'system', content: string): void {
        this.conversationHistory.push({
            role,
            content,
            timestamp: Date.now()
        });

        // Store important messages in long-term memory
        if (role === 'user' && content.length > 50) {
            this.memoryCore.store('episodic', 'conversation', {
                role,
                content: this.summarizeText(content, 200),
                timestamp: Date.now()
            }, {
                importance: 'medium',
                tags: ['conversation', 'user_request']
            });
        }

        // Keep history manageable
        if (this.conversationHistory.length > 50) {
            this.compressAndArchiveHistory();
        }
    }

    /**
     * Clear conversation history (new session)
     */
    clearHistory(): void {
        // Archive current history before clearing
        if (this.conversationHistory.length > 0) {
            this.archiveConversation();
        }
        this.conversationHistory = [];
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 INTERNAL METHODS
    // ═══════════════════════════════════════════════════════════════

    private analyzeTask(prompt: string): TaskContext {
        const promptLower = prompt.toLowerCase();

        // Detect task type
        let taskType: TaskContext['taskType'] = 'create';
        if (promptLower.includes('fix') || promptLower.includes('إصلاح') || promptLower.includes('error')) {
            taskType = 'fix';
        } else if (promptLower.includes('improve') || promptLower.includes('تحسين') || promptLower.includes('better')) {
            taskType = 'improve';
        } else if (promptLower.includes('edit') || promptLower.includes('change') || promptLower.includes('تعديل')) {
            taskType = 'edit';
        } else if (promptLower.includes('explain') || promptLower.includes('what') || promptLower.includes('شرح')) {
            taskType = 'explain';
        }

        // Detect domain
        let domain: TaskContext['domain'] = 'general';
        if (promptLower.includes('animation') || promptLower.includes('motion') || promptLower.includes('حركة') || promptLower.includes('animate')) {
            domain = 'animation';
        } else if (promptLower.includes('audio') || promptLower.includes('sound') || promptLower.includes('music') || promptLower.includes('صوت')) {
            domain = 'audio';
        } else if (promptLower.includes('color') || promptLower.includes('visual') || promptLower.includes('لون') || promptLower.includes('effect')) {
            domain = 'visual';
        } else if (promptLower.includes('scene') || promptLower.includes('structure') || promptLower.includes('مشهد') || promptLower.includes('layout')) {
            domain = 'structure';
        }

        // Detect complexity
        let complexity: TaskContext['complexity'] = 'medium';
        const wordCount = prompt.split(/\s+/).length;
        if (wordCount < 10) complexity = 'simple';
        else if (wordCount > 50 || promptLower.includes('complex') || promptLower.includes('advanced')) complexity = 'complex';

        // Extract keywords
        const keywords = this.extractKeywords(prompt);

        return { taskType, domain, complexity, keywords };
    }

    private extractKeywords(text: string): string[] {
        const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 
            'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of', 'in', 
            'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
            'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'this', 'that',
            'و', 'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'أن', 'ان']);

        const words = text.toLowerCase().match(/\b[\w\u0600-\u06FF]+\b/g) || [];
        const keywords = words.filter(w => w.length > 2 && !stopWords.has(w));

        // Count frequency
        const freq = new Map<string, number>();
        for (const word of keywords) {
            freq.set(word, (freq.get(word) || 0) + 1);
        }

        // Return top keywords
        return Array.from(freq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }

    private getSystemInstructions(taskContext: TaskContext): string {
        let instructions = '## 🎬 DIRECTOR CONTEXT\n\n';

        // Add domain-specific instructions
        switch (taskContext.domain) {
            case 'animation':
                instructions += `**Focus: Motion Graphics**
- Use Spring Physics for natural motion
- Apply proper easing (never linear)
- Stagger animations for polish
- Consider camera movements\n\n`;
                break;
            case 'audio':
                instructions += `**Focus: Sound Design**
- Every scene needs audio
- Match mood to visuals
- Use SFX for transitions
- Layer BGM + Ambience + SFX\n\n`;
                break;
            case 'visual':
                instructions += `**Focus: Visual Effects**
- Apply color grading
- Use particles for energy
- Add lens effects for cinema feel
- Maintain brand consistency\n\n`;
                break;
            case 'structure':
                instructions += `**Focus: Composition**
- Follow narrative structure
- Use emotional pacing
- Create clear scene hierarchy
- Balance timing\n\n`;
                break;
        }

        // Add complexity guidance
        if (taskContext.complexity === 'complex') {
            instructions += `**Complexity Note:** This is a complex task. Break it down into steps and verify each part.\n\n`;
        }

        return instructions;
    }

    private compressHistory(maxTokens: number): string | null {
        if (this.conversationHistory.length === 0) return null;

        let compressed = '';
        let tokens = 0;

        // Start from most recent
        for (let i = this.conversationHistory.length - 1; i >= 0 && tokens < maxTokens; i--) {
            const msg = this.conversationHistory[i];
            const summary = this.summarizeText(msg.content, 100);
            const line = `[${msg.role}]: ${summary}\n`;
            const lineTokens = this.estimateTokens(line);

            if (tokens + lineTokens <= maxTokens) {
                compressed = line + compressed;
                tokens += lineTokens;
            } else {
                break;
            }
        }

        return compressed || null;
    }

    private async getRelevantKnowledge(taskContext: TaskContext, maxTokens: number): Promise<ContextSegment[]> {
        const segments: ContextSegment[] = [];
        let usedTokens = 0;

        // Search memory for relevant entries
        const memories = this.memoryCore.search(taskContext.keywords, 20);

        // Also query by category
        const domainMemories = this.memoryCore.query({
            category: taskContext.domain,
            limit: 10
        });

        // Merge and deduplicate
        const allMemories = new Map<string, MemoryEntry>();
        for (const mem of [...memories, ...domainMemories]) {
            allMemories.set(mem.id, mem);
        }

        // Convert to segments
        for (const [id, memory] of allMemories) {
            const content = this.formatMemoryAsContext(memory);
            const tokens = this.estimateTokens(content);

            if (usedTokens + tokens <= maxTokens) {
                segments.push({
                    id: memory.id,
                    type: 'knowledge',
                    content,
                    priority: this.getMemoryPriority(memory),
                    tokenEstimate: tokens,
                    timestamp: memory.metadata.timestamp,
                    source: 'memory'
                });
                usedTokens += tokens;
            }
        }

        return segments;
    }

    private async getTaskContext(taskContext: TaskContext, maxTokens: number): Promise<ContextSegment[]> {
        const segments: ContextSegment[] = [];

        // Get working memory summary
        const workingMemory = this.memoryCore.getWorkingMemorySummary();
        const wmTokens = this.estimateTokens(workingMemory);

        if (wmTokens <= maxTokens) {
            segments.push({
                id: 'working_memory',
                type: 'task',
                content: workingMemory,
                priority: 9,
                tokenEstimate: wmTokens,
                timestamp: Date.now(),
                source: 'working_memory'
            });
        }

        return segments;
    }

    private optimizeSegments(segments: ContextSegment[], maxTokens: number): ContextSegment[] {
        // Sort by priority
        const sorted = [...segments].sort((a, b) => b.priority - a.priority);

        const optimized: ContextSegment[] = [];
        let usedTokens = 0;

        for (const segment of sorted) {
            if (usedTokens + segment.tokenEstimate <= maxTokens) {
                optimized.push(segment);
                usedTokens += segment.tokenEstimate;
            } else if (segment.priority >= 9) {
                // High priority: try to fit a compressed version
                const compressed = this.summarizeText(segment.content, 200);
                const compressedTokens = this.estimateTokens(compressed);
                
                if (usedTokens + compressedTokens <= maxTokens) {
                    optimized.push({
                        ...segment,
                        content: compressed,
                        tokenEstimate: compressedTokens
                    });
                    usedTokens += compressedTokens;
                }
            }
        }

        return optimized;
    }

    private formatMemoryAsContext(memory: MemoryEntry): string {
        const content = typeof memory.content === 'string' 
            ? memory.content 
            : JSON.stringify(memory.content);

        return `[${memory.category}] ${this.summarizeText(content, 150)}`;
    }

    private getMemoryPriority(memory: MemoryEntry): number {
        const priorityMap = { critical: 10, high: 8, medium: 5, low: 2 };
        return priorityMap[memory.metadata.importance];
    }

    private estimateTokens(text: string): number {
        // Rough estimation: ~4 characters per token for English, ~2 for Arabic
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        const ratio = hasArabic ? 2 : 4;
        return Math.ceil(text.length / ratio);
    }

    private summarizeText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;

        // Try to cut at sentence boundary
        const truncated = text.substring(0, maxLength);
        const lastSentence = truncated.lastIndexOf('.');
        const lastArabicSentence = truncated.lastIndexOf('۔');

        const cutPoint = Math.max(lastSentence, lastArabicSentence);
        
        if (cutPoint > maxLength * 0.5) {
            return truncated.substring(0, cutPoint + 1);
        }

        return truncated + '...';
    }

    private generateContextSummary(segments: ContextSegment[]): string {
        const types = segments.map(s => s.type);
        const uniqueTypes = [...new Set(types)];
        
        return `Context includes: ${uniqueTypes.join(', ')} (${segments.length} segments)`;
    }

    private compressAndArchiveHistory(): void {
        // Take first half and compress
        const toArchive = this.conversationHistory.splice(0, Math.floor(this.conversationHistory.length / 2));
        
        const summary = this.summarizeConversation(toArchive);
        
        // Store in memory
        this.memoryCore.store('episodic', 'conversation_archive', {
            summary,
            messageCount: toArchive.length,
            timeRange: {
                start: toArchive[0]?.timestamp,
                end: toArchive[toArchive.length - 1]?.timestamp
            }
        }, {
            importance: 'low',
            tags: ['conversation', 'archive']
        });
    }

    private archiveConversation(): void {
        const summary = this.summarizeConversation(this.conversationHistory);
        
        this.memoryCore.store('episodic', 'conversation_archive', {
            summary,
            messageCount: this.conversationHistory.length,
            timestamp: Date.now()
        }, {
            importance: 'medium',
            tags: ['conversation', 'session_end']
        });
    }

    private summarizeConversation(messages: Array<{ role: string; content: string }>): string {
        // Extract main topics
        const allText = messages.map(m => m.content).join(' ');
        const keywords = this.extractKeywords(allText);

        return `Conversation about: ${keywords.slice(0, 5).join(', ')} (${messages.length} messages)`;
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 EXPORT
// ═══════════════════════════════════════════════════════════════

export function createSmartContext(memoryCore: MemoryCore): SmartContext {
    return new SmartContext(memoryCore);
}
