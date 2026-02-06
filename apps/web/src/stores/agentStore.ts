import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════
// 🤖 AGENT STORE
// Manages agent state, logs, steps, and errors
// ═══════════════════════════════════════════════════════════════

export interface AgentStep {
    id: string;
    name: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    description?: string;
    startedAt?: Date;
    completedAt?: Date;
}

export interface LogEntry {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'thinking' | 'code';
    message: string;
    timestamp: string;
    file?: string;
    line?: number;
    details?: string;
}

export interface ErrorEntry {
    id: string;
    type: 'error' | 'warning';
    message: string;
    file?: string;
    line?: number;
    suggestion?: string;
    timestamp: string;
    recoverable?: boolean;
}

export interface AgentState {
    // State
    isThinking: boolean;
    isConnected: boolean;
    currentStep: number;
    steps: AgentStep[];
    logs: LogEntry[];
    errors: ErrorEntry[];

    // Actions
    setConnected: (connected: boolean) => void;
    setThinking: (thinking: boolean) => void;
    setCurrentStep: (step: number) => void;
    setSteps: (steps: AgentStep[]) => void;
    updateStepStatus: (stepId: string, status: AgentStep['status']) => void;
    completeAllSteps: () => void;
    addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
    updateLog: (logId: string, updates: Partial<LogEntry>) => void;
    clearLogs: () => void;
    addError: (error: Omit<ErrorEntry, 'id' | 'timestamp'>) => void;
    removeError: (errorId: string) => void;
    clearErrors: () => void;
    reset: () => void;
}

const DEFAULT_STEPS: AgentStep[] = [
    { id: 'analyze', name: 'Analyze', status: 'pending', description: 'Understanding your request' },
    { id: 'plan', name: 'Plan', status: 'pending', description: 'Creating video script' },
    { id: 'code', name: 'Build', status: 'pending', description: 'Writing components' },
    { id: 'review', name: 'Review', status: 'pending', description: 'Visual inspection' },
];

const initialAgentState = {
    isThinking: false,
    isConnected: false,
    currentStep: 0,
    steps: DEFAULT_STEPS,
    logs: [],
    errors: [],
};

export const useAgentStore = create<AgentState>()(
    devtools(
        (set, get) => ({
            ...initialAgentState,

            setConnected: (connected) => set({ isConnected: connected }),

            setThinking: (thinking) => set({ isThinking: thinking }),

            setCurrentStep: (step) => set({ currentStep: step }),

            setSteps: (steps) => set({ steps }),

            updateStepStatus: (stepId, status) => set(state => ({
                steps: state.steps.map(s =>
                    s.id === stepId
                        ? {
                            ...s,
                            status,
                            startedAt: status === 'active' ? new Date() : s.startedAt,
                            completedAt: status === 'completed' ? new Date() : s.completedAt
                        }
                        : s
                )
            })),

            completeAllSteps: () => set(state => ({
                steps: state.steps.map(s => ({
                    ...s,
                    status: 'completed' as const,
                    completedAt: new Date()
                })),
                isThinking: false
            })),

            addLog: (log) => set(state => ({
                logs: [
                    ...state.logs,
                    {
                        ...log,
                        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: new Date().toLocaleTimeString(),
                    }
                ].slice(-100) // Keep last 100 logs
            })),

            updateLog: (logId, updates) => set(state => ({
                logs: state.logs.map(log =>
                    log.id === logId ? { ...log, ...updates } : log
                )
            })),

            clearLogs: () => set({ logs: [] }),

            addError: (error) => set(state => ({
                errors: [
                    ...state.errors,
                    {
                        ...error,
                        id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: new Date().toLocaleTimeString(),
                    }
                ]
            })),

            removeError: (errorId) => set(state => ({
                errors: state.errors.filter(e => e.id !== errorId)
            })),

            clearErrors: () => set({ errors: [] }),

            reset: () => set({
                ...initialAgentState,
                steps: DEFAULT_STEPS.map(s => ({ ...s, status: 'pending' as const }))
            }),
        }),
        { name: 'AgentStore' }
    )
);
