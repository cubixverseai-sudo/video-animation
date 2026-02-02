/**
 * 🔍 MEMORY RETRIEVAL - Intelligent Memory Search
 * 
 * Advanced retrieval algorithms for finding relevant memories:
 * - Semantic similarity search
 * - Contextual relevance scoring
 * - Pattern matching
 * - Recency-weighted retrieval
 */

import { MemoryCore, MemoryEntry, MemoryType, MemoryImportance } from './MemoryCore';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface RetrievalResult {
    memory: MemoryEntry;
    score: number;
    matchReasons: string[];
}

export interface RetrievalOptions {
    maxResults?: number;
    minScore?: number;
    includeTypes?: MemoryType[];
    excludeTypes?: MemoryType[];
    categories?: string[];
    tags?: string[];
    recencyWeight?: number;      // 0-1, how much to favor recent memories
    importanceWeight?: number;    // 0-1, how much to favor important memories
    frequencyWeight?: number;     // 0-1, how much to favor frequently accessed
    projectId?: string;
    timeRange?: {
        start?: number;
        end?: number;
    };
}

export interface SemanticQuery {
    text: string;
    context?: string;
    domain?: 'animation' | 'audio' | 'visual' | 'structure' | 'general';
    intent?: 'find' | 'similar' | 'related' | 'pattern';
}

export interface PatternMatch {
    pattern: string;
    occurrences: MemoryEntry[];
    confidence: number;
}

// ═══════════════════════════════════════════════════════════════
// 🔍 MEMORY RETRIEVAL CLASS
// ═══════════════════════════════════════════════════════════════

export class MemoryRetrieval {
    private memoryCore: MemoryCore;

    // Domain-specific keywords for better matching
    private readonly DOMAIN_KEYWORDS: Record<string, string[]> = {
        animation: [
            'animation', 'motion', 'easing', 'spring', 'bounce', 'fade', 'slide',
            'scale', 'rotate', 'transform', 'keyframe', 'timeline', 'sequence',
            'stagger', 'delay', 'duration', 'transition', 'entrance', 'exit',
            'حركة', 'انيميشن', 'تأثير'
        ],
        audio: [
            'audio', 'sound', 'music', 'sfx', 'bgm', 'ambience', 'volume',
            'fade', 'ducking', 'sync', 'beat', 'rhythm', 'mood', 'tone',
            'whoosh', 'impact', 'transition', 'reveal',
            'صوت', 'موسيقى', 'مؤثرات'
        ],
        visual: [
            'color', 'gradient', 'filter', 'effect', 'particle', 'glow',
            'shadow', 'blur', 'vignette', 'grain', 'contrast', 'saturation',
            'hue', 'palette', 'scheme', 'brand', 'style',
            'لون', 'تأثير', 'بصري'
        ],
        structure: [
            'scene', 'composition', 'layout', 'structure', 'sequence',
            'intro', 'outro', 'transition', 'section', 'hierarchy',
            'narrative', 'story', 'flow', 'pacing', 'timing',
            'مشهد', 'هيكل', 'تركيب'
        ]
    };

    constructor(memoryCore: MemoryCore) {
        this.memoryCore = memoryCore;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🎯 MAIN RETRIEVAL METHODS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Semantic search - find memories by meaning
     */
    semanticSearch(query: SemanticQuery, options: RetrievalOptions = {}): RetrievalResult[] {
        const {
            maxResults = 10,
            minScore = 0.1,
            recencyWeight = 0.3,
            importanceWeight = 0.3,
            frequencyWeight = 0.2
        } = options;

        // Extract keywords and detect domain
        const keywords = this.extractQueryKeywords(query.text);
        const detectedDomain = query.domain || this.detectDomain(query.text);
        
        // Add domain-specific keywords
        if (detectedDomain && this.DOMAIN_KEYWORDS[detectedDomain]) {
            const relevantKeywords = this.DOMAIN_KEYWORDS[detectedDomain]
                .filter(kw => keywords.some(qkw => 
                    kw.includes(qkw) || qkw.includes(kw)
                ));
            keywords.push(...relevantKeywords.slice(0, 5));
        }

        // Get all memories
        const allMemories = this.memoryCore.query({
            ...options,
            limit: 100 // Get more than needed for scoring
        });

        // Score each memory
        const scored: RetrievalResult[] = [];

        for (const memory of allMemories) {
            const { score, reasons } = this.calculateSemanticScore(
                memory, 
                keywords, 
                {
                    recencyWeight,
                    importanceWeight,
                    frequencyWeight,
                    context: query.context,
                    domain: detectedDomain
                }
            );

            if (score >= minScore) {
                scored.push({
                    memory,
                    score,
                    matchReasons: reasons
                });
            }
        }

        // Sort by score and return top results
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, maxResults);
    }

    /**
     * Find similar memories to a given one
     */
    findSimilar(memoryId: string, options: RetrievalOptions = {}): RetrievalResult[] {
        const sourceMemory = this.memoryCore.get(memoryId);
        if (!sourceMemory) return [];

        const content = JSON.stringify(sourceMemory.content);
        const keywords = this.extractQueryKeywords(content);

        // Include source memory's tags as keywords
        keywords.push(...sourceMemory.metadata.tags);

        return this.semanticSearch(
            { text: keywords.join(' '), domain: this.detectDomainFromCategory(sourceMemory.category) },
            { ...options, excludeTypes: undefined }
        ).filter(r => r.memory.id !== memoryId);
    }

    /**
     * Find memories related to a pattern
     */
    findByPattern(pattern: string, options: RetrievalOptions = {}): RetrievalResult[] {
        const results: RetrievalResult[] = [];
        const patternLower = pattern.toLowerCase();
        const patternParts = patternLower.split(/[_\-\s]+/);

        const allMemories = this.memoryCore.query({ limit: 200 });

        for (const memory of allMemories) {
            const contentStr = JSON.stringify(memory.content).toLowerCase();
            const categoryLower = memory.category.toLowerCase();
            const tagsLower = memory.metadata.tags.map(t => t.toLowerCase());

            let matches = 0;
            const reasons: string[] = [];

            // Check pattern parts
            for (const part of patternParts) {
                if (contentStr.includes(part)) {
                    matches += 2;
                    reasons.push(`Content contains "${part}"`);
                }
                if (categoryLower.includes(part)) {
                    matches += 3;
                    reasons.push(`Category matches "${part}"`);
                }
                if (tagsLower.some(t => t.includes(part))) {
                    matches += 2;
                    reasons.push(`Tag matches "${part}"`);
                }
            }

            // Check full pattern
            if (contentStr.includes(patternLower)) {
                matches += 5;
                reasons.push('Full pattern match');
            }

            const score = matches / (patternParts.length * 5);

            if (score > 0.1) {
                results.push({ memory, score, matchReasons: reasons });
            }
        }

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, options.maxResults || 10);
    }

    /**
     * Find patterns across memories
     */
    detectPatterns(category?: string): PatternMatch[] {
        const memories = category 
            ? this.memoryCore.query({ category, limit: 100 })
            : this.memoryCore.query({ limit: 200 });

        const patternCounts = new Map<string, MemoryEntry[]>();

        for (const memory of memories) {
            // Extract potential patterns from content
            const patterns = this.extractPatterns(memory);
            
            for (const pattern of patterns) {
                if (!patternCounts.has(pattern)) {
                    patternCounts.set(pattern, []);
                }
                patternCounts.get(pattern)!.push(memory);
            }
        }

        // Filter to patterns that appear multiple times
        const results: PatternMatch[] = [];

        for (const [pattern, occurrences] of patternCounts) {
            if (occurrences.length >= 2) {
                results.push({
                    pattern,
                    occurrences,
                    confidence: Math.min(occurrences.length / 5, 1)
                });
            }
        }

        results.sort((a, b) => b.confidence - a.confidence);
        return results;
    }

    /**
     * Get memories for specific context
     */
    getContextualMemories(
        context: 'project_start' | 'animation_work' | 'audio_work' | 'debugging' | 'deployment',
        projectId?: string
    ): RetrievalResult[] {
        const contextConfig: Record<string, { categories: string[]; tags: string[]; types: MemoryType[] }> = {
            project_start: {
                categories: ['brand', 'style', 'preferences', 'successful_template'],
                tags: ['brand', 'style', 'template', 'best_practice'],
                types: ['semantic', 'procedural']
            },
            animation_work: {
                categories: ['animation_pattern', 'timing', 'easing', 'motion'],
                tags: ['animation', 'motion', 'spring', 'easing', 'successful'],
                types: ['procedural', 'semantic']
            },
            audio_work: {
                categories: ['audio_pattern', 'sound_mapping', 'music', 'sfx'],
                tags: ['audio', 'sound', 'music', 'sfx', 'successful'],
                types: ['procedural', 'semantic']
            },
            debugging: {
                categories: ['error', 'fix', 'solution', 'workaround'],
                tags: ['fix', 'error', 'solution', 'debug'],
                types: ['episodic', 'procedural']
            },
            deployment: {
                categories: ['deployment', 'build', 'validation'],
                tags: ['deploy', 'build', 'success', 'checklist'],
                types: ['procedural']
            }
        };

        const config = contextConfig[context];
        if (!config) return [];

        const results: RetrievalResult[] = [];

        // Search by categories
        for (const category of config.categories) {
            const memories = this.memoryCore.query({
                category,
                projectId,
                limit: 5
            });

            for (const memory of memories) {
                results.push({
                    memory,
                    score: 0.8,
                    matchReasons: [`Category: ${category}`]
                });
            }
        }

        // Search by tags
        const tagMemories = this.memoryCore.query({
            tags: config.tags,
            projectId,
            limit: 10
        });

        for (const memory of tagMemories) {
            if (!results.some(r => r.memory.id === memory.id)) {
                results.push({
                    memory,
                    score: 0.6,
                    matchReasons: [`Tags: ${config.tags.filter(t => memory.metadata.tags.includes(t)).join(', ')}`]
                });
            }
        }

        return results.slice(0, 15);
    }

    // ═══════════════════════════════════════════════════════════════
    // 🛠️ SPECIALIZED RETRIEVAL
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get successful patterns for a specific task
     */
    getSuccessfulPatterns(taskType: string, domain?: string): RetrievalResult[] {
        return this.semanticSearch(
            { 
                text: `successful ${taskType} ${domain || ''}`,
                intent: 'pattern'
            },
            {
                tags: ['successful', 'best_practice', 'pattern'],
                maxResults: 10
            }
        );
    }

    /**
     * Get memories that might help with an error
     */
    getErrorSolutions(errorMessage: string): RetrievalResult[] {
        const keywords = this.extractQueryKeywords(errorMessage);
        
        return this.semanticSearch(
            { text: errorMessage, intent: 'similar' },
            {
                categories: ['error', 'fix', 'solution'],
                tags: ['fix', 'solution', 'error'],
                maxResults: 5
            }
        );
    }

    /**
     * Get recent activity in a domain
     */
    getRecentActivity(domain: string, limit: number = 10): MemoryEntry[] {
        return this.memoryCore.query({
            category: domain,
            limit
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    private extractQueryKeywords(text: string): string[] {
        const stopWords = new Set([
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'can', 'need',
            'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
            'i', 'me', 'my', 'we', 'you', 'it', 'this', 'that', 'what',
            'و', 'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'أن'
        ]);

        const words = text.toLowerCase().match(/\b[\w\u0600-\u06FF]+\b/g) || [];
        return words
            .filter(w => w.length > 2 && !stopWords.has(w))
            .slice(0, 15);
    }

    private detectDomain(text: string): string | undefined {
        const textLower = text.toLowerCase();
        let maxScore = 0;
        let detectedDomain: string | undefined;

        for (const [domain, keywords] of Object.entries(this.DOMAIN_KEYWORDS)) {
            const score = keywords.filter(kw => textLower.includes(kw)).length;
            if (score > maxScore) {
                maxScore = score;
                detectedDomain = domain;
            }
        }

        return maxScore >= 2 ? detectedDomain : undefined;
    }

    private detectDomainFromCategory(category: string): SemanticQuery['domain'] {
        const categoryLower = category.toLowerCase();
        
        for (const [domain, keywords] of Object.entries(this.DOMAIN_KEYWORDS)) {
            if (keywords.some(kw => categoryLower.includes(kw))) {
                return domain as SemanticQuery['domain'];
            }
        }

        return undefined;
    }

    private calculateSemanticScore(
        memory: MemoryEntry,
        keywords: string[],
        options: {
            recencyWeight: number;
            importanceWeight: number;
            frequencyWeight: number;
            context?: string;
            domain?: string;
        }
    ): { score: number; reasons: string[] } {
        const reasons: string[] = [];
        let score = 0;

        const contentStr = JSON.stringify(memory.content).toLowerCase();
        const category = memory.category.toLowerCase();
        const tags = memory.metadata.tags.map(t => t.toLowerCase());

        // Keyword matching (40% weight)
        let keywordMatches = 0;
        for (const keyword of keywords) {
            const kw = keyword.toLowerCase();
            if (contentStr.includes(kw)) {
                keywordMatches += 2;
                reasons.push(`Content: "${kw}"`);
            }
            if (category.includes(kw)) {
                keywordMatches += 3;
                reasons.push(`Category: "${kw}"`);
            }
            if (tags.some(t => t.includes(kw))) {
                keywordMatches += 2;
                reasons.push(`Tag: "${kw}"`);
            }
        }
        const keywordScore = keywords.length > 0 ? keywordMatches / (keywords.length * 3) : 0;
        score += keywordScore * 0.4;

        // Recency (configurable weight)
        const ageHours = (Date.now() - memory.metadata.timestamp) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 1 - ageHours / (24 * 30)); // Decay over 30 days
        score += recencyScore * options.recencyWeight;
        if (recencyScore > 0.5) reasons.push('Recent');

        // Importance (configurable weight)
        const importanceScores = { critical: 1, high: 0.75, medium: 0.5, low: 0.25 };
        const importanceScore = importanceScores[memory.metadata.importance];
        score += importanceScore * options.importanceWeight;
        if (importanceScore > 0.5) reasons.push(`Importance: ${memory.metadata.importance}`);

        // Access frequency (configurable weight)
        const frequencyScore = Math.min(memory.metadata.accessCount / 10, 1);
        score += frequencyScore * options.frequencyWeight;
        if (frequencyScore > 0.3) reasons.push('Frequently accessed');

        // Domain bonus
        if (options.domain) {
            const domainKeywords = this.DOMAIN_KEYWORDS[options.domain] || [];
            const domainMatches = domainKeywords.filter(kw => 
                contentStr.includes(kw.toLowerCase()) || 
                category.includes(kw.toLowerCase())
            ).length;
            if (domainMatches > 0) {
                score += 0.1 * Math.min(domainMatches / 3, 1);
                reasons.push(`Domain: ${options.domain}`);
            }
        }

        return { score: Math.min(score, 1), reasons: reasons.slice(0, 5) };
    }

    private extractPatterns(memory: MemoryEntry): string[] {
        const patterns: string[] = [];
        const content = memory.content;

        if (typeof content === 'object' && content !== null) {
            // Extract keys as patterns
            const keys = Object.keys(content);
            patterns.push(...keys.filter(k => k.length > 3));

            // Extract common value patterns
            for (const value of Object.values(content)) {
                if (typeof value === 'string' && value.length > 3 && value.length < 50) {
                    patterns.push(value);
                }
            }
        }

        // Add category and tags as patterns
        patterns.push(memory.category);
        patterns.push(...memory.metadata.tags);

        return [...new Set(patterns)];
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 EXPORT
// ═══════════════════════════════════════════════════════════════

export function createMemoryRetrieval(memoryCore: MemoryCore): MemoryRetrieval {
    return new MemoryRetrieval(memoryCore);
}
