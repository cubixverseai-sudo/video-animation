/**
 * 🧠 MEMORY CORE - Central Memory Management System
 * The brain of Director Agent 3.0
 * 
 * Features:
 * - Unified memory interface
 * - Episodic memory (events/actions)
 * - Semantic memory (knowledge/patterns)
 * - Working memory (current context)
 * - Long-term memory (cross-project learning)
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'working';
export type MemoryImportance = 'critical' | 'high' | 'medium' | 'low';

export interface MemoryEntry {
    id: string;
    type: MemoryType;
    category: string;
    content: any;
    metadata: {
        timestamp: number;
        importance: MemoryImportance;
        accessCount: number;
        lastAccessed: number;
        tags: string[];
        projectId?: string;
        relatedIds?: string[];
    };
    embedding?: number[]; // For semantic search
}

export interface MemoryQuery {
    type?: MemoryType;
    category?: string;
    tags?: string[];
    projectId?: string;
    importance?: MemoryImportance;
    limit?: number;
    minRelevance?: number;
    keywords?: string[];
}

export interface MemoryStats {
    totalEntries: number;
    byType: Record<MemoryType, number>;
    byCategory: Record<string, number>;
    oldestEntry: number;
    newestEntry: number;
    totalSize: number;
}

export interface WorkingMemory {
    currentProjectId: string | null;
    currentTask: string | null;
    recentActions: Array<{
        action: string;
        timestamp: number;
        result: 'success' | 'failure';
    }>;
    activeContext: string[];
    shortTermCache: Map<string, any>;
}

// ═══════════════════════════════════════════════════════════════
// 🧠 MEMORY CORE CLASS
// ═══════════════════════════════════════════════════════════════

export class MemoryCore {
    private storageRoot: string;
    private globalMemoryPath: string;
    private projectMemoryPath: string | null = null;
    
    private memoryIndex: Map<string, MemoryEntry> = new Map();
    private workingMemory: WorkingMemory;
    private isDirty: boolean = false;
    private autoSaveInterval: NodeJS.Timeout | null = null;

    // Memory configuration
    private readonly MAX_WORKING_MEMORY_ACTIONS = 20;
    private readonly MAX_CONTEXT_ITEMS = 50;
    private readonly AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds
    private readonly MEMORY_DECAY_THRESHOLD = 0.3;

    constructor(storageRoot: string) {
        this.storageRoot = storageRoot;
        this.globalMemoryPath = path.join(storageRoot, 'global_memory');
        
        this.workingMemory = {
            currentProjectId: null,
            currentTask: null,
            recentActions: [],
            activeContext: [],
            shortTermCache: new Map()
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    async initialize(): Promise<void> {
        console.log('🧠 Initializing MemoryCore...');
        
        // Create storage directories
        await fs.mkdir(this.globalMemoryPath, { recursive: true });
        
        // Load global memory index
        await this.loadMemoryIndex();
        
        // Start auto-save
        this.startAutoSave();
        
        console.log(`🧠 MemoryCore initialized with ${this.memoryIndex.size} entries`);
    }

    async setProjectContext(projectId: string, projectRoot: string): Promise<void> {
        this.workingMemory.currentProjectId = projectId;
        this.projectMemoryPath = path.join(projectRoot, 'memory');
        
        await fs.mkdir(this.projectMemoryPath, { recursive: true });
        
        // Load project-specific memories into working memory
        await this.loadProjectMemories(projectId);
        
        console.log(`🧠 Project context set: ${projectId}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // 💾 MEMORY STORAGE
    // ═══════════════════════════════════════════════════════════════

    private async loadMemoryIndex(): Promise<void> {
        const indexPath = path.join(this.globalMemoryPath, 'index.json');
        
        try {
            const data = await fs.readFile(indexPath, 'utf-8');
            const entries: MemoryEntry[] = JSON.parse(data);
            
            for (const entry of entries) {
                this.memoryIndex.set(entry.id, entry);
            }
        } catch {
            // No existing index, start fresh
            console.log('🧠 Starting with fresh memory');
        }
    }

    private async saveMemoryIndex(): Promise<void> {
        const indexPath = path.join(this.globalMemoryPath, 'index.json');
        const entries = Array.from(this.memoryIndex.values());
        
        await fs.writeFile(indexPath, JSON.stringify(entries, null, 2), 'utf-8');
        this.isDirty = false;
    }

    private async loadProjectMemories(projectId: string): Promise<void> {
        const projectMemories = this.query({ projectId, limit: 100 });
        
        // Add recent project memories to active context
        this.workingMemory.activeContext = projectMemories
            .slice(0, 20)
            .map(m => this.summarizeMemory(m));
    }

    private startAutoSave(): void {
        this.autoSaveInterval = setInterval(async () => {
            if (this.isDirty) {
                await this.saveMemoryIndex();
            }
        }, this.AUTO_SAVE_INTERVAL_MS);
    }

    async shutdown(): Promise<void> {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        await this.saveMemoryIndex();
    }

    // ═══════════════════════════════════════════════════════════════
    // 📝 MEMORY OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Store a new memory
     */
    async store(
        type: MemoryType,
        category: string,
        content: any,
        options: {
            importance?: MemoryImportance;
            tags?: string[];
            relatedIds?: string[];
        } = {}
    ): Promise<string> {
        const id = this.generateId();
        const now = Date.now();

        const entry: MemoryEntry = {
            id,
            type,
            category,
            content,
            metadata: {
                timestamp: now,
                importance: options.importance || 'medium',
                accessCount: 0,
                lastAccessed: now,
                tags: options.tags || [],
                projectId: this.workingMemory.currentProjectId || undefined,
                relatedIds: options.relatedIds
            },
            embedding: this.generateEmbedding(content)
        };

        this.memoryIndex.set(id, entry);
        this.isDirty = true;

        // Update working memory if important
        if (options.importance === 'critical' || options.importance === 'high') {
            this.workingMemory.activeContext.unshift(this.summarizeMemory(entry));
            if (this.workingMemory.activeContext.length > this.MAX_CONTEXT_ITEMS) {
                this.workingMemory.activeContext.pop();
            }
        }

        return id;
    }

    /**
     * Retrieve a memory by ID
     */
    get(id: string): MemoryEntry | null {
        const entry = this.memoryIndex.get(id);
        
        if (entry) {
            // Update access metadata
            entry.metadata.accessCount++;
            entry.metadata.lastAccessed = Date.now();
            this.isDirty = true;
        }

        return entry || null;
    }

    /**
     * Query memories by criteria
     */
    query(criteria: MemoryQuery): MemoryEntry[] {
        let results: MemoryEntry[] = [];

        for (const entry of this.memoryIndex.values()) {
            if (this.matchesCriteria(entry, criteria)) {
                results.push(entry);
            }
        }

        // Sort by relevance (importance + recency + access count)
        results.sort((a, b) => this.calculateRelevance(b, criteria) - this.calculateRelevance(a, criteria));

        // Apply limit
        if (criteria.limit) {
            results = results.slice(0, criteria.limit);
        }

        // Update access metadata for retrieved items
        for (const entry of results) {
            entry.metadata.accessCount++;
            entry.metadata.lastAccessed = Date.now();
        }
        this.isDirty = true;

        return results;
    }

    /**
     * Semantic search using keywords
     */
    search(keywords: string[], limit: number = 10): MemoryEntry[] {
        const scored: Array<{ entry: MemoryEntry; score: number }> = [];

        for (const entry of this.memoryIndex.values()) {
            const score = this.calculateSemanticScore(entry, keywords);
            if (score > 0) {
                scored.push({ entry, score });
            }
        }

        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, limit).map(s => s.entry);
    }

    /**
     * Update an existing memory
     */
    async update(id: string, updates: Partial<MemoryEntry['content']>): Promise<boolean> {
        const entry = this.memoryIndex.get(id);
        
        if (!entry) return false;

        entry.content = { ...entry.content, ...updates };
        entry.metadata.lastAccessed = Date.now();
        this.isDirty = true;

        return true;
    }

    /**
     * Delete a memory
     */
    delete(id: string): boolean {
        const result = this.memoryIndex.delete(id);
        if (result) this.isDirty = true;
        return result;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🎯 WORKING MEMORY OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Record an action in working memory
     */
    recordAction(action: string, result: 'success' | 'failure'): void {
        this.workingMemory.recentActions.unshift({
            action,
            timestamp: Date.now(),
            result
        });

        // Keep only recent actions
        if (this.workingMemory.recentActions.length > this.MAX_WORKING_MEMORY_ACTIONS) {
            this.workingMemory.recentActions.pop();
        }

        // If successful, store as episodic memory
        if (result === 'success') {
            this.store('episodic', 'action', { action, result }, {
                importance: 'medium',
                tags: ['action', 'workflow']
            });
        }
    }

    /**
     * Set current task context
     */
    setCurrentTask(task: string): void {
        this.workingMemory.currentTask = task;
    }

    /**
     * Get working memory summary for AI context
     */
    getWorkingMemorySummary(): string {
        const { currentProjectId, currentTask, recentActions, activeContext } = this.workingMemory;

        let summary = '## 🧠 WORKING MEMORY\n\n';

        if (currentProjectId) {
            summary += `**Project:** ${currentProjectId}\n`;
        }

        if (currentTask) {
            summary += `**Current Task:** ${currentTask}\n`;
        }

        if (recentActions.length > 0) {
            summary += `\n### Recent Actions:\n`;
            const lastFive = recentActions.slice(0, 5);
            for (const action of lastFive) {
                const emoji = action.result === 'success' ? '✅' : '❌';
                summary += `${emoji} ${action.action}\n`;
            }
        }

        if (activeContext.length > 0) {
            summary += `\n### Relevant Context:\n`;
            for (const ctx of activeContext.slice(0, 10)) {
                summary += `- ${ctx}\n`;
            }
        }

        return summary;
    }

    /**
     * Cache temporary data
     */
    cache(key: string, value: any): void {
        this.workingMemory.shortTermCache.set(key, value);
    }

    /**
     * Get cached data
     */
    getCached<T>(key: string): T | undefined {
        return this.workingMemory.shortTermCache.get(key) as T | undefined;
    }

    /**
     * Clear working memory cache
     */
    clearCache(): void {
        this.workingMemory.shortTermCache.clear();
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    private generateId(): string {
        return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private matchesCriteria(entry: MemoryEntry, criteria: MemoryQuery): boolean {
        if (criteria.type && entry.type !== criteria.type) return false;
        if (criteria.category && entry.category !== criteria.category) return false;
        if (criteria.projectId && entry.metadata.projectId !== criteria.projectId) return false;
        if (criteria.importance && entry.metadata.importance !== criteria.importance) return false;
        
        if (criteria.tags && criteria.tags.length > 0) {
            const hasTag = criteria.tags.some(tag => entry.metadata.tags.includes(tag));
            if (!hasTag) return false;
        }

        return true;
    }

    private calculateRelevance(entry: MemoryEntry, criteria: MemoryQuery): number {
        let score = 0;

        // Importance weight
        const importanceWeights: Record<MemoryImportance, number> = {
            critical: 100,
            high: 50,
            medium: 20,
            low: 5
        };
        score += importanceWeights[entry.metadata.importance];

        // Recency weight (decay over time)
        const ageHours = (Date.now() - entry.metadata.timestamp) / (1000 * 60 * 60);
        score += Math.max(0, 50 - ageHours * 0.5);

        // Access frequency weight
        score += Math.min(entry.metadata.accessCount * 2, 30);

        // Keyword match bonus
        if (criteria.keywords && criteria.keywords.length > 0) {
            score += this.calculateSemanticScore(entry, criteria.keywords) * 20;
        }

        return score;
    }

    private calculateSemanticScore(entry: MemoryEntry, keywords: string[]): number {
        const contentStr = JSON.stringify(entry.content).toLowerCase();
        const tags = entry.metadata.tags.join(' ').toLowerCase();
        const category = entry.category.toLowerCase();

        let matches = 0;
        for (const keyword of keywords) {
            const kw = keyword.toLowerCase();
            if (contentStr.includes(kw)) matches += 2;
            if (tags.includes(kw)) matches += 3;
            if (category.includes(kw)) matches += 2;
        }

        return matches / keywords.length;
    }

    private generateEmbedding(content: any): number[] {
        // Simple keyword-based embedding (in production, use actual embeddings)
        const text = JSON.stringify(content).toLowerCase();
        const words = text.match(/\b\w+\b/g) || [];
        
        // Create a simple hash-based embedding
        const embedding = new Array(64).fill(0);
        for (const word of words) {
            const hash = this.simpleHash(word);
            embedding[hash % 64] += 1;
        }

        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return magnitude > 0 ? embedding.map(v => v / magnitude) : embedding;
    }

    private simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    private summarizeMemory(entry: MemoryEntry): string {
        const content = typeof entry.content === 'string' 
            ? entry.content 
            : JSON.stringify(entry.content);
        
        const summary = content.length > 100 
            ? content.substring(0, 100) + '...' 
            : content;

        return `[${entry.category}] ${summary}`;
    }

    // ═══════════════════════════════════════════════════════════════
    // 📊 STATISTICS & MAINTENANCE
    // ═══════════════════════════════════════════════════════════════

    getStats(): MemoryStats {
        const entries = Array.from(this.memoryIndex.values());
        
        const byType: Record<MemoryType, number> = {
            episodic: 0,
            semantic: 0,
            procedural: 0,
            working: 0
        };

        const byCategory: Record<string, number> = {};
        let oldest = Date.now();
        let newest = 0;

        for (const entry of entries) {
            byType[entry.type]++;
            byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
            
            if (entry.metadata.timestamp < oldest) oldest = entry.metadata.timestamp;
            if (entry.metadata.timestamp > newest) newest = entry.metadata.timestamp;
        }

        return {
            totalEntries: entries.length,
            byType,
            byCategory,
            oldestEntry: oldest,
            newestEntry: newest,
            totalSize: JSON.stringify(entries).length
        };
    }

    /**
     * Clean up old, low-importance memories
     */
    async cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
        const now = Date.now();
        let removed = 0;

        for (const [id, entry] of this.memoryIndex) {
            const age = now - entry.metadata.timestamp;
            const isOld = age > maxAge;
            const isLowImportance = entry.metadata.importance === 'low';
            const isUnused = entry.metadata.accessCount < 2;

            if (isOld && isLowImportance && isUnused) {
                this.memoryIndex.delete(id);
                removed++;
            }
        }

        if (removed > 0) {
            this.isDirty = true;
            await this.saveMemoryIndex();
        }

        console.log(`🧹 Memory cleanup: removed ${removed} entries`);
        return removed;
    }

    /**
     * Consolidate similar memories
     */
    async consolidate(): Promise<number> {
        // Group by category
        const byCategory = new Map<string, MemoryEntry[]>();
        
        for (const entry of this.memoryIndex.values()) {
            const key = `${entry.type}:${entry.category}`;
            if (!byCategory.has(key)) {
                byCategory.set(key, []);
            }
            byCategory.get(key)!.push(entry);
        }

        let consolidated = 0;

        // Consolidate groups with many similar entries
        for (const [key, entries] of byCategory) {
            if (entries.length > 10) {
                // Keep most important and recent
                const sorted = entries.sort((a, b) => 
                    this.calculateRelevance(b, {}) - this.calculateRelevance(a, {})
                );

                // Remove duplicates (keep top 5)
                for (let i = 5; i < sorted.length; i++) {
                    if (sorted[i].metadata.importance !== 'critical') {
                        this.memoryIndex.delete(sorted[i].id);
                        consolidated++;
                    }
                }
            }
        }

        if (consolidated > 0) {
            this.isDirty = true;
            await this.saveMemoryIndex();
        }

        console.log(`🔄 Memory consolidation: merged ${consolidated} entries`);
        return consolidated;
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

let memoryCore: MemoryCore | null = null;

export function getMemoryCore(storageRoot?: string): MemoryCore {
    if (!memoryCore && storageRoot) {
        memoryCore = new MemoryCore(storageRoot);
    }
    if (!memoryCore) {
        throw new Error('MemoryCore not initialized. Provide storageRoot on first call.');
    }
    return memoryCore;
}

export async function initializeMemoryCore(storageRoot: string): Promise<MemoryCore> {
    memoryCore = new MemoryCore(storageRoot);
    await memoryCore.initialize();
    return memoryCore;
}
