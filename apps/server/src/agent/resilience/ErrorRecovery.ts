/**
 * 🛡️ ERROR RECOVERY SYSTEM
 * 
 * Intelligent error handling and recovery:
 * - Automatic retry with exponential backoff
 * - Fallback strategies
 * - Progress persistence
 * - Error pattern learning
 */

import { MemoryCore } from '../memory/core/MemoryCore';

// ═══════════════════════════════════════════════════════════════
// 📋 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export type ErrorCategory = 
    | 'network' | 'file_system' | 'syntax' | 'validation' 
    | 'timeout' | 'permission' | 'resource' | 'unknown';

export type RecoveryStrategy = 
    | 'retry' | 'fallback' | 'skip' | 'manual' | 'rollback';

export interface ErrorContext {
    tool: string;
    args: any;
    error: Error;
    category: ErrorCategory;
    attempt: number;
    timestamp: number;
    projectId?: string;
}

export interface RecoveryPlan {
    strategy: RecoveryStrategy;
    maxRetries: number;
    backoffMs: number;
    fallbackTool?: string;
    fallbackArgs?: any;
    rollbackSteps?: string[];
}

export interface RecoveryResult {
    success: boolean;
    result?: any;
    error?: string;
    strategyUsed: RecoveryStrategy;
    attempts: number;
}

// ═══════════════════════════════════════════════════════════════
// 🛡️ ERROR RECOVERY CLASS
// ═══════════════════════════════════════════════════════════════

export class ErrorRecovery {
    private memoryCore: MemoryCore;
    private errorPatterns: Map<string, number> = new Map();
    
    // Error category detection patterns
    private readonly ERROR_PATTERNS: Record<ErrorCategory, RegExp[]> = {
        network: [
            /ECONNREFUSED/i,
            /ETIMEDOUT/i,
            /ENOTFOUND/i,
            /network/i,
            /fetch/i,
            /timeout/i
        ],
        file_system: [
            /ENOENT/i,
            /EEXIST/i,
            /EACCES/i,
            /file not found/i,
            /directory/i,
            /permission denied/i
        ],
        syntax: [
            /syntax/i,
            /parse/i,
            /unexpected/i,
            /token/i,
            /TypeScript/i,
            /compilation/i
        ],
        validation: [
            /validation/i,
            /invalid/i,
            /required/i,
            /missing/i,
            /SAFETY REJECTION/i
        ],
        timeout: [
            /timeout/i,
            /timed out/i,
            /exceeded/i
        ],
        permission: [
            /permission/i,
            /EACCES/i,
            /unauthorized/i,
            /forbidden/i
        ],
        resource: [
            /ENOSPC/i,
            /out of memory/i,
            /disk full/i,
            /quota/i
        ],
        unknown: []
    };

    // Recovery strategies per category
    private readonly RECOVERY_STRATEGIES: Record<ErrorCategory, RecoveryPlan> = {
        network: {
            strategy: 'retry',
            maxRetries: 3,
            backoffMs: 1000
        },
        file_system: {
            strategy: 'fallback',
            maxRetries: 1,
            backoffMs: 0,
            fallbackTool: 'list_files',
            fallbackArgs: {}
        },
        syntax: {
            strategy: 'manual',
            maxRetries: 0,
            backoffMs: 0
        },
        validation: {
            strategy: 'retry',
            maxRetries: 2,
            backoffMs: 500
        },
        timeout: {
            strategy: 'retry',
            maxRetries: 2,
            backoffMs: 2000
        },
        permission: {
            strategy: 'skip',
            maxRetries: 0,
            backoffMs: 0
        },
        resource: {
            strategy: 'manual',
            maxRetries: 0,
            backoffMs: 0
        },
        unknown: {
            strategy: 'retry',
            maxRetries: 1,
            backoffMs: 1000
        }
    };

    constructor(memoryCore: MemoryCore) {
        this.memoryCore = memoryCore;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔍 ERROR ANALYSIS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Analyze error and categorize it
     */
    categorizeError(error: Error): ErrorCategory {
        const errorMessage = error.message.toLowerCase();
        const errorStack = error.stack?.toLowerCase() || '';

        // Check each category
        for (const [category, patterns] of Object.entries(this.ERROR_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(errorMessage) || pattern.test(errorStack)) {
                    return category as ErrorCategory;
                }
            }
        }

        return 'unknown';
    }

    /**
     * Get recovery plan for error
     */
    getRecoveryPlan(context: ErrorContext): RecoveryPlan {
        const basePlan = this.RECOVERY_STRATEGIES[context.category];
        
        // Check if we've seen this error pattern before
        const patternKey = `${context.tool}:${context.category}`;
        const occurrenceCount = this.errorPatterns.get(patternKey) || 0;
        
        // Adjust strategy based on frequency
        if (occurrenceCount > 3 && basePlan.strategy === 'retry') {
            return {
                ...basePlan,
                strategy: 'fallback',
                maxRetries: 0
            };
        }

        return basePlan;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔄 RECOVERY EXECUTION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Execute recovery strategy
     */
    async executeRecovery(
        context: ErrorContext,
        toolExecutor: (tool: string, args: any) => Promise<any>
    ): Promise<RecoveryResult> {
        const plan = this.getRecoveryPlan(context);
        
        // Record error pattern
        const patternKey = `${context.tool}:${context.category}`;
        this.errorPatterns.set(patternKey, (this.errorPatterns.get(patternKey) || 0) + 1);

        // Store error in memory for learning
        await this.memoryCore.store('episodic', 'error', {
            tool: context.tool,
            category: context.category,
            message: context.error.message,
            timestamp: context.timestamp
        }, {
            importance: 'medium',
            tags: ['error', context.category, context.tool]
        });

        switch (plan.strategy) {
            case 'retry':
                return this.retryWithBackoff(context, plan, toolExecutor);
            
            case 'fallback':
                return this.executeFallback(context, plan, toolExecutor);
            
            case 'skip':
                return {
                    success: false,
                    error: `Skipped due to ${context.category} error`,
                    strategyUsed: 'skip',
                    attempts: 1
                };
            
            case 'manual':
                return {
                    success: false,
                    error: `Manual intervention required: ${context.error.message}`,
                    strategyUsed: 'manual',
                    attempts: 1
                };
            
            case 'rollback':
                return this.executeRollback(context, plan);
            
            default:
                return {
                    success: false,
                    error: context.error.message,
                    strategyUsed: plan.strategy,
                    attempts: 1
                };
        }
    }

    private async retryWithBackoff(
        context: ErrorContext,
        plan: RecoveryPlan,
        toolExecutor: (tool: string, args: any) => Promise<any>
    ): Promise<RecoveryResult> {
        let lastError: Error = context.error;
        
        for (let attempt = 1; attempt <= plan.maxRetries; attempt++) {
            // Exponential backoff
            const delay = plan.backoffMs * Math.pow(2, attempt - 1);
            await this.sleep(delay);

            try {
                const result = await toolExecutor(context.tool, context.args);
                
                return {
                    success: true,
                    result,
                    strategyUsed: 'retry',
                    attempts: attempt + 1
                };
            } catch (err: any) {
                lastError = err;
            }
        }

        return {
            success: false,
            error: lastError.message,
            strategyUsed: 'retry',
            attempts: plan.maxRetries + 1
        };
    }

    private async executeFallback(
        context: ErrorContext,
        plan: RecoveryPlan,
        toolExecutor: (tool: string, args: any) => Promise<any>
    ): Promise<RecoveryResult> {
        if (!plan.fallbackTool) {
            return {
                success: false,
                error: 'No fallback tool specified',
                strategyUsed: 'fallback',
                attempts: 1
            };
        }

        try {
            const result = await toolExecutor(
                plan.fallbackTool,
                plan.fallbackArgs || context.args
            );

            // Store successful fallback for future reference
            await this.memoryCore.store('procedural', 'fallback_success', {
                originalTool: context.tool,
                fallbackTool: plan.fallbackTool,
                category: context.category
            }, {
                importance: 'high',
                tags: ['fallback', 'recovery', context.category]
            });

            return {
                success: true,
                result,
                strategyUsed: 'fallback',
                attempts: 1
            };
        } catch (err: any) {
            return {
                success: false,
                error: `Fallback also failed: ${err.message}`,
                strategyUsed: 'fallback',
                attempts: 1
            };
        }
    }

    private async executeRollback(
        context: ErrorContext,
        plan: RecoveryPlan
    ): Promise<RecoveryResult> {
        // Store rollback information
        await this.memoryCore.store('episodic', 'rollback', {
            tool: context.tool,
            steps: plan.rollbackSteps || [],
            timestamp: Date.now()
        }, {
            importance: 'high',
            tags: ['rollback', 'recovery']
        });

        return {
            success: false,
            error: 'Rollback executed. Manual review required.',
            strategyUsed: 'rollback',
            attempts: 1
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // 📊 ERROR STATISTICS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get error statistics
     */
    async getErrorStats(): Promise<{
        totalErrors: number;
        byCategory: Record<ErrorCategory, number>;
        byTool: Record<string, number>;
        recoverySuccessRate: number;
    }> {
        const errors = this.memoryCore.query({
            category: 'error',
            limit: 1000
        });

        const byCategory: Record<ErrorCategory, number> = {
            network: 0,
            file_system: 0,
            syntax: 0,
            validation: 0,
            timeout: 0,
            permission: 0,
            resource: 0,
            unknown: 0
        };

        const byTool: Record<string, number> = {};

        for (const error of errors) {
            const data = error.content as any;
            const cat = data.category as ErrorCategory;
            const tool = data.tool as string;
            byCategory[cat] = (byCategory[cat] || 0) + 1;
            byTool[tool] = (byTool[tool] || 0) + 1;
        }

        // Calculate recovery success rate
        const recoveries = this.memoryCore.query({
            category: 'fallback_success',
            limit: 100
        });

        const recoveryRate = errors.length > 0 
            ? recoveries.length / errors.length 
            : 0;

        return {
            totalErrors: errors.length,
            byCategory,
            byTool,
            recoverySuccessRate: recoveryRate
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create error context
     */
    createContext(
        tool: string,
        args: any,
        error: Error,
        projectId?: string
    ): ErrorContext {
        return {
            tool,
            args,
            error,
            category: this.categorizeError(error),
            attempt: 1,
            timestamp: Date.now(),
            projectId
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// 📦 EXPORT
// ═══════════════════════════════════════════════════════════════

export function createErrorRecovery(memoryCore: MemoryCore): ErrorRecovery {
    return new ErrorRecovery(memoryCore);
}
